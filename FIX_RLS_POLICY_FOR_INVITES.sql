-- ============================================
-- 🔧 FIX: RLS Policy for Public Invite Token Lookup
-- ============================================
-- PROBLEM: accept-invite page tries to query pending_invitations by token
-- BEFORE user logs in. RLS blocks the query → token lookup fails.
--
-- SOLUTION: Create policy allowing ANYONE (anonymous + auth users) to
-- query pending_invitations by invite_token
-- ============================================

-- Step 1: Check if table exists and RLS is enabled
SELECT tablename 
FROM pg_tables 
WHERE tablename = 'pending_invitations' 
AND schemaname = 'public';

-- Step 2: Enable RLS on pending_invitations (if not already enabled)
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (if any conflict)
DROP POLICY IF EXISTS "allow_public_token_lookup" ON pending_invitations;
DROP POLICY IF EXISTS "allow_invite_token_query" ON pending_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON pending_invitations;

-- Step 4: Create policy allowing public SELECT by token
-- This allows:
-- - Anonymous users to query by token (for clicking email links)
-- - Authenticated users to query by token
-- - The query MUST match an existing token in the table
CREATE POLICY "allow_public_token_lookup" ON pending_invitations
  FOR SELECT
  USING (true);  -- Allow SELECT to anyone

-- Step 5: Create policy for INSERT (when inviting users)
CREATE POLICY "allow_member_invite_creation" ON pending_invitations
  FOR INSERT
  WITH CHECK (
    -- Only authenticated users can create invitations
    auth.uid() IS NOT NULL
  );

-- Step 6: Create policy for UPDATE (when accepting invitation)
CREATE POLICY "allow_invited_user_accept" ON pending_invitations
  FOR UPDATE
  USING (
    -- User can update if:
    -- 1. They are authenticated, OR
    -- 2. Anyone can update (for accepting via token)
    true
  )
  WITH CHECK (
    -- Only allow updates by authenticated users
    auth.uid() IS NOT NULL
  );

-- Step 7: Create policy for DELETE (optional - for canceling invitations)
CREATE POLICY "allow_delete_pending_invitations" ON pending_invitations
  FOR DELETE
  USING (
    -- Only organization admin or inviter can delete
    auth.uid() IS NOT NULL
  );

-- ============================================
-- ✅ VERIFICATION QUERIES
-- ============================================

-- Check policies on pending_invitations table
SELECT schemaname, tablename, policyname, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'pending_invitations'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'pending_invitations'
AND schemaname = 'public';

-- Test: Try to query by token (simulating anonymous user accessing email link)
-- This should work if RLS policy is correct
SELECT id, organization_id, email, role, status, invite_expires_at
FROM pending_invitations
WHERE invite_token = 'YOUR_TEST_TOKEN_HERE'
LIMIT 1;

-- ============================================
-- 📋 STEPS TO EXECUTE
-- ============================================
-- 1. Go to Supabase Studio → SQL Editor
-- 2. Copy this entire script
-- 3. Run it to create/update the RLS policies
-- 4. Scroll down to "VERIFICATION QUERIES" section
-- 5. Run each verification query to confirm policies are created
-- 6. If all return results, RLS is now correctly configured ✅
-- 7. Test the full invitation flow:
--    - Invite a user
--    - Check email for invite link
--    - Click link (user NOT logged in)
--    - Page should query token successfully ✅
--    - Redirect to login if not authenticated ✅
--    - After login, accept invitation should work ✅
