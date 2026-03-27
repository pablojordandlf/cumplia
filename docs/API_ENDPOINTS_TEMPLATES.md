# Templates API Endpoints Documentation

## Overview

Complete REST API for managing Risk Templates and Custom Field Templates with organization-based access control and permission levels.

**Base URL:** `/api/v1/templates`

**Authentication:** All endpoints require valid JWT token via `Authorization: Bearer <token>`

---

## Risk Templates

### GET /risks
List all risk templates accessible to the current user.

**Parameters:**
- `risk_level` (optional): Filter by applicable risk level
  - Values: `high_risk`, `limited_risk`, `minimal_risk`, `prohibited`, `unclassified`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Riesgos Alto Riesgo",
    "description": "Templates for high-risk systems",
    "applies_to_levels": ["high_risk"],
    "organization_id": null,
    "is_system": true,
    "is_editable": false,
    "is_active": true,
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:00:00Z"
  }
]
```

**Permissions:**
- ✅ System templates: visible to all users
- ✅ Organization templates: visible to org members only

---

### GET /risks/{template_id}
Retrieve a specific risk template.

**URL Parameters:**
- `template_id` (required): UUID of the template

**Response:** Single risk template object (same structure as list)

**Permissions:**
- ✅ System templates: accessible to all
- ✅ Organization templates: accessible to org members only
- ❌ Other org templates: 404 Not Found

---

### POST /risks
Create a new organization-specific risk template.

**Request Body:**
```json
{
  "name": "Custom Risk Template",
  "description": "Our custom risk assessment",
  "applies_to_levels": ["high_risk", "limited_risk"]
}
```

**Response:** Created template object with:
- `is_system: false`
- `is_editable: true`
- `organization_id`: current user's organization

**Permissions:**
- ✅ Any authenticated user can create templates for their org
- ❌ System templates cannot be created via API

---

### PATCH /risks/{template_id}
Update an organization-specific risk template.

**URL Parameters:**
- `template_id` (required): UUID of the template

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "applies_to_levels": ["high_risk"]
}
```

**Response:** Updated template object

**Permissions:**
- ✅ Only editable templates can be updated (`is_editable: true`)
- ✅ Only org members can update their org's templates
- ❌ System templates (read-only) cannot be updated
- ❌ Other org templates: 404 Not Found

---

### DELETE /risks/{template_id}
Soft delete a risk template (marks as inactive).

**URL Parameters:**
- `template_id` (required): UUID of the template

**Response:**
```json
{
  "message": "Risk template deleted successfully"
}
```

**Permissions:**
- ✅ Only editable templates can be deleted
- ✅ Only org members can delete their org's templates
- ❌ System templates cannot be deleted
- ❌ Other org templates: 404 Not Found

**Effect:** Sets `is_active: false` but keeps record for audit

---

### POST /risks/{template_id}/duplicate
Create a copy of a risk template.

**URL Parameters:**
- `template_id` (required): UUID of the template to duplicate

**Response:** New template object with:
- `name`: "{original_name} (copy)"
- `organization_id`: current user's organization
- `is_editable: true`
- All other fields copied from original

**Permissions:**
- ✅ Can duplicate system templates or accessible org templates
- ✅ Duplicate created in user's org
- ❌ Cannot duplicate templates from other orgs
- ❌ Cannot duplicate non-existent templates: 404

---

## Custom Field Templates

### GET /custom-fields
List all custom field templates accessible to the current user.

**Parameters:**
- `risk_level` (optional): Filter by applicable risk level

**Response:**
```json
[
  {
    "id": "uuid",
    "field_name": "Vendor Assessment",
    "field_type": "select",
    "description": "Assess vendor compliance level",
    "is_required": true,
    "options": ["Low Risk", "Medium Risk", "High Risk"],
    "applies_to_levels": ["high_risk"],
    "organization_id": null,
    "is_default": true,
    "is_active": true,
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:00:00Z"
  }
]
```

