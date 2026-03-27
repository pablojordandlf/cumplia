# Templates Architecture - Risk & Custom Fields

## Overview

Cumplia supports two types of templates:
1. **Risk Templates** - Predefined sets of risks applicable to systems by AI Act risk level
2. **Custom Field Templates** - Custom fields that can be added to systems by organization

Both follow the same organizational scoping rules:

## Template Types

### System Templates (Default, Read-Only)
- Created by system administrators during setup
- Available to **all users** across all organizations
- **Cannot be edited or deleted** by users
- Marked with `is_system: true` (risk templates) or `is_default: true` (custom fields)
- Identified by `is_editable: false`

### Organization Templates (Custom, Editable)
- Created by organization members (with appropriate permissions)
- Available **only to members of that organization**
- **Can be edited and deleted** by organization members
- Linked to `organization_id` in the database
- Marked with `is_system: false` / `is_default: false`
- Identified by `is_editable: true`

## Risk Templates

### Data Model

```sql
risk_templates {
  id: uuid PRIMARY KEY
  name: text                          -- e.g., "Riesgos Alto Riesgo"
  description: text
  ai_act_level: text                  -- 'high_risk', 'limited_risk', 'minimal_risk'
  applies_to_levels: text[]           -- ["high_risk"], ["limited_risk", "minimal_risk"]
  is_system: boolean                  -- true for system templates
  is_default: boolean                 -- true for default/read-only
  is_editable: boolean                -- false for system/default
  is_active: boolean                  -- soft delete support
  organization_id: uuid FK            -- NULL for personal, org_id for org templates
  created_by: uuid FK                 -- Creator
  created_at: timestamptz
  updated_at: timestamptz
}

risk_template_items {
  id: uuid PRIMARY KEY
  template_id: uuid FK
  catalog_risk_id: uuid FK
  is_required: boolean                -- If risk must be included
}
```

### Risk Level Scoping

Templates are associated with one or more AI Act risk levels:

- **System Default Templates:**
  - "Riesgos Alto Riesgo" → applies to systems with `ai_act_level: 'high_risk'`
  - "Riesgos Limitado/Mínimo" → applies to systems with `ai_act_level: ['limited_risk', 'minimal_risk']`

- **Custom Organization Templates:**
  - Each custom template specifies `applies_to_levels: ['risk_level']`
  - Multiple templates can apply to the same risk level
  - Users can choose which applicable template to use when assessing a system

### Usage Flow

```
1. User creates AI System with ai_act_level = 'high_risk'
   ↓
2. System queries: get_templates_by_risk_level('high_risk', org_id)
   ↓
3. Returns:
   - System template: "Riesgos Alto Riesgo" (is_editable: false)
   - Organization templates for high_risk (is_editable: true)
   ↓
4. User selects which template to use as basis for risk assessment
   ↓
5. Selected risks from template populate ai_system_risks table
```

### API Endpoints for Risk Templates

```
GET /api/v1/risks/templates?risk_level=high_risk
  Returns templates applicable to that risk level
  - System templates always included
  - Organization templates for user's org

GET /api/v1/risks/templates/:id
  Get template details + list of risks

POST /api/v1/risks/templates
  Create new custom template (only for organization members)
  Required: { name, description, applies_to_levels, risk_ids }

PUT /api/v1/risks/templates/:id
  Update template (only if is_editable: true)

DELETE /api/v1/risks/templates/:id
  Delete template (only if is_editable: true)

POST /api/v1/risks/templates/:id/duplicate
  Clone an existing template (system or org)
  - If cloning system template → creates org template
  - If cloning org template → creates new org template for same org
```

## Custom Field Templates

### Data Model

```sql
custom_field_templates {
  id: uuid PRIMARY KEY
  name: text
  description: text
  applies_to: text                    -- 'global', 'prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'gpai', 'unclassified'
  field_definitions: jsonb            -- [{"id": "uuid", "key": "Field Name", "type": "text|select|date"}]
  is_default: boolean                 -- true for system defaults
  is_active: boolean
  organization_id: uuid FK            -- NULL for personal, org_id for org templates
  user_id: uuid FK                    -- Creator (may differ from org member if personal)
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Field Definition Schema

```json
{
  "field_definitions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "key": "Responsable",
      "type": "text",
      "required": false,
      "options": []
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "key": "URL del Sistema",
      "type": "text",
      "required": true,
      "options": []
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "key": "Proveedor",
      "type": "select",
      "required": false,
      "options": ["Internal", "Third-party", "Hybrid"]
    }
  ]
}
```

### Usage Flow

```
1. User views/edits AI System details
   ↓
2. System checks: get_custom_field_templates_by_level(ai_act_level, org_id)
   ↓
3. Shows:
   - System default templates for that level (read-only, padlock icon)
   - Organization templates (editable, pencil icon)
   ↓
4. User can:
   - Apply default template (adds read-only custom fields)
   - Use org template (adds editable fields)
   - Create new template from scratch
   ↓
5. Custom field values stored in ai_system_custom_fields table
```

### API Endpoints for Custom Field Templates

```
GET /api/v1/custom-field-templates?applies_to=high_risk
  Returns templates for that risk level
  - System defaults included
  - Organization templates for user's org

GET /api/v1/custom-field-templates/:id
  Get template + field definitions

