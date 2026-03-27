# Implementation Guide: Template System (Risk + Custom Fields)

## Overview

This guide details the implementation steps to move the template system from design to production. The architecture is defined in `TEMPLATES_ARCHITECTURE.md`.

## Phase 1: Database & RLS Setup ✅

**Status:** Ready to execute

### Steps

1. **Apply migration:**
   ```bash
   supabase migration up
   ```
   This will:
   - Add `is_editable` column to `risk_templates`
   - Add `organization_id` and `is_default` columns to `custom_field_templates`
   - Drop old RLS policies and create new ones
   - Create helper functions: `get_templates_by_risk_level()`, `get_custom_field_templates_by_level()`

2. **Verify:**
   ```sql
   -- Check risk_templates structure
   SELECT * FROM risk_templates LIMIT 1;
   
   -- Check custom_field_templates structure
   SELECT * FROM custom_field_templates LIMIT 1;
   
   -- Test helper functions
   SELECT * FROM get_templates_by_risk_level('high_risk', 'org-uuid');
   SELECT * FROM get_custom_field_templates_by_level('high_risk', 'org-uuid');
   ```

### Important Notes

- RLS policies are **automatically enforced** - no frontend permission checks needed
- Helper functions use `SECURITY DEFINER` to work with RLS
- Existing system templates (`is_system: true`) automatically marked `is_editable: false`

---

## Phase 2: Backend API Endpoints

### Risk Templates Endpoints

**File:** `apps/api/routers/risk_templates.py` (create if not exists)

#### GET /api/v1/risks/templates

**Purpose:** List templates applicable to a risk level

```python
@router.get("/api/v1/risks/templates", tags=["risks"])
async def get_templates_by_risk_level(
    risk_level: str = Query(..., description="high_risk, limited_risk, minimal_risk"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Returns templates applicable to risk level, filtered by:
    - Organization ID (from user's org membership)
    - Risk level (applies_to_levels contains risk_level)
    """
    # Get user's organization
    user_org = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user.id,
        OrganizationMember.status == "active"
    ).first()
    
    org_id = user_org.organization_id if user_org else None
    
    # Call helper function (RLS applies automatically)
    templates = db.execute(
        text("""
        SELECT * FROM get_templates_by_risk_level(:risk_level, :org_id)
        """),
        {"risk_level": risk_level, "org_id": org_id}
    ).fetchall()
    
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "is_system": t.is_system,
            "is_editable": t.is_editable,
            "created_by": t.created_by,
            "applies_to_levels": t.applies_to_levels,
            "created_at": t.created_at,
        }
        for t in templates
    ]
```

#### GET /api/v1/risks/templates/{id}

**Purpose:** Get template details + list of risks

```python
@router.get("/api/v1/risks/templates/{template_id}", tags=["risks"])
async def get_template_details(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Returns template with all risks + metadata
    RLS ensures user can only access:
    - System templates
    - Their org's templates
    - Their personal templates
    """
    template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # RLS automatically filters unauthorized access
    # Get risks in template
    risks = db.query(RiskTemplatItem).filter(
        RiskTemplatItem.template_id == template_id
    ).all()
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "is_system": template.is_system,
        "is_editable": template.is_editable,
        "organization_id": template.organization_id,
        "applies_to_levels": template.applies_to_levels,
        "risks": [
            {
                "id": risk.catalog_risk_id,
                "name": risk.catalog_risk.name,
                "is_required": risk.is_required
            }
            for risk in risks
        ],
        "created_at": template.created_at,
        "updated_at": template.updated_at,
    }
```

#### POST /api/v1/risks/templates

**Purpose:** Create new organization template

```python
class RiskTemplateCreate(BaseModel):
    name: str
    description: Optional[str]
    applies_to_levels: List[str]  # ["high_risk"], ["limited_risk", "minimal_risk"]
    risk_ids: List[UUID]  # IDs from risk_catalog

@router.post("/api/v1/risks/templates", tags=["risks"])
async def create_template(
    data: RiskTemplateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Create custom template for user's organization
    """
    # Get user's organization
    user_org = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user.id,
        OrganizationMember.status == "active"
    ).first()
    
    if not user_org:
        raise HTTPException(status_code=403, detail="No organization found")
    
    # Create template
    template = RiskTemplate(
        name=data.name,
        description=data.description,
        ai_act_level=data.applies_to_levels[0],  # First level for compatibility
        applies_to_levels=data.applies_to_levels,
        is_system=False,
        is_editable=True,
        organization_id=user_org.organization_id,
        created_by=user.id
    )
    db.add(template)
    db.flush()
    
    # Add risks
    for risk_id in data.risk_ids:
        item = RiskTemplateItem(
            template_id=template.id,
            catalog_risk_id=risk_id,
            is_required=True
        )
        db.add(item)
    
    db.commit()
    
    return {
        "id": template.id,
        "name": template.name,
        "organization_id": template.organization_id,
        "created_at": template.created_at
    }
```

