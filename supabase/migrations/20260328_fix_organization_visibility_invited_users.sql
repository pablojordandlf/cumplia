-- Migration: Fix Organization Visibility for Invited Users
-- Date: 2026-03-28
-- Purpose: Enable invited users (with status='active' in organization_members) 
--          to view their organization's data
-- 
-- PROBLEM: When a user accepts an invitation and their status becomes 'active' in
--          organization_members, they cannot see their organization's data due to 
--          restrictive RLS policies that check for user_id existence issues.
--
-- SOLUTION: Create a straightforward RLS policy that allows any active member 
--           to read their organization's data.

BEGIN;

-- ============================================
-- FIX: Organizations visibility for members
-- ============================================

-- Drop existing complex policy that might have issues
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

-- Create new simplified policy
-- An active member of an organization can view it
CREATE POLICY "Active members can view their organization" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
        OR
        -- Owner always sees their own org
        auth.uid() = owner_id
    );

-- ============================================
-- FIX: Organization Members visibility
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view members of their org" ON organization_members;

-- Create new simplified policy
-- Active members can view other members in their organization
CREATE POLICY "Active members can view organization members" ON organization_members
    FOR SELECT USING (
        -- Current user is an active member of this organization
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
    );

-- ============================================
-- VERIFICATION QUERIES (for debugging)
-- ============================================

-- Verify the policies were created
-- SELECT schemaname, tablename, policyname, permissive, qual
-- FROM pg_policies 
-- WHERE tablename IN ('organizations', 'organization_members')
-- ORDER BY tablename, policyname;

COMMIT;
