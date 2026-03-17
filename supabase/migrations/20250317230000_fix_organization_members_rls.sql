-- Fix: Infinite recursion in organization_members RLS policy
-- Created: 2026-03-17
-- Description: Fixes the recursive policy that queries organization_members within itself

-- ============================================
-- 1. DROP PROBLEMATIC POLICIES
-- ============================================

-- Drop the recursive policy on organization_members
DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;

-- ============================================
-- 2. CREATE FIXED POLICIES (Non-recursive)
-- ============================================

-- Fixed Policy: Users can view members of organizations they belong to
-- Using organizations table instead of organization_members to avoid recursion
CREATE POLICY "Users can view members of their org" ON organization_members
    FOR SELECT USING (
        -- User can see members if they are the owner of the organization
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = organization_members.organization_id
            AND o.owner_id = auth.uid()
        )
        OR
        -- Or if they are an active member (check via organizations + member check)
        (
            organization_members.user_id = auth.uid()
            AND organization_members.status = 'active'
        )
        OR
        -- Or check membership through a security definer function
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
            AND om.id != organization_members.id  -- Exclude self to prevent recursion issues
        )
    );

-- Alternative simpler approach - direct check
DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;
CREATE POLICY "Users can view members of their org" ON organization_members
    FOR SELECT USING (
        -- Users can see their own record
        user_id = auth.uid()
        OR
        -- Users can see members of orgs they own
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = organization_members.organization_id
            AND o.owner_id = auth.uid()
        )
    );

-- Fixed Policy: Admins and owners can manage members
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
CREATE POLICY "Admins can manage members" ON organization_members
    FOR ALL USING (
        -- Organization owners can manage all members
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = organization_members.organization_id
            AND o.owner_id = auth.uid()
        )
    );

-- Additional policy for admins/editors to view members
CREATE POLICY "Admins and editors can view members" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
            AND om.status = 'active'
        )
    );

-- ============================================
-- 3. SECURITY DEFINER FUNCTION (Alternative approach)
-- ============================================

-- Create a security definer function to check membership
CREATE OR REPLACE FUNCTION is_organization_member(p_organization_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = p_organization_id
        AND om.user_id = p_user_id
        AND om.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to check admin/owner role
CREATE OR REPLACE FUNCTION is_organization_admin(p_organization_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = p_organization_id
        AND om.user_id = p_user_id
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
