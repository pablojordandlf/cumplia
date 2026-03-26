# Legacy Migrations Consolidation

**Date:** 2026-03-26  
**Status:** SUPERSEDED - These migrations have been replaced by newer versions

## Deprecated Migrations (No Longer Active)

The following migrations are from the initial project setup and have been superseded by later migrations. They are kept for reference only and should NOT be executed in new deployments.

### Early Migrations (Pre-2025-03-16)

1. **`0001_add_subscriptions.sql`** - SUPERSEDED
   - Original: Added billing_plans and user_subscriptions tables
   - Replaced by: `20250316+` schemas with proper organization context
   - Status: Schema evolved, references updated

2. **`0001_create_billing_and_document_schemas.sql`** - SUPERSEDED
   - Original: Initial billing and document schema
   - Replaced by: `20250316_create_documents_bucket.sql` + organization updates
   - Status: Document management refactored

3. **`0002_add_documents.sql`** - SUPERSEDED
   - Original: Early document table implementation
   - Replaced by: `20250316_create_documents_bucket.sql` with Supabase Storage
   - Status: Storage bucket approach is current

4. **`001_create_tables.sql`** - SUPERSEDED
   - Original: Initial schema for organizations, users, use_cases, risks
   - Replaced by: `20250317000001+` risk management tables with proper structure
   - Status: Complete schema redefined, data migrated

## Current Schema Foundation

The active schema is defined by migrations from **2025-03-16 onwards**:

- `20250316_add_custom_fields.sql` - Custom field support
- `20250316_create_documents_bucket.sql` - Document storage
- `20250317000001_create_risk_management_tables.sql` - Risk management system
- `20250317000002_seed_mit_risk_catalog.sql` - Risk catalog data
- `20250322000001_database_corrections.sql` - Latest corrections

## Migration Clean Strategy

**Do NOT delete these files yet.** They serve as:
- Version control history
- Reference for understanding schema evolution
- Backup for rollback procedures

### Future Action Items

- [ ] Archive legacy migrations to `supabase/migrations/archive/` when confident in current schema
- [ ] Document schema versioning strategy (currently implicit in dates)
- [ ] Create migration v2 with consolidated initialization script
- [ ] Add CI/CD validation for migration order and dependencies

## Notes for Future Developers

- New migrations should follow timestamp pattern: `YYYYMMDDHHMMSS_description.sql`
- Always include rollback procedures in migration comments
- Test migrations on staging environment before production
- Keep this file updated when deprecated migrations are identified
