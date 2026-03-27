-- ============================================
-- 🔍 DEBUG: Check Invitation Token in Database
-- ============================================

-- Step 1: Check if the token from the error page exists
SELECT 
  id,
  organization_id,
  email,
  role,
  status,
  invite_token,
  invite_expires_at,
  created_at
FROM pending_invitations
WHERE invite_token = 'd499dab2-022b-445a-aa84-dd53812408b6'
LIMIT 1;

-- Step 2: List ALL pending invitations (no filter)
SELECT 
  id,
  organization_id,
  email,
  role,
  status,
  invite_token,
  invite_expires_at,
  created_at
FROM pending_invitations
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_invitations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check RLS policies
SELECT schemaname, tablename, policyname, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'pending_invitations'
ORDER BY policyname;

-- Step 5: Test public query (what the accept-invite page does)
-- This simulates the query from accept-invite/page.tsx
SELECT 
  id,
  organization_id,
  email,
  role,
  invite_expires_at,
  invite_token,
  organizations!inner (name)
FROM pending_invitations
WHERE invite_token = 'd499dab2-022b-445a-aa84-dd53812408b6'
LIMIT 1;
