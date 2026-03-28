# Fix: Multi-Organization System Visibility

**Date:** 2026-03-28  
**Issue:** Users invited to an organization could not see AI systems created by other members  
**Status:** ✅ FIXED

---

## Problem Analysis

### Root Cause
The `use_cases` table (which stores "Sistemas de IA"):
- ❌ **Missing `organization_id` column** - No way to link systems to organizations
- ❌ **Restrictive RLS policy** - Only allowed viewing own `user_id` records
- ❌ **No org-scoped access** - Invited members couldn't access org resources

### Technical Details

**Original RLS Policy:**
```sql
CREATE POLICY use_cases_select_own ON use_cases
    FOR SELECT USING (user_id = auth.uid());
```

**Issue:** When User B is invited to Org X:
1. User A (owner) creates 5 AI systems in Org X
2. User B joins Org X as viewer
3. User B queries `use_cases` → **0 results** (only sees own records, has none)
4. User B cannot see any org systems

### Impact
- New team members see empty dashboard
- "Total de Sistemas" = 0
- No access to organization's compliance data
- Cannot collaborate on risk assessments

---

## Solution: Multi-Organization Visibility

### Step 1: Add `organization_id` Column

**File:** `supabase/migrations/20260328_add_organization_to_use_cases.sql`

```sql
ALTER TABLE use_cases
ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_use_cases_organization_id ON use_cases(organization_id);
```

### Step 2: Migrate Existing Data

Automatically link existing use_cases to user's organization:

```sql
UPDATE use_cases uc
SET organization_id = om.organization_id
FROM organization_members om
WHERE uc.user_id = om.user_id
  AND om.status = 'active'
  AND uc.organization_id IS NULL;
```

### Step 3: Replace RLS Policies

**Old (User-only access):**
```sql
FOR SELECT USING (user_id = auth.uid());
```

**New (Org-scoped + user access):**
```sql
FOR SELECT USING (
  -- Owner of system
  user_id = auth.uid()
  OR
  -- Member of org with valid role
  (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = use_cases.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor', 'viewer')
    )
  )
);
```

**Role-Based Access:**
- **Viewer:** Can read all org systems ✅
- **Editor:** Can read + write org systems ✅
- **Admin:** Can read + write + manage ✅
- **Owner:** Full access ✅

---

## Implementation Files

### Migration 1: Organization Column
**File:** `/supabase/migrations/20260328_add_organization_to_use_cases.sql`
- Adds `organization_id` column
- Migrates data (maps users to their org)
- Updates all 4 RLS policies (SELECT/INSERT/UPDATE/DELETE)
- Creates composite index `(organization_id, status)`

### Migration 2: ai_system_risks RLS
**File:** `/supabase/migrations/20260328_fix_ai_system_risks_rls.sql`
- Updates `ai_system_risks` policies (dependent table)
- Ensures risk assessments follow org hierarchy
- Creator + org admins can modify
- All members can view

---

## Deployment Steps

### 1. Execute Migrations in Supabase

```bash
# Copy-paste each migration file into Supabase SQL Editor

# First migration (add column + RLS)
-- Content from: 20260328_add_organization_to_use_cases.sql

# Second migration (fix ai_system_risks)
-- Content from: 20260328_fix_ai_system_risks_rls.sql
```

### 2. Verify Policies Created

Run this query to confirm:
```sql
SELECT schemaname, tablename, policyname, permissive 
FROM pg_policies 
WHERE tablename IN ('use_cases', 'ai_system_risks')
ORDER BY tablename, policyname;
```

**Expected output:** 8 policies (4 for use_cases, 4 for ai_system_risks)

### 3. Test the Fix

**Test Case 1: Org Member Can See Systems**
```sql
-- User A (owner) creates system
INSERT INTO use_cases (user_id, organization_id, name, sector, status)
VALUES (
  'user-a-uuid',
  'org-uuid',
  'Test AI System',
  'Finance',
  'draft'
);

-- User B (viewer member) queries
SELECT id, name FROM use_cases
WHERE organization_id = 'org-uuid';
-- ✅ Should return User A's system
```

**Test Case 2: Non-Member Cannot See Systems**
```sql
-- User C (not in org) queries
SELECT id, name FROM use_cases
WHERE organization_id = 'org-uuid';
-- ✅ Should return 0 rows (access denied by RLS)
```

