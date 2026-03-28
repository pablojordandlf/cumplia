-- Migration: 20260328_fix_use_cases_organization_visibility.sql
-- Description: Fix RLS policies for use_cases to allow organization members to see shared systems
-- Status: Idempotent - safe to run multiple times
-- Created: 2026-03-28

-- ============================================
-- FIX: Update RLS Policies for use_cases
-- Goal: Allow viewers/editors/admins to see systems created by other org members
-- ============================================

-- Step 1: Drop existing problematic policies (if they exist)
DROP POLICY IF EXISTS use_cases_select_own ON use_cases;
DROP POLICY IF EXISTS use_cases_select_org ON use_cases;
DROP POLICY IF EXISTS use_cases_select_org_member ON use_cases;
DROP POLICY IF EXISTS use_cases_insert_own ON use_cases;
DROP POLICY IF EXISTS use_cases_insert_org ON use_cases;
DROP POLICY IF EXISTS use_cases_update_own ON use_cases;
DROP POLICY IF EXISTS use_cases_update_org ON use_cases;
DROP POLICY IF EXISTS use_cases_delete_own ON use_cases;

-- Step 2: Ensure organization_id column exists (idempotent)
-- If it already exists, this will be silently ignored
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'use_cases' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE use_cases
        ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_use_cases_organization_id ON use_cases(organization_id);
        CREATE INDEX idx_use_cases_org_status ON use_cases(organization_id, status)
        WHERE deleted_at IS NULL;
    END IF;
END $$;

-- Step 3: Create NEW RLS policies that support multi-user visibility

-- POLICY 1: SELECT - Users can view systems they own OR systems in their organization
CREATE POLICY use_cases_select_org_member ON use_cases
  FOR SELECT USING (
    -- Case 1: User is the creator
    user_id = auth.uid()
    OR
    -- Case 2: System belongs to a shared organization and user is a member
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

-- POLICY 2: INSERT - Users can create if they own it OR have permission in org
CREATE POLICY use_cases_insert_org_member ON use_cases
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      -- Personal use_case (no organization)
      organization_id IS NULL
      OR
      -- OR user must be a member with appropriate role
      (
        organization_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.organization_id = use_cases.organization_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
            AND om.role IN ('owner', 'admin', 'editor')
        )
      )
    )
  );

-- POLICY 3: UPDATE - Only creator or org admin/owner can update
CREATE POLICY use_cases_update_own ON use_cases
  FOR UPDATE USING (
    -- Creator can always update their own
    user_id = auth.uid()
    OR
    -- OR admin/owner in the organization
    (
      organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = use_cases.organization_id
          AND om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN ('owner', 'admin')
      )
    )
  );

-- POLICY 4: DELETE - Only creator can delete
CREATE POLICY use_cases_delete_own ON use_cases
  FOR DELETE USING (user_id = auth.uid());

-- Step 4: Add comments for documentation
COMMENT ON COLUMN use_cases.organization_id IS 
'Organization that owns this AI system. If NULL, it is personal. 
Shared systems are visible to all org members (viewer+). Only owner/admin can modify.';

-- Step 5: Verification query (run after migration)
-- This will show all active RLS policies on use_cases
-- Expected: 4 policies (select_org_member, insert_org_member, update_own, delete_own)
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  CASE WHEN qual IS NOT NULL THEN 'USING' ELSE 'WITH CHECK' END as policy_type
FROM pg_policies 
WHERE tablename = 'use_cases'
ORDER BY policyname;

-- Step 6: Optional - Migrate existing systems to organizations
-- This links orphaned personal use_cases to their creator's organization (if they have one)
UPDATE use_cases uc
SET organization_id = om.organization_id
FROM organization_members om
WHERE uc.user_id = om.user_id
  AND om.status = 'active'
  AND uc.organization_id IS NULL;

-- Done! All members of an organization can now see use_cases created in that org
