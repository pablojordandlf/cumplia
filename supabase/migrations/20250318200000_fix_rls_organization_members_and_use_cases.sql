-- Fix RLS policies for organization_members and use_cases
-- Created: 2026-03-18
-- Description: Fixes RLS issues preventing users from reading their own membership and creating AI systems

-- ============================================
-- 1. FIX organization_members RLS POLICIES
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Admins and editors can view members" ON organization_members;

-- Simple policy: Users can always view their OWN record
CREATE POLICY "Users can view own membership" ON organization_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Policy: Organization owners can view all members of their org
CREATE POLICY "Owners can view all org members" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = organization_members.organization_id
            AND o.owner_id = auth.uid()
        )
    );

-- Policy: Admins can view all members of their org
CREATE POLICY "Admins can view all org members" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'admin'
            AND om.status = 'active'
        )
    );

-- ============================================
-- 2. FIX use_cases RLS POLICIES
-- ============================================

-- Drop old user-based policies
DROP POLICY IF EXISTS use_cases_select_own ON use_cases;
DROP POLICY IF EXISTS use_cases_insert_own ON use_cases;
DROP POLICY IF EXISTS use_cases_update_own ON use_cases;
DROP POLICY IF EXISTS use_cases_delete_own ON use_cases;

-- Helper function: Check if user belongs to an organization
CREATE OR REPLACE FUNCTION get_user_org_id(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id
    FROM organization_members
    WHERE user_id = p_user_id
    AND status = 'active'
    LIMIT 1;
    
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can view use_cases in their organization
CREATE POLICY use_cases_select_org ON use_cases
    FOR SELECT USING (
        organization_id = get_user_org_id()
        OR
        user_id = auth.uid()  -- Keep backwards compatibility
    );

-- Policy: Users can insert use_cases in their organization
CREATE POLICY use_cases_insert_org ON use_cases
    FOR INSERT WITH CHECK (
        organization_id = get_user_org_id()
        OR
        user_id = auth.uid()  -- Keep backwards compatibility
    );

-- Policy: Users can update use_cases in their organization
CREATE POLICY use_cases_update_org ON use_cases
    FOR UPDATE USING (
        organization_id = get_user_org_id()
        OR
        user_id = auth.uid()  -- Keep backwards compatibility
    );

-- Policy: Users can delete use_cases in their organization
CREATE POLICY use_cases_delete_org ON use_cases
    FOR DELETE USING (
        organization_id = get_user_org_id()
        OR
        user_id = auth.uid()  -- Keep backwards compatibility
    );
