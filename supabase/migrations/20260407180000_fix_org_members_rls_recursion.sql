-- Migration: 20260407180000_fix_org_members_rls_recursion.sql
-- Description: Fix infinite recursion in organization_members RLS policy
--
-- Root cause:
--   Migration 20260328_fix_organization_visibility_invited_users.sql created a
--   self-referential SELECT policy on organization_members: the USING clause
--   queries the same table it protects, causing infinite recursion.
--
--   Migration 20260328130000_fix_rls_infinite_recursion.sql attempted to fix this
--   by using a SECURITY DEFINER function get_user_org_ids(), but that function
--   was never defined in any migration, so the fix was never applied.
--
-- Effect: Any query on use_cases (whose RLS policies subquery organization_members)
--   would fail with "infinite recursion detected in policy for relation
--   organization_members", making the AI systems inventory appear empty.
--
-- Fix:
--   1. Create get_user_org_ids() as a SECURITY DEFINER set-returning function.
--      SECURITY DEFINER bypasses RLS when querying organization_members, which
--      breaks the recursion chain.
--   2. Replace the recursive organization_members SELECT policy with one that
--      calls this function instead.

-- 1. Create the missing SECURITY DEFINER function
CREATE OR REPLACE FUNCTION get_user_org_ids(p_user_id UUID DEFAULT auth.uid())
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = p_user_id
    AND status = 'active';
$$;

-- 2. Replace the recursive policy on organization_members
--    (drop all known variants so the migration is idempotent)
DROP POLICY IF EXISTS "Active members can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;

CREATE POLICY "Active members can view organization members" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()))
  );

-- 3. Re-apply the same fix to use_cases_select / use_cases_insert / use_cases_update /
--    use_cases_delete so they also use get_user_org_ids() instead of inline subqueries
--    on organization_members (avoids any future recursion if the org_members policy
--    is changed again).
DROP POLICY IF EXISTS use_cases_select ON use_cases;
DROP POLICY IF EXISTS use_cases_insert ON use_cases;
DROP POLICY IF EXISTS use_cases_update ON use_cases;
DROP POLICY IF EXISTS use_cases_delete ON use_cases;

CREATE POLICY use_cases_select ON use_cases
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
  );

CREATE POLICY use_cases_insert ON use_cases
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      organization_id IS NULL
      OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY use_cases_update ON use_cases
  FOR UPDATE USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
  ) WITH CHECK (
    user_id = auth.uid()
    OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
  );

CREATE POLICY use_cases_delete ON use_cases
  FOR DELETE USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
  );
