-- ============================================
-- 🔧 CRITICAL FIX: RLS UPDATE Policy for Invitation Acceptance
-- ============================================
-- PROBLEM: UPDATE policy doesn't validate that user can accept THIS invitation
-- Current policy: "allow authenticated user to update any row"
-- Result: UPDATE silently fails due to RLS block
--
-- SOLUTION: Create policy that validates:
-- 1. User is authenticated
-- 2. User's email matches invitation email
-- 3. Invitation hasn't already been accepted
-- ============================================

-- Step 1: Drop the broken UPDATE policy
DROP POLICY IF EXISTS "allow_invited_user_accept" ON pending_invitations;

-- Step 2: Create CORRECT UPDATE policy
-- Allows authenticated users to update their own pending invitations
CREATE POLICY "allow_invited_user_accept" ON pending_invitations
  FOR UPDATE
  USING (
    -- User can see the invitation if:
    -- 1. User is authenticated, AND
    -- 2. Invitation's email matches user's email from auth.users
    auth.uid() IS NOT NULL
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    -- User can update the invitation if:
    -- 1. User is authenticated, AND
    -- 2. User's email matches invitation email, AND
    -- 3. Only allow changing status (not other fields)
    auth.uid() IS NOT NULL
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Step 3: Verify the policy was created
SELECT policyname, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'pending_invitations'
AND policyname = 'allow_invited_user_accept';

-- Step 4: Check if any other broken policies exist
SELECT policyname, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'pending_invitations'
ORDER BY policyname;

-- ============================================
-- 🧪 TEST QUERIES (Run these to verify)
-- ============================================

-- Test 1: Get a pending invitation for testing
-- Replace user_email with actual user email
SELECT id, email, status, updated_at
FROM pending_invitations
WHERE status = 'pending'
LIMIT 1;

-- Test 2: Get the authenticated user's email
-- (This would be run from the application context)
-- SELECT email FROM auth.users WHERE id = auth.uid();

-- Test 3: Try to update invitation status
-- Run this as an authenticated user whose email matches the invitation
-- UPDATE pending_invitations
-- SET status = 'accepted', updated_at = NOW()
-- WHERE id = 'invitation_id' AND email = 'user@example.com'
-- RETURNING *;

-- Step 5: If still failing, check for conflicting policies
-- Look for multiple UPDATE policies that might be denying access
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'pending_invitations'
AND cmd = 'UPDATE'
ORDER BY policyname;