#### PUT /api/v1/risks/templates/{id}

**Purpose:** Update custom template (only if editable)

```python
class RiskTemplateUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    applies_to_levels: Optional[List[str]]
    risk_ids: Optional[List[UUID]]

@router.put("/api/v1/risks/templates/{template_id}", tags=["risks"])
async def update_template(
    template_id: UUID,
    data: RiskTemplateUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Update template - only allowed if is_editable = true
    RLS prevents non-owners from accessing
    """
    template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.is_editable:
        raise HTTPException(status_code=403, detail="System templates cannot be edited")
    
    # Update fields
    if data.name:
        template.name = data.name
    if data.description is not None:
        template.description = data.description
    if data.applies_to_levels:
        template.applies_to_levels = data.applies_to_levels
    
    # Update risks if provided
    if data.risk_ids is not None:
        # Delete old items
        db.query(RiskTemplateItem).filter(
            RiskTemplateItem.template_id == template_id
        ).delete()
        
        # Add new items
        for risk_id in data.risk_ids:
            item = RiskTemplateItem(
                template_id=template_id,
                catalog_risk_id=risk_id,
                is_required=True
            )
            db.add(item)
    
    db.commit()
    
    return {"id": template.id, "updated_at": template.updated_at}
```

#### DELETE /api/v1/risks/templates/{id}

**Purpose:** Delete custom template

```python
@router.delete("/api/v1/risks/templates/{template_id}", tags=["risks"])
async def delete_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Delete template - only if is_editable = true
    """
    template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.is_editable:
        raise HTTPException(status_code=403, detail="Cannot delete system templates")
    
    db.delete(template)
    db.commit()
    
    return {"status": "deleted"}
```

#### POST /api/v1/risks/templates/{id}/duplicate

**Purpose:** Clone a template (system or org)

```python
@router.post("/api/v1/risks/templates/{template_id}/duplicate", tags=["risks"])
async def duplicate_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Clone template - system templates become org templates
    """
    source_template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id
    ).first()
    
    if not source_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Get user's org
    user_org = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user.id,
        OrganizationMember.status == "active"
    ).first()
    
    if not user_org:
        raise HTTPException(status_code=403, detail="No organization found")
    
    # Create new template
    new_template = RiskTemplate(
        name=f"{source_template.name} (Copy)",
        description=source_template.description,
        ai_act_level=source_template.ai_act_level,
        applies_to_levels=source_template.applies_to_levels,
        is_system=False,
        is_editable=True,
        organization_id=user_org.organization_id,
        created_by=user.id
    )
    db.add(new_template)
    db.flush()
    
    # Copy risks
    source_risks = db.query(RiskTemplateItem).filter(
        RiskTemplateItem.template_id == template_id
    ).all()
    
    for source_risk in source_risks:
        item = RiskTemplateItem(
            template_id=new_template.id,
            catalog_risk_id=source_risk.catalog_risk_id,
            is_required=source_risk.is_required
        )
        db.add(item)
    
    db.commit()
    
    return {
        "id": new_template.id,
        "name": new_template.name,
        "organization_id": new_template.organization_id
    }
```

### Custom Field Templates Endpoints

**File:** `apps/api/routers/custom_field_templates.py` (create if not exists)

Follow same pattern as risk templates, but:
- Use `get_custom_field_templates_by_level()` helper
- Filter by `applies_to` instead of `applies_to_levels`
- Include `field_definitions` JSONB in responses

---

## Phase 3: Frontend Components

### 1. Templates Admin Page

