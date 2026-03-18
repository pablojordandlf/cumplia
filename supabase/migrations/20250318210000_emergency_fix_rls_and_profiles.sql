-- ============================================
-- EMERGENCY FIX: RLS Recursion + Missing Profiles Table
-- Created: 2026-03-18
-- Description: Fixes infinite recursion and creates profiles table
-- ============================================

-- ============================================
-- 1. CREATE PROFILES TABLE (IF NOT EXISTS)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FIX RLS RECURSION - DROP ALL PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Admins and editors can view members" ON organization_members;
DROP POLICY IF EXISTS "Members can view own record" ON organization_members;
DROP POLICY IF EXISTS "Owners can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON organization_members;
DROP POLICY IF EXISTS "Owners can view all org members" ON organization_members;
DROP POLICY IF EXISTS "Admins can view all org members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage non-owners" ON organization_members;

-- ============================================
-- 3. SECURITY DEFINER FUNCTIONS (NO RECURSION)
-- ============================================

-- Function: Check if user belongs to org (NO RECURSION - direct query)
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- Direct table access, no RLS applied inside security definer
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id
        AND user_id = user_uuid
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is admin/owner
CREATE OR REPLACE FUNCTION is_org_admin_or_owner(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id
        AND user_id = user_uuid
        AND role IN ('owner', 'admin')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check org ownership
CREATE OR REPLACE FUNCTION is_org_owner(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organizations
        WHERE id = org_id
        AND owner_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CREATE NON-RECURSIVE POLICIES
-- ============================================

-- Policy 1: Users can ALWAYS view their OWN membership record (NO recursion)
CREATE POLICY "Users can view own membership" ON organization_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Policy 2: Org owners can view ALL members of their org (uses organizations table, not organization_members)
CREATE POLICY "Owners can view all org members" ON organization_members
    FOR SELECT USING (
        is_org_owner(organization_id, auth.uid())
    );

-- Policy 3: Owners can manage (insert/update/delete) all members
CREATE POLICY "Owners can manage all members" ON organization_members
    FOR ALL USING (
        is_org_owner(organization_id, auth.uid())
    );

-- Policy 4: Admins can view all members (uses security definer function)
CREATE POLICY "Admins can view all org members" ON organization_members
    FOR SELECT USING (
        is_org_admin_or_owner(organization_id, auth.uid())
    );

-- ============================================
-- 5. ENABLE RLS (ensure it's on)
-- ============================================

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. SYNC EXISTING USERS TO PROFILES
-- ============================================

INSERT INTO profiles (id, full_name, avatar_url)
SELECT 
    id,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
