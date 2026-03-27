# Templates System - Executive Summary

**Completed:** 2026-03-27

## What Changed

### UI/UX Updates (Completed)
✅ Removed global search bar from navbar
✅ Standardized "Templates" button in inventory page (same size as "+ Añadir Sistema")
✅ Added "Editar Templates" option to user menu (click on avatar in navbar)
✅ Removed flashy button from dashboard (cleaner design)

### Template Architecture (Designed & Documented)

#### Two Types of Templates

1. **System Templates (Default, Read-Only)**
   - Created by admins during setup
   - Available to **all users across all organizations**
   - Examples: "Riesgos Alto Riesgo", "Default Fields for High Risk"
   - **Cannot be edited or deleted** - locked with 🔒 icon
   - Marked `is_system: true`, `is_editable: false`

2. **Organization Templates (Custom, Editable)**
   - Created by organization members
   - Available **only to members of that organization**
   - Can be edited and deleted by org members
   - Marked `is_system: false`, `is_editable: true`

#### Organization Isolation Guarantee

- **At database level:** RLS (Row Level Security) policies automatically filter templates
- **Org A cannot see Org B templates** - enforced by SQL, no code needed
- **No N+1 queries** - helper functions handle filtering
- **Secure by default** - no way to bypass even with direct API calls

#### Risk Level Scoping

Templates apply to specific AI Act risk levels:

```
System defaults:
- "Riesgos Alto Riesgo"            → applies to: high_risk
- "Riesgos Limitado/Mínimo"        → applies to: limited_risk, minimal_risk

Organization custom:
- User can create templates for any risk level
- When setting up a system, user sees ALL applicable templates for that risk level
- User picks which template to use as basis for their assessment
```

Example: System with `ai_act_level: 'high_risk'` sees:
1. System default: "Riesgos Alto Riesgo" 🔒
2. Org custom template 1: "Riesgos HR Versión 1" ✏️
3. Org custom template 2: "Riesgos HR Versión 2" ✏️

User selects one, risks populate from that template.

#### Two Template Domains

1. **Risk Templates**
   - Define which risks apply to systems by risk level
   - Each template has: name, description, applies_to_levels[], list of risks
   - Stored in `risk_templates` + `risk_template_items` tables

2. **Custom Field Templates**
   - Define custom fields for systems (beyond default fields)
   - Each template has: name, description, applies_to level, field definitions
   - Stored in `custom_field_templates` table

---

## Implementation Status

### ✅ Completed
- [x] UI/UX changes (templates button, menu option)
- [x] Database schema designed (columns added: `organization_id`, `is_editable`, `is_default`)
- [x] RLS policies defined (organization scoping at SQL level)
- [x] Helper functions created (`get_templates_by_risk_level()`, `get_custom_field_templates_by_level()`)
- [x] Migration file written: `20260327_update_template_visibility_and_permissions.sql`
- [x] Architecture documentation complete: `TEMPLATES_ARCHITECTURE.md`
- [x] Implementation guide complete: `IMPLEMENTATION_TEMPLATES_SYSTEM.md`

### 📋 Next Steps (Backend Developer)
1. **Apply database migration:**
   ```bash
   supabase migration up
   ```

2. **Create API endpoints** in `apps/api/routers/`:
   - `GET /api/v1/risks/templates?risk_level=X`
   - `GET /api/v1/risks/templates/{id}`
   - `POST /api/v1/risks/templates` (create)
   - `PUT /api/v1/risks/templates/{id}` (update)
   - `DELETE /api/v1/risks/templates/{id}` (delete)
   - `POST /api/v1/risks/templates/{id}/duplicate` (clone)
   - Same pattern for `/api/v1/custom-field-templates`

   See `IMPLEMENTATION_TEMPLATES_SYSTEM.md` for complete code examples.

3. **Test organization isolation:**
   - Create templates as User in Org A
   - Login as User in Org B
   - Verify Org B templates don't appear
   - Verify system templates always visible

### 📋 Next Steps (Frontend Developer)
1. **Create templates admin page** at `/dashboard/admin/templates`
   - Tab 1: Risk Templates
   - Tab 2: Custom Field Templates
   - Each shows: System templates (read-only) + Org templates (editable)
   - Buttons: [Create], [Edit], [Delete], [Clone]

2. **Create template selection modal**
   - When user creates/edits AI system
   - Shows templates applicable to that risk level
   - User selects which template to use

3. **Add visual indicators:**
   - 🔒 Lock icon for system/default templates
   - ✏️ Pencil icon for editable org templates
   - Gray background for read-only
   - Blue/highlighted for editable