**Permissions:**
- ✅ Default templates: visible to all users
- ✅ Organization templates: visible to org members only

---

### GET /custom-fields/{template_id}
Retrieve a specific custom field template.

**URL Parameters:**
- `template_id` (required): UUID of the template

**Response:** Single custom field template object

**Permissions:**
- ✅ Default templates: accessible to all
- ✅ Organization templates: accessible to org members only
- ❌ Other org templates: 404 Not Found

---

### POST /custom-fields
Create a new organization-specific custom field template.

**Request Body:**
```json
{
  "field_name": "Data Protection Officer",
  "field_type": "text",
  "description": "Contact information for DPO",
  "is_required": true,
  "options": null,
  "applies_to_levels": ["high_risk", "limited_risk"]
}
```

**Field Types:**
- `text`: Text input
- `number`: Numeric input
- `select`: Dropdown with options (requires `options` array)
- `date`: Date picker
- `textarea`: Multi-line text
- `checkbox`: Boolean field

**Response:** Created template object with:
- `is_default: false`
- `organization_id`: current user's organization

**Permissions:**
- ✅ Any authenticated user can create templates for their org
- ❌ Default templates cannot be created via API

---

### PATCH /custom-fields/{template_id}
Update an organization-specific custom field template.

**URL Parameters:**
- `template_id` (required): UUID of the template

**Request Body:** Any subset of creation fields
```json
{
  "field_name": "Updated Field Name",
  "is_required": false
}
```

**Response:** Updated template object

**Permissions:**
- ✅ Only custom (non-default) templates can be updated
- ✅ Only org members can update their org's templates
- ❌ Default templates (read-only) cannot be updated
- ❌ Other org templates: 404 Not Found

---

### DELETE /custom-fields/{template_id}
Soft delete a custom field template (marks as inactive).

**URL Parameters:**
- `template_id` (required): UUID of the template

**Response:**
```json
{
  "message": "Custom field template deleted successfully"
}
```

**Permissions:**
- ✅ Only custom (non-default) templates can be deleted
- ✅ Only org members can delete their org's templates
- ❌ Default templates cannot be deleted
- ❌ Other org templates: 404 Not Found

**Effect:** Sets `is_active: false` but keeps record for audit

---

### POST /custom-fields/{template_id}/duplicate
Create a copy of a custom field template.

**URL Parameters:**
- `template_id` (required): UUID of the template to duplicate

**Response:** New template object with:
- `field_name`: "{original_name} (copy)"
- `organization_id`: current user's organization
- `is_default: false`
- All other fields copied from original

**Permissions:**
- ✅ Can duplicate default templates or accessible org templates
- ✅ Duplicate created in user's org
- ❌ Cannot duplicate templates from other orgs
- ❌ Cannot duplicate non-existent templates: 404

---

## Error Responses

### 400 Bad Request
Invalid request format or missing required fields.

```json
{
  "detail": "Validation error description"
}
```

### 401 Unauthorized
Missing or invalid authentication token.

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
User lacks permission to perform operation.

```json
{
  "detail": "Access denied"
}
```

### 404 Not Found
Template not found or not accessible to user.

```json
{
  "detail": "Risk template not found"
}
```

### 500 Internal Server Error
Server-side error during operation.

```json
{
  "detail": "Internal server error"
}
```

---

## Testing Guide

### Test 1: List System Templates
```bash
curl -X GET http://localhost:8000/api/v1/templates/risks \
  -H "Authorization: Bearer <token>"
```

**Expected:** Returns all system templates (is_system: true)

---

### Test 2: Create Organization Template
```bash
curl -X POST http://localhost:8000/api/v1/templates/risks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Custom Risk",
    "description": "Risk template for enterprise",
    "applies_to_levels": ["high_risk"]
  }'
```

**Expected:** Returns new template with organization_id set

---

### Test 3: Filter by Risk Level
```bash
curl -X GET "http://localhost:8000/api/v1/templates/risks?risk_level=high_risk" \
  -H "Authorization: Bearer <token>"
```

