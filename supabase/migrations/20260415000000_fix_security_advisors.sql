-- ============================================================
-- FIX SECURITY ADVISORS
-- Date: 2026-04-15
-- Issues resolved:
--   1. auth_users_exposed: view use_case_versions_with_users joins auth.users
--   2. security_definer_view: same view uses SECURITY DEFINER implicitly
--   3. rls_disabled_in_public: table plans has no RLS
-- ============================================================

-- ============================================================
-- FIX 1 & 2: use_case_versions_with_users
-- ============================================================
-- The original view joined auth.users directly to get the creator's email.
-- This exposed auth.users data to the anon role (error: auth_users_exposed)
-- and ran with SECURITY DEFINER privileges, bypassing RLS for the querying
-- user (error: security_definer_view).
--
-- Fix: Drop the view and recreate it using the public.profiles table
-- (which holds full_name/avatar_url synced from auth.users), with
-- security_invoker = on so it respects the querying user's permissions.
-- ============================================================

DROP VIEW IF EXISTS public.use_case_versions_with_users;

CREATE OR REPLACE VIEW public.use_case_versions_with_users
WITH (security_invoker = on)
AS
SELECT
    v.*,
    p.full_name AS created_by_name,
    p.avatar_url AS created_by_avatar
FROM public.use_case_versions v
LEFT JOIN public.profiles p ON v.created_by = p.id;

COMMENT ON VIEW public.use_case_versions_with_users IS
  'Use case versions enriched with creator profile data. Uses security_invoker so RLS of the querying role is respected. Joins profiles (not auth.users) to avoid exposing sensitive auth data.';

-- ============================================================
-- FIX 3: Enable RLS on public.plans
-- ============================================================
-- plans is a reference/catalog table (pricing tiers). It has no RLS,
-- meaning any role (including anon) can read AND potentially mutate it
-- via PostgREST without restriction.
--
-- Fix: Enable RLS and add a read-only policy for everyone.
-- Only the service_role (bypasses RLS by default in Supabase) can
-- insert/update/delete rows, which is the correct behaviour for
-- a managed catalog table.
-- ============================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors on the pricing page) can read plans.
DROP POLICY IF EXISTS "Anyone can read plans" ON public.plans;
CREATE POLICY "Anyone can read plans"
    ON public.plans
    FOR SELECT
    USING (true);

-- No INSERT / UPDATE / DELETE policies → only service_role can modify plans.