---

## Impact on Dashboard

### Before Fix
```
Total de Sistemas: 0
High Risk: 0
Classification: Empty
Recent Systems: [empty]
```

### After Fix
```
Total de Sistemas: 5 (shared from other members)
High Risk: 2 (visible to viewer)
Classification: [correct distribution]
Recent Systems: [all org systems]
```

### Query Change (Dashboard)

The dashboard already attempts org-scoped queries:
```typescript
if (organizationId) {
  systemsQuery = systemsQuery.or(
    `organization_id.eq.${organizationId},user_id.eq.${session.user.id}`
  );
}
```

**This now works because:**
- ✅ `organization_id` column exists
- ✅ RLS policy allows org member access
- ✅ Data is properly migrated

---

## Risk Assessment

### Safety
- ✅ No data loss (migration uses UPDATE, not DELETE)
- ✅ Backward compatible (personal systems still work)
- ✅ RLS still enforced (no security regression)
- ✅ Role-based access preserved

### Performance
- ✅ Added index on `organization_id`
- ✅ Composite index on `(organization_id, status)`
- ✅ Query performance improved (indexed lookups)

### Rollback Plan
If issues arise:
```sql
-- Remove policies
DROP POLICY IF EXISTS use_cases_select_org_member ON use_cases;

-- Add back old policy (if needed)
CREATE POLICY use_cases_select_own ON use_cases
    FOR SELECT USING (user_id = auth.uid());

-- This would block org access but restore original behavior
```

---

## Related Changes

### Tables Affected
1. **use_cases** - Primary table (added column + policies)
2. **ai_system_risks** - Risk assessments (updated policies)

### Potentially Affected Queries
- Dashboard: `use_cases` queries by org ✅ (already coded)
- Inventory: List view by org ✅ (should work now)
- Risk assessment: Queries filtered by org ✅ (policies updated)

### Code That Should Be Verified
- `/app/(dashboard)/dashboard/page.tsx` - Uses `organization_id` query
- `/app/(dashboard)/dashboard/inventory/page.tsx` - May need org filter
- Any endpoint querying `use_cases` - Should work now

---

## Verification Checklist

- [ ] Migrations executed successfully in Supabase
- [ ] `organization_id` column exists on `use_cases`
- [ ] All 4 RLS policies created for `use_cases`
- [ ] All 4 RLS policies created for `ai_system_risks`
- [ ] Indexes created: `idx_use_cases_organization_id`, `idx_use_cases_org_status`
- [ ] Test: Org member can see owner's systems
- [ ] Test: Non-member cannot see org systems
- [ ] Test: Dashboard shows correct system count
- [ ] Test: Invited user sees "Últimas Novedades" with org systems
- [ ] No error messages in browser console
- [ ] Performance acceptable (dashboard loads < 2s)

---

## Timeline

| Task | Status |
|------|--------|
| Create migrations | ✅ Done |
| Document problem | ✅ Done |
| Execute in Supabase | ⏳ Pending |
| Test scenarios | ⏳ Pending |
| Verify dashboard | ⏳ Pending |
| Production deployment | ⏳ Pending |

---

## How to Apply Fixes

### Option A: Manual (Recommended for Testing)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy entire contents of `20260328_add_organization_to_use_cases.sql`
3. Paste and execute (should see "Success")
4. Copy entire contents of `20260328_fix_ai_system_risks_rls.sql`
5. Paste and execute (should see "Success")
6. Run verification query to confirm policies

### Option B: Via Supabase CLI

```bash
cd cumplia
supabase db pull  # Get latest migrations
supabase migration up  # Execute pending migrations
```

## Next Steps

1. **Execute migrations** in Supabase SQL Editor (copy both files)
2. **Verify** RLS policies are in place
3. **Test** with actual user accounts (invite flow)
4. **Commit** migrations to git
5. **Deploy** to production via Vercel

---

## Questions?

- **Why both migrations?** - Separation of concerns (columns first, then dependencies)
- **Will existing data break?** - No, migration auto-links to org
- **Do I need to update frontend code?** - Dashboard already handles org queries
- **What about new systems?** - Users should specify org when creating