POST /api/v1/custom-field-templates
  Create new template
  Required: { name, applies_to, field_definitions }

PUT /api/v1/custom-field-templates/:id
  Update template (only if is_default: false)

DELETE /api/v1/custom-field-templates/:id
  Delete template (only if is_default: false)

POST /api/v1/custom-field-templates/:id/duplicate
  Clone a template
```

## RLS (Row Level Security) Implementation

### Risk Templates RLS

**SELECT (View):**
```sql
-- System templates visible to everyone
is_system = true
-- OR templates from user's organization
OR organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND status = 'active'
)
-- OR personal templates created by user
OR created_by = auth.uid()
```

**INSERT (Create):**
```sql
-- Must be member of organization creating template, OR creating personal template
(
  organization_id IS NOT NULL 
  AND organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
)
OR (organization_id IS NULL AND created_by = auth.uid())
```

**UPDATE (Edit):**
```sql
-- Only custom templates (is_editable: true)
is_editable = true
AND (
  -- Creator of personal template
  (organization_id IS NULL AND created_by = auth.uid())
  -- OR member of organization
  OR (
    organization_id IS NOT NULL 
    AND organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
)
```

**DELETE (Remove):**
```sql
-- Same as UPDATE - only custom templates
```

### Custom Field Templates RLS

Same logic as risk templates, using `is_default` instead of `is_system`.

## UI/UX Design Patterns

### Template Selection Modal

When user is setting up risk/custom fields for a system:

```
┌─────────────────────────────────────────┐
│ Select Risk Assessment Template         │
├─────────────────────────────────────────┤
│                                         │
│ System Templates (Read-only)            │
│ ────────────────────────────────────    │
│ ☐ Riesgos Alto Riesgo                   │
│   Plantilla pre-configurada de MIT...   │
│   [🔒 System] [Use] [Clone]             │
│                                         │
│ Organization Templates (Your Org)       │
│ ────────────────────────────────────    │
│ ☐ Custom High Risk v1                   │
│   Subset con solo riesgos críticos      │
│   [✏️ Edit] [Use] [Delete]              │
│                                         │
│ ☐ Custom High Risk v2                   │
│   ...                                   │
│                                         │
│ [Create New Template]                   │
│                                         │
│             [Use Selected] [Cancel]     │
└─────────────────────────────────────────┘
```

### Template Management Page (/dashboard/admin/templates)

```
Risk Templates Section
├─ System Templates (Collapsed, Read-only)
│  └─ Riesgos Alto Riesgo 🔒
│     Riesgos Limitado/Mínimo 🔒
├─ Your Organization's Templates
│  ├─ [+ New Template]
│  ├─ Template A [Edit] [Clone] [Delete]
│  ├─ Template B [Edit] [Clone] [Delete]
│  └─ Template C [Edit] [Clone] [Delete]

Custom Field Templates Section
├─ System Templates (Collapsed, Read-only)
│  └─ Default Fields for [Risk Level] 🔒
├─ Your Organization's Templates
│  ├─ [+ New Template]
│  ├─ Template X [Edit] [Clone] [Delete]
│  └─ Template Y [Edit] [Clone] [Delete]
```

## Organization Isolation Guarantees

1. **Query-time filtering:** RLS policies filter at database level
2. **Soft delete:** Templates can be disabled without deletion
3. **Audit trail:** creator_id and created_at track all templates
4. **Permission checking:** organization_members table gates access

### Example: Org A Cannot Access Org B Templates

```
Org A User queries: GET /api/v1/risks/templates
→ RLS automatically filters to:
  - All system templates (is_system: true)
  - Only Org A templates (organization_id = Org A ID)
→ Org B templates never returned
→ No N+1 queries needed
```

## Migration Path

Existing templates in the system:

1. **System defaults** created during setup:
   - Already marked `is_system: true`, `is_default: true`, `is_editable: false`
   - Migrated to have `applies_to_levels: ['risk_level']`

2. **Personal user templates** (old):
   - Migrated with `organization_id: NULL`, `created_by: user_id`, `is_editable: true`

3. **Organization templates** (going forward):
   - `organization_id: org_id`, `created_by: user_id`, `is_editable: true`
   - Can only be created by members of that organization

## Best Practices

### For Backend Developers

1. **Always use organization_id filter** when querying templates:
   ```ts
   const templates = await get_templates_by_risk_level(risk_level, org_id);
   ```

2. **Never assume is_editable without checking:**
   ```ts
   if (template.is_editable) {
     // Allow user to edit
   } else {
     // Show read-only view with padlock
   }
   ```

3. **Use helper functions:** `get_templates_by_risk_level()` and `get_custom_field_templates_by_level()`

### For Frontend Developers

1. **Visual distinction:** 
   - System templates: Padlock icon 🔒, gray background
   - Org templates: Pencil icon ✏️, highlighted background

2. **Clone affordance:** Always show [Clone] button even for read-only templates

3. **Delete confirmation:** Only show [Delete] if `is_editable: true`

4. **Breadcrumb context:** Show "Organization Templates" vs "Personal Templates" label

## Future Enhancements

- [ ] Template versioning (track template edits over time)
- [ ] Template sharing between organizations (with explicit permission)
- [ ] Template marketplace (community templates)
- [ ] A/B testing different templates across org systems
- [ ] Template recommendation engine based on sector/system type
