-- Fix: Infinite recursion - CORRECTED VERSION
-- Created: 2026-03-18
-- Description: Uses security definer functions to avoid recursion completely

-- ============================================
-- 1. DROP ALL PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Admins and editors can view members" ON organization_members;
DROP POLICY IF EXISTS "Members can view own record" ON organization_members;
DROP POLICY IF EXISTS "Owners can manage members" ON organization_members;

-- ============================================
-- 2. ENSURE SECURITY DEFINER FUNCTIONS EXIST
-- ============================================

-- Function to check if user is member (SECURITY DEFINER avoids recursion)
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id
        AND user_id = user_uuid
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin/owner
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

-- Function to check if user is at least editor
CREATE OR REPLACE FUNCTION is_org_editor_plus(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id
        AND user_id = user_uuid
        AND role IN ('owner', 'admin', 'editor')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. CREATE NON-RECURSIVE POLICIES
-- ============================================

-- Policy: Users can view members of orgs they belong to (using security definer function)
CREATE POLICY "Users can view members of their org" ON organization_members
    FOR SELECT USING (
        -- Can view if user is member via security definer function
        is_org_member(organization_id, auth.uid())
    );

-- Policy: Owners can manage all members
CREATE POLICY "Owners can manage members" ON organization_members
    FOR ALL USING (
        -- Check ownership via organizations table (no recursion)
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
    );

-- Policy: Admins can manage members (but not owners)
CREATE POLICY "Admins can manage non-owners" ON organization_members
    FOR ALL USING (
        -- User must be admin/owner via security definer
        is_org_admin_or_owner(organization_members.organization_id, auth.uid())
        AND
        -- Cannot modify owner records
        organization_members.role != 'owner'
    );

-- ============================================
-- 4. ENABLE RLS (ensure it's on)
-- ============================================

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