**File:** `app/(dashboard)/admin/templates/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthReady } from '@/lib/auth-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateGrid } from '@/components/templates/template-grid';
import { CreateTemplateModal } from '@/components/templates/create-template-modal';

export default function TemplatesPage() {
  const { user, isReady } = useAuthReady();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      fetchTemplates();
    }
  }, [isReady, user]);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const [riskRes, customRes] = await Promise.all([
        fetch('/api/v1/risks/templates'),
        fetch('/api/v1/custom-field-templates')
      ]);
      
      const riskTemplates = await riskRes.json();
      const customTemplates = await customRes.json();
      
      setTemplates({ risk: riskTemplates, custom: customTemplates });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isReady) return <div>Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestionar Plantillas</h1>
      
      <Tabs defaultValue="risk" className="w-full">
        <TabsList>
          <TabsTrigger value="risk">Plantillas de Riesgos</TabsTrigger>
          <TabsTrigger value="custom">Campos Personalizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk" className="mt-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Plantillas de Riesgos</h2>
            <CreateTemplateModal 
              type="risk" 
              onSuccess={fetchTemplates}
            />
          </div>
          <TemplateGrid 
            templates={templates.risk}
            type="risk"
            onDelete={fetchTemplates}
          />
        </TabsContent>
        
        <TabsContent value="custom" className="mt-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Campos Personalizados</h2>
            <CreateTemplateModal 
              type="custom" 
              onSuccess={fetchTemplates}
            />
          </div>
          <TemplateGrid 
            templates={templates.custom}
            type="custom"
            onDelete={fetchTemplates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 2. Template Card Component

**File:** `components/templates/template-card.tsx`

```tsx
import { Lock, Edit3, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TemplateCard({ template, type, onDelete }) {
  const isReadOnly = template.is_editable === false;
  
  return (
    <div className={`p-4 rounded-lg border ${
      isReadOnly 
        ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800' 
        : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{template.name}</h3>
          {isReadOnly && (
            <Lock className="w-4 h-4 text-gray-400" title="System template (read-only)" />
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {template.description}
      </p>
      
      <div className="flex gap-2">
        {!isReadOnly && (
          <>
            <Button size="sm" variant="outline">
              <Edit3 className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(template.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </>
        )}
        <Button size="sm" variant="outline">
          <Copy className="w-4 h-4 mr-1" />
          Clonar
        </Button>
      </div>
    </div>
  );
}
```

### 3. Template Selection Modal

**File:** `components/templates/template-selection-modal.tsx`

Used when user is creating/editing a system and needs to select templates:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TemplateCard } from './template-card';
import { Button } from '@/components/ui/button';

export function TemplateSelectionModal({ riskLevel, open, onSelect, onClose }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (open) {
      fetch(`/api/v1/risks/templates?risk_level=${riskLevel}`)
        .then(r => r.json())
        .then(setTemplates);
    }
  }, [open, riskLevel]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Selecciona una plantilla de riesgos para {riskLevel}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {templates.map(template => (
            <div key={template.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex-1">
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <Button onClick={() => onSelect(template.id)}>
                Usar
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Phase 4: Integration Points

### When Creating New AI System

1. User selects risk level (high_risk, limited_risk, etc.)
2. System queries: `GET /api/v1/risks/templates?risk_level=X`
3. Show modal with applicable templates
4. User selects template
5. Risks from template populate `ai_system_risks` table

### When Creating Custom Field

1. User navigates to system details
2. System queries: `GET /api/v1/custom-field-templates?applies_to=X`
3. Show available templates
4. User can apply template or create custom fields manually
5. Custom fields stored in `ai_system_custom_fields` table

---

## Phase 5: Testing Checklist

- [ ] System template shows with lock icon and cannot be edited
- [ ] Org templates show with edit/delete buttons
- [ ] Creating template as Org A doesn't appear for Org B
- [ ] Cloning system template creates org template
- [ ] Risk level filtering works correctly
- [ ] Soft delete (is_active: false) hides templates
- [ ] RLS prevents unauthorized access via direct queries

---

## Key Files

- **Backend:** `apps/api/routers/risk_templates.py`, `custom_field_templates.py`
- **Frontend:** `app/(dashboard)/admin/templates/page.tsx`
- **Components:** `components/templates/` folder
- **Database:** `supabase/migrations/20260327_*.sql`
- **Docs:** `docs/TEMPLATES_ARCHITECTURE.md` (architecture reference)

---

## Deployment Notes

1. Run migration before deploying backend
2. Backend endpoints must be deployed before frontend
3. Frontend can handle missing templates gracefully
4. Monitor RLS performance with large template sets
5. Consider caching template lists (TTL: 5 minutes)
