-- ============================================
-- FIX: Supabase Security Lint Errors
-- Date: 2026-03-31
-- Issues fixed:
--   1. auth_users_exposed: view use_case_versions_with_users exposes auth.users
--   2. security_definer_view: same view uses SECURITY DEFINER
--   3. rls_disabled_in_public: table plans has RLS disabled
-- ============================================


-- ============================================
-- 1. ADD EMAIL TO PROFILES (avoid joining auth.users)
-- ============================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Keep email in sync when auth.users.email changes
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_email();

-- Also populate email when a new user is created (complement existing handle_new_user trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow authenticated users to read profiles so the view can resolve emails
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');


-- ============================================
-- 2. FIX VIEW: use_case_versions_with_users
--    - Remove SECURITY DEFINER (use SECURITY INVOKER, which is the default)
--    - Join profiles instead of auth.users
-- ============================================

DROP VIEW IF EXISTS public.use_case_versions_with_users;

CREATE VIEW public.use_case_versions_with_users
WITH (security_invoker = true)
AS
SELECT
    v.*,
    p.email AS created_by_email
FROM public.use_case_versions v
LEFT JOIN public.profiles p ON p.id = v.created_by;

-- Restrict direct access: only authenticated users should query this view
REVOKE ALL ON public.use_case_versions_with_users FROM anon;
GRANT SELECT ON public.use_case_versions_with_users TO authenticated;


-- ============================================
-- 3. ENABLE RLS ON plans TABLE
--    Plans are public reference data: everyone can read, nobody can write
--    via PostgREST (writes go through service_role only).
-- ============================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans" ON public.plans
    FOR SELECT
    USING (true);
