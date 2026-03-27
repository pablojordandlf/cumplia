-- ============================================
-- 🧹 CLEAN & REBUILD: RLS Policies for pending_invitations
-- ============================================
-- This script removes ALL existing RLS policies on pending_invitations
-- and creates a clean, working set for invitation acceptance flow
-- ============================================

-- 1. Disable RLS temporarily
ALTER TABLE pending_invitations DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
DROP POLICY IF EXISTS "Admins can view pending invitations" ON pending_invitations;
DROP POLICY IF EXISTS "Admins can create pending invitations" ON pending_invitations;
DROP POLICY IF EXISTS "Admins can update pending invitations" ON pending_invitations;
DROP POLICY IF EXISTS "Admins can delete pending invitations" ON pending_invitations;
DROP POLICY IF EXISTS "Anyone can lookup invitation by token" ON pending_invitations;
DROP POLICY IF EXISTS "Organization members can view pending invitations for their org" ON pending_invitations;
DROP POLICY IF EXISTS "Organization admins can create invitations" ON pending_invitations;
DROP POLICY IF EXISTS "Organization admins can update invitations" ON pending_invitations;
DROP POLICY IF EXISTS "allow_public_token_lookup" ON pending_invitations;
DROP POLICY IF EXISTS "allow_member_invite_creation" ON pending_invitations;
DROP POLICY IF EXISTS "allow_invited_user_accept" ON pending_invitations;
DROP POLICY IF EXISTS "allow_delete_pending_invitations" ON pending_invitations;

-- 3. Re-enable RLS
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;

-- 4. Create SINGLE, simple policy for SELECT (allows anonymous + auth users to query by token)
CREATE POLICY "allow_select_for_token_lookup" ON pending_invitations
  FOR SELECT
  USING (true);

-- 5. Create policy for INSERT (organization admins only)
CREATE POLICY "allow_insert_for_admins" ON pending_invitations
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = pending_invitations.organization_id 
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
      AND om.status = 'active'
    )
  );

-- 6. Create policy for UPDATE (organization admins OR backend service role)
CREATE POLICY "allow_update_for_admins_or_service" ON pending_invitations
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = pending_invitations.organization_id 
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
      AND om.status = 'active'
    )
  );

-- 7. Verification queries
SELECT 'RLS Status on pending_invitations:' as check;
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'pending_invitations' AND schemaname = 'public';

SELECT 'Active RLS Policies:' as check;
SELECT policyname, permissive, qual, with_check FROM pg_policies 
WHERE tablename = 'pending_invitations' 
ORDER BY policyname;

SELECT 'Test: Can we query by token as anonymous?' as check;
-- This query should work (return 0 rows if token doesn't exist, not an error)
SELECT COUNT(*) FROM pending_invitations WHERE invite_token = 'test' LIMIT 1;
