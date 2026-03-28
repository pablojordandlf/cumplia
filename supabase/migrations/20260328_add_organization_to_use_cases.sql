-- Migration: 20260328_add_organization_to_use_cases.sql
-- Description: Add organization_id to use_cases table and update RLS policies
-- to allow team members to see shared AI systems

-- ============================================
-- 1. ADD COLUMN organization_id TO use_cases
-- ============================================

ALTER TABLE use_cases
ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_use_cases_organization_id ON use_cases(organization_id);

-- ============================================
-- 2. MIGRATE DATA: Link existing use_cases to user's organization
-- ============================================

UPDATE use_cases uc
SET organization_id = om.organization_id
FROM organization_members om
WHERE uc.user_id = om.user_id
  AND om.status = 'active'
  AND uc.organization_id IS NULL;

-- ============================================
-- 3. UPDATE RLS POLICIES - CRITICAL CHANGE
-- ============================================

-- Drop old policies (user-only view)
DROP POLICY IF EXISTS use_cases_select_own ON use_cases;
DROP POLICY IF EXISTS use_cases_insert_own ON use_cases;
DROP POLICY IF EXISTS use_cases_update_own ON use_cases;
DROP POLICY IF EXISTS use_cases_delete_own ON use_cases;

-- NEW POLICY 1: SELECT - Can view if owner OR org member with permission
-- Viewers can see all org systems
-- Editors and above can see and edit
CREATE POLICY use_cases_select_org_member ON use_cases
  FOR SELECT USING (
    -- Owner of the system
    user_id = auth.uid()
    OR
    -- OR member of the organization with appropriate role
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

-- NEW POLICY 2: INSERT - Can create if user in org or personal
CREATE POLICY use_cases_insert_own ON use_cases
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      -- Personal use_case (no org)
      organization_id IS NULL
      OR
      -- OR create in org where user is member
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

-- NEW POLICY 3: UPDATE - Only creator can update, but editors in same org can also update
CREATE POLICY use_cases_update_own ON use_cases
  FOR UPDATE USING (
    -- Owner can always update
    user_id = auth.uid()
    OR
    -- Admins in same org can update
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

-- NEW POLICY 4: DELETE - Only creator can delete
CREATE POLICY use_cases_delete_own ON use_cases
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 4. CREATE COMPOSITE INDEX FOR ORG QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_use_cases_org_status ON use_cases(organization_id, status)
WHERE deleted_at IS NULL;

-- ============================================
-- 5. COMMENT FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN use_cases.organization_id IS 
'Organization that owns this AI system. If NULL, it is a personal/draft system. 
Shared systems are visible to all org members with appropriate roles.';

-- ============================================
-- 6. SAFETY CHECK - Verify policies are in place
-- ============================================

-- This query will return the active policies after migration
SELECT schemaname, tablename, policyname, permissive, qual 
FROM pg_policies 
WHERE tablename = 'use_cases'
ORDER BY policyname;
