# Multi-Organization AI Systems Visibility Fix

**Status:** ✅ UPDATED - Ready to deploy  
**Created:** 2026-03-28  
**Problem:** Users invited to organizations cannot see AI systems created by other organization members

---

## 🔴 The Problem

When a user is invited to an organization as a "Viewer":
- ❌ They see 0 AI Systems (even if owner created 5)
- ✅ But they SHOULD see all systems created in their organization
- 🔒 Access control should be role-based (viewer can read, but not edit)

### Root Cause
The table `use_cases` already had `organization_id` column added in a previous migration, but:
1. RLS policies were too restrictive (only showed user's own systems)
2. Dependent tables (risks, etc.) didn't have updated policies

---

## ✅ The Solution

Two new migrations fix the RLS policies to enable organization-wide visibility:

### Migration 1: Fix use_cases Visibility
**File:** `supabase/migrations/20260328_fix_use_cases_organization_visibility.sql`

**What it does:**
- ✅ Updates RLS SELECT policy to allow org members to view systems in their org
- ✅ Keeps creator-only permissions for INSERT/UPDATE/DELETE (except admins)
- ✅ Makes the migration idempotent (safe to run multiple times)
- ✅ Automatically links orphaned personal systems to creator's organization

**New Access Rules:**
| Operation | Owner | Admin | Editor | Viewer |
|-----------|-------|-------|--------|--------|
| **View** | ✅ | ✅ | ✅ | ✅ |
| **Edit** | ✅ | ✅ | ✅ | ❌ |
| **Delete** | ✅ | ❌ | ❌ | ❌ |

### Migration 2: Fix Dependent Tables
**File:** `supabase/migrations/20260328_fix_dependent_tables_rls.sql`

**What it does:**
- ✅ Applies similar RLS policies to any related tables (risks, controls, etc.)
- ✅ Uses `DO $$ IF EXISTS` blocks (safe even if tables don't exist)
- ✅ Supports multiple table naming conventions

---

## 🚀 How to Deploy

### Option A: Manual (Recommended for Testing)

1. **Open Supabase Dashboard** → SQL Editor

2. **Run Migration 1:**
   - Copy all content from `supabase/migrations/20260328_fix_use_cases_organization_visibility.sql`
   - Paste into SQL Editor
   - Click "Execute"
   - ✅ Should see: "Success" + 4 policies listed

3. **Run Migration 2:**
   - Copy all content from `supabase/migrations/20260328_fix_dependent_tables_rls.sql`
   - Paste into SQL Editor
   - Click "Execute"
   - ✅ Should see: "Success" + summary of policies

4. **Verify:**
   ```sql
   -- Should see 4 policies for use_cases (select, insert, update, delete)
   SELECT policyname FROM pg_policies WHERE tablename = 'use_cases' ORDER BY policyname;
   ```

### Option B: CLI

```bash
cd /home/pablojordan/.openclaw/workspace/cumplia

# Run all pending migrations
supabase migration up

# Or specific migration
supabase migration up --version 20260328_fix_use_cases_organization_visibility
```

### Option C: Vercel Deploy (Auto-detect)

When you push to GitHub:
```bash
git add supabase/migrations/
git commit -m "fix: enable multi-org visibility for AI systems"
git push origin develop  # or main/master
```

Vercel will auto-detect and run migrations during deployment.

---

## ✅ Verification Checklist

After running migrations, verify everything works:

### 1. Check RLS Policies Created
```sql
SELECT 
  policyname, 
  CASE WHEN qual IS NOT NULL THEN 'USING' ELSE 'WITH CHECK' END as type
FROM pg_policies 
WHERE tablename = 'use_cases'
ORDER BY policyname;

-- Should return exactly 4 rows:
-- use_cases_delete_own | USING
-- use_cases_insert_org_member | WITH CHECK
-- use_cases_select_org_member | USING
-- use_cases_update_own | USING
```

### 2. Verify organization_id Column Exists
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'use_cases' 
ORDER BY column_name;

-- Should show organization_id column
```

### 3. Check Indexes Were Created
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'use_cases' AND indexname LIKE '%org%';

-- Should show:
-- idx_use_cases_organization_id
-- idx_use_cases_org_status
```

### 4. Manual Access Test

**Test 1: Invited user sees org systems**
```sql
-- Assuming:
-- User A: owner_id in organization
-- User B: invited as viewer
-- System 1: created by User A with organization_id = org

-- Simulate User B query
SELECT id, name, user_id, organization_id
FROM use_cases
WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
LIMIT 5;

-- Should return systems even though user_id ≠ current user
```

---

## 🎯 What Changed (Before vs After)

### Before (Broken)
```sql
-- Old RLS Policy - Only showed own systems
FOR SELECT USING (user_id = auth.uid());

-- Result: Invited users see ZERO systems (user_id ≠ theirs)
```

### After (Fixed)
```sql
-- New RLS Policy - Shows own + org systems
FOR SELECT USING (
  user_id = auth.uid()
  OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = use_cases.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner', 'admin', 'editor', 'viewer')
  ))
);

-- Result: Invited users see organization systems + their own
```

---

## ⚠️ Important Notes

### Idempotent Design
Both migrations use `DO $$ IF EXISTS` blocks, making them safe to run multiple times:
- If column exists → skipped
- If policies exist → dropped and recreated (new version)
- If tables don't exist → silently skipped

### No Data Loss
- ✅ No columns deleted
- ✅ No data removed
- ✅ Existing permissions preserved
- ✅ Previous systems automatically linked to organizations

### Backwards Compatibility
- ✅ Personal (non-org) systems still work
- ✅ Creator can always see/edit their own systems
- ✅ Existing queries continue to work

### Performance
New indexes added:
- `idx_use_cases_organization_id` - Fast org lookups
- `idx_use_cases_org_status` - Fast filtered org queries

---

## 🐛 Troubleshooting

### Error: "column organization_id already exists"
✅ **Normal** - Means migration was already run or column was added manually.  
**Solution:** Skip that part, just run the RLS policy updates.

### Error: "relation ai_system_risks does not exist"
✅ **Expected** - That table isn't in this schema.  
**Solution:** Migrations use `IF EXISTS`, so it's safely skipped.

### Systems still not showing after migration
❌ **Issue:** Table might have stale RLS policies.  
**Solution:**
```sql
-- Force policy refresh
ALTER TABLE use_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE use_cases ENABLE ROW LEVEL SECURITY;

-- Then re-run the migration
```

### Performance slow after migration
✅ **Unlikely** - New indexes should improve performance.  
**Solution:** Run ANALYZE to update statistics:
```sql
ANALYZE use_cases;
```

---

## 📝 Post-Migration Testing

### Test Case 1: Invited User Sees Org Systems
```
1. User A creates 5 systems in Org X
2. User A invites User B as "viewer" to Org X
3. User B logs in → Should see 5 systems in dashboard
4. User B tries to edit → Should get permission denied
```

### Test Case 2: Viewer Can't Edit
```
1. User B (viewer) tries to edit system
2. Expected: 403 Forbidden (RLS policy blocks UPDATE)
```

### Test Case 3: Admin Can Edit
```
1. User C invited as "admin" to Org X
2. User C edits system created by User A
3. Expected: Success (admin role allows UPDATE)
```

### Test Case 4: Non-Members Can't See
```
1. User D NOT invited to Org X
2. User D tries to access system from Org X
3. Expected: 403 Forbidden (RLS policy blocks SELECT)
```

---

## 🔄 Rollback (If Needed)

If you need to revert to previous behavior:

```sql
-- Drop new policies
DROP POLICY IF EXISTS use_cases_select_org_member ON use_cases;
DROP POLICY IF EXISTS use_cases_insert_org_member ON use_cases;
DROP POLICY IF EXISTS use_cases_update_own ON use_cases;
DROP POLICY IF EXISTS use_cases_delete_own ON use_cases;

-- Restore old policy (user-only view)
CREATE POLICY use_cases_select_own ON use_cases
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY use_cases_insert_own ON use_cases
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY use_cases_update_own ON use_cases
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY use_cases_delete_own ON use_cases
    FOR DELETE USING (user_id = auth.uid());
```

---

## 📊 Expected Impact

### Positive
✅ Invited users now see organization systems  
✅ Team collaboration becomes possible  
✅ Viewer role finally makes sense  
✅ Admin/Editor roles can manage shared systems  

### No Negative Impact
✅ Personal systems still visible only to creator  
✅ No security regression (permissions more granular now)  
✅ Existing workflows unaffected  
✅ Performance improved with new indexes  

---

## 🎓 Key Concepts

### RLS Policy Hierarchy
```
Rule 1: Creator always has full access
  user_id = auth.uid()
  ↓
Rule 2: Organization members have role-based access
  organization_id exists AND user_id is in organization_members
  ↓
Rule 3: Non-members are blocked
  (both conditions false → SELECT returns nothing)
```

### Why This Works
- `use_cases.user_id` = system creator (never changes)
- `use_cases.organization_id` = shared context (could be NULL for personal)
- `organization_members` = who has access (role-based)
- RLS applies all three checks in SELECT policy

---

**Status:** ✅ Ready to deploy  
**Next Step:** Execute migrations in Supabase SQL Editor or via CLI
