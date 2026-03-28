-- ================================================================
-- Fix infinite recursion in RLS policies
--
-- Root cause: use_cases policies used inline subqueries on
-- organization_members, which triggered organization_members RLS,
-- which self-references organization_members → infinite loop.
--
-- Fix: use the existing SECURITY DEFINER functions (get_user_org_ids,
-- is_org_admin_or_owner) which bypass RLS when querying org_members.
-- Also remove the self-referential policy on organization_members.
-- ================================================================

-- 1. Replace use_cases policies with versions using SECURITY DEFINER functions
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

-- 2. Fix organization_members: remove self-referential policy and replace
--    with one that uses the SECURITY DEFINER function
DROP POLICY IF EXISTS "Active members can view organization members" ON organization_members;

CREATE POLICY "Active members can view organization members" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()))
  );