**Expected:** Returns only templates applicable to high_risk systems

---

### Test 4: Duplicate Template
```bash
curl -X POST http://localhost:8000/api/v1/templates/risks/{template_id}/duplicate \
  -H "Authorization: Bearer <token>"
```

**Expected:** Returns new editable copy in user's organization

---

### Test 5: Try to Edit System Template (Should Fail)
```bash
curl -X PATCH http://localhost:8000/api/v1/templates/risks/{system_template_id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Attempted Edit"}'
```

**Expected:** 404 Not Found (system templates are read-only)

---

### Test 6: Cross-Organization Access (Should Fail)
```bash
# User from Org A tries to access Org B's template
curl -X GET http://localhost:8000/api/v1/templates/risks/{org_b_template_id} \
  -H "Authorization: Bearer <token_org_a>"
```

**Expected:** 404 Not Found (RLS enforced at database level)

---

## Data Model

### Risk Template
```python
{
    "id": UUID,                              # Primary key
    "name": str,                             # Template name
    "description": str | None,               # Optional description
    "applies_to_levels": List[str],          # Risk levels this applies to
    "organization_id": UUID | None,          # NULL for system templates
    "is_system": bool,                       # True for system templates
    "is_editable": bool,                     # False for system templates
    "is_active": bool,                       # For soft deletes
    "created_at": datetime,                  # Creation timestamp
    "updated_at": datetime,                  # Last modification timestamp
}
```

### Custom Field Template
```python
{
    "id": UUID,                              # Primary key
    "field_name": str,                       # Field name
    "field_type": str,                       # text, number, select, date, etc.
    "description": str | None,               # Optional description
    "is_required": bool,                     # Whether field is mandatory
    "options": List[str] | None,             # For select fields
    "applies_to_levels": List[str],          # Risk levels this applies to
    "organization_id": UUID | None,          # NULL for default templates
    "is_default": bool,                      # True for default templates
    "is_active": bool,                       # For soft deletes
    "created_at": datetime,                  # Creation timestamp
    "updated_at": datetime,                  # Last modification timestamp
}
```

---

## Permission Matrix

| Operation | System Tmpl | Org Tmpl (Own) | Org Tmpl (Other) | Notes |
|-----------|-----------|--------------|-----------------|-------|
| GET       | ✅        | ✅           | ❌ 404          | Lists visible to all |
| POST      | ❌        | ✅           | ❌              | Create in own org |
| PATCH     | ❌ 404    | ✅           | ❌ 404          | Only editable |
| DELETE    | ❌ 404    | ✅           | ❌ 404          | Soft delete |
| DUPLICATE | ✅ (copy) | ✅ (copy)    | ❌ 403          | Copy to own org |

---

## Implementation Notes

### Row Level Security (RLS)
- System templates: `organization_id IS NULL`
- Organization templates: `organization_id = current_user.organization_id`
- Enforced at PostgreSQL level for data integrity

### Caching Strategy
- Templates rarely change → cache aggressively
- Invalidate cache on POST/PATCH/DELETE
- Include `ETag` in responses for conditional requests

### Rate Limiting
- Recommend: 100 requests/minute per user per endpoint
- 1000 requests/minute for GETs

### Audit Trail
- All operations logged (see soft delete pattern)
- Use `updated_at` timestamp for change tracking
- Consider separate audit table for compliance

---

## Next Steps: Frontend Implementation

1. **Template Selection Modal**
   - Show available templates by risk level
   - Allow filtering by applies_to_levels
   - Preview template structure

2. **Template Management Page**
   - CRUD interface for custom templates
   - Bulk operations (delete, export)
   - Template preview/test

3. **Template Application**
   - Apply template to new system assessment
   - Override individual fields if needed
   - Track template version used

4. **API Integration**
   - Use React Query for caching
   - Implement optimistic updates
   - Error boundary for failures
