-- ============================================================
-- Fix: org members can see all systems in their organization
--
-- Root cause: organization_id was not set on insert, so invited
-- users querying by organization_id could never find the systems
-- created by other org members.
--
-- Changes:
--   1. Backfill organization_id for existing NULL rows
--   2. Replace 7 duplicate/conflicting RLS policies with 4 clean ones
-- ============================================================

-- 1. Backfill organization_id for any existing NULL rows (idempotent)
UPDATE use_cases uc
SET organization_id = om.organization_id
FROM organization_members om
WHERE uc.user_id = om.user_id
  AND uc.organization_id IS NULL
  AND om.status = 'active';

-- 2. Drop duplicate / conflicting policies
DROP POLICY IF EXISTS "View own or org use_cases" ON use_cases;
DROP POLICY IF EXISTS "use_cases_select_org" ON use_cases;
DROP POLICY IF EXISTS "Update own or org use_cases" ON use_cases;
DROP POLICY IF EXISTS "use_cases_update_org" ON use_cases;
DROP POLICY IF EXISTS "Delete own or org use_cases" ON use_cases;
DROP POLICY IF EXISTS "use_cases_delete_org" ON use_cases;
DROP POLICY IF EXISTS "use_cases_insert_org" ON use_cases;

-- Also drop the new ones in case this migration is re-run
DROP POLICY IF EXISTS use_cases_select ON use_cases;
DROP POLICY IF EXISTS use_cases_insert ON use_cases;
DROP POLICY IF EXISTS use_cases_update ON use_cases;
DROP POLICY IF EXISTS use_cases_delete ON use_cases;

-- 3. Create clean, single policies

CREATE POLICY use_cases_select ON use_cases
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY use_cases_insert ON use_cases
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      organization_id IS NULL
      OR organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY use_cases_update ON use_cases
  FOR UPDATE USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  ) WITH CHECK (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY use_cases_delete ON use_cases
  FOR DELETE USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