See `IMPLEMENTATION_TEMPLATES_SYSTEM.md` for React component examples.

---

## Key Technical Points

### RLS (Row Level Security) Magic

```sql
-- SELECT policy (simplified)
WHERE
  is_system = true  -- Everyone sees system templates
  OR organization_id IN (  -- User sees their org templates
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
  OR created_by = auth.uid()  -- User sees their personal templates
```

**Result:** Automatic filtering at database level. No need to check permissions in code.

### Helper Functions

Instead of complex WHERE clauses, use:

```python
# Backend
templates = db.execute(
    "SELECT * FROM get_templates_by_risk_level(:risk, :org)",
    {"risk": "high_risk", "org": org_id}
).fetchall()

# Frontend
const templates = await fetch(
  '/api/v1/risks/templates?risk_level=high_risk'
).then(r => r.json())
```

### Data Structure

**Risk Template:**
```json
{
  "id": "uuid",
  "name": "Riesgos Alto Riesgo",
  "description": "...",
  "is_system": true,
  "is_editable": false,
  "organization_id": null,
  "applies_to_levels": ["high_risk"],
  "risks": [
    {"id": "risk-1", "name": "Bias in training data", "is_required": true},
    {"id": "risk-2", "name": "..."}
  ]
}
```

**Custom Field Template:**
```json
{
  "id": "uuid",
  "name": "Default Fields for High Risk",
  "description": "...",
  "is_default": true,
  "organization_id": null,
  "applies_to": "high_risk",
  "field_definitions": [
    {
      "id": "uuid",
      "key": "Responsable",
      "type": "text",
      "required": false
    }
  ]
}
```

---

## Organization Scoping Examples

### Scenario 1: User in Org A Views Templates

```
API Call: GET /api/v1/risks/templates?risk_level=high_risk

Returns:
✅ System template "Riesgos Alto Riesgo" (is_system: true)
✅ Org A's "Custom High Risk v1" (organization_id: org_a_id)
✅ Org A's "Custom High Risk v2" (organization_id: org_a_id)
❌ Org B's "Custom High Risk" (hidden by RLS)
```

### Scenario 2: User Tries to Edit System Template

```
PUT /api/v1/risks/templates/{system_template_id}
{
  "name": "My New Name"
}

Result: 403 Forbidden
Reason: is_editable = false
Message: "System templates cannot be edited"
```

### Scenario 3: User Clones System Template

```
POST /api/v1/risks/templates/{system_template_id}/duplicate

Result:
{
  "id": "new-uuid",
  "name": "Riesgos Alto Riesgo (Copy)",
  "is_system": false,
  "is_editable": true,
  "organization_id": "org_a_id",  // Automatically set to user's org
  "created_by": "user_id"
}
```

---

## Files & References

### Documentation
- `docs/TEMPLATES_ARCHITECTURE.md` - Complete architecture spec
- `docs/IMPLEMENTATION_TEMPLATES_SYSTEM.md` - Step-by-step implementation guide
- `TEMPLATES_SUMMARY.md` - This file (executive summary)

### Database
- `supabase/migrations/20260327_update_template_visibility_and_permissions.sql`
  - Adds: `is_editable` to risk_templates
  - Adds: `organization_id`, `is_default` to custom_field_templates
  - Creates: RLS policies for organization scoping
  - Creates: Helper functions for filtering

### API (To Be Implemented)
- `apps/api/routers/risk_templates.py` (new file)
- `apps/api/routers/custom_field_templates.py` (new file)

### Frontend (To Be Implemented)
- `app/(dashboard)/admin/templates/page.tsx` (new file)
- `components/templates/template-card.tsx` (new file)
- `components/templates/template-selection-modal.tsx` (new file)

---

## Testing Checklist

When implementation is complete:

- [ ] System templates show with lock icon
- [ ] User cannot edit/delete system templates
- [ ] User can create org templates
- [ ] Org templates show edit/delete buttons
- [ ] Org A user cannot see Org B templates
- [ ] Cloning system template creates org template
- [ ] Risk level filtering works
- [ ] Helper functions return correct results
- [ ] RLS prevents SQL injection via direct queries
- [ ] Performance: <100ms for template queries

---

## Summary

✅ **UI/UX:** Clean, modern interface with templates in user menu  
✅ **Architecture:** Organization-scoped templates with system defaults  
✅ **Security:** RLS-enforced at database level, no org cross-contamination  
✅ **Risk Levels:** Templates apply to specific AI Act risk levels  
✅ **Documentation:** Complete specs + implementation guide ready  

**Status:** Ready for backend & frontend development 🚀
