-- Migration: Organization Permissions System
-- Created: 2026-03-17
-- Description: Creates tables for organizations, members, and RLS policies

-- ============================================
-- 1. ENUM TYPES
-- ============================================

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE member_status AS ENUM ('active', 'pending', 'invited');
CREATE TYPE organization_plan AS ENUM ('starter', 'professional', 'business', 'enterprise');

-- ============================================
-- 2. ORGANIZATIONS TABLE
-- ============================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan organization_plan NOT NULL DEFAULT 'starter',
    seats_total INTEGER NOT NULL DEFAULT 1,
    seats_used INTEGER NOT NULL DEFAULT 1,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- ============================================
-- 3. ORGANIZATION MEMBERS TABLE
-- ============================================

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role member_role NOT NULL DEFAULT 'viewer',
    status member_status NOT NULL DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invite_token VARCHAR(255) UNIQUE,
    invite_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- A user can only be once per organization
    UNIQUE(organization_id, user_id),
    -- An email can only have one pending invite per organization
    UNIQUE(organization_id, email)
);

-- Indexes for members
CREATE INDEX idx_members_organization ON organization_members(organization_id);
CREATE INDEX idx_members_user ON organization_members(user_id);
CREATE INDEX idx_members_email ON organization_members(email);
CREATE INDEX idx_members_status ON organization_members(status);
CREATE INDEX idx_members_invite_token ON organization_members(invite_token);

-- ============================================
-- 4. UPDATE AI_SYSTEMS TABLE
-- ============================================

-- Add organization_id column
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Index for organization lookups
CREATE INDEX IF NOT EXISTS idx_ai_systems_organization ON ai_systems(organization_id);

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Policy: Only owners can update organization
CREATE POLICY "Only owners can update organization" ON organizations
    FOR UPDATE USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Only owners can delete organization
CREATE POLICY "Only owners can delete organization" ON organizations
    FOR DELETE USING (auth.uid() = owner_id);

-- Policy: Users can view members of their organizations
CREATE POLICY "Users can view members of their org" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
    );

-- Policy: Admins and owners can manage members
CREATE POLICY "Admins can manage members" ON organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- Policy: Users can update their own member record (e.g., accept invite)
CREATE POLICY "Users can update own member record" ON organization_members
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- 6. AI SYSTEMS RLS UPDATE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE ai_systems ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see AI systems from their organization
DROP POLICY IF EXISTS "Users can view their organization's AI systems" ON ai_systems;
CREATE POLICY "Users can view their organization's AI systems" ON ai_systems
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_systems.organization_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
    );

-- Policy: Editors, Admins, and Owners can create AI systems
DROP POLICY IF EXISTS "Editors can create AI systems" ON ai_systems;
CREATE POLICY "Editors can create AI systems" ON ai_systems
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_systems.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
            AND om.status = 'active'
        )
    );

-- Policy: Editors, Admins, and Owners can update AI systems
DROP POLICY IF EXISTS "Editors can update AI systems" ON ai_systems;
CREATE POLICY "Editors can update AI systems" ON ai_systems
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_systems.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
            AND om.status = 'active'
        )
    );

-- Policy: Only Admins and Owners can delete AI systems
DROP POLICY IF EXISTS "Admins can delete AI systems" ON ai_systems;
CREATE POLICY "Admins can delete AI systems" ON ai_systems
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_systems.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- ============================================
-- 7. FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user can create AI system (limit check)
CREATE OR REPLACE FUNCTION can_create_ai_system(p_organization_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_max INTEGER;
    v_plan organization_plan;
BEGIN
    -- Get organization's plan
    SELECT plan INTO v_plan FROM organizations WHERE id = p_organization_id;
    
    -- Set max based on plan
    v_max := CASE v_plan
        WHEN 'starter' THEN 1
        WHEN 'professional' THEN 15
        WHEN 'business' THEN -1
        WHEN 'enterprise' THEN -1
    END;
    
    -- If unlimited, allow
    IF v_max = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Count active AI systems
    SELECT COUNT(*) INTO v_count 
    FROM ai_systems 
    WHERE organization_id = p_organization_id;
    
    RETURN v_count < v_max;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if can invite user
CREATE OR REPLACE FUNCTION can_invite_user(p_organization_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_used INTEGER;
    v_total INTEGER;
BEGIN
    SELECT seats_used, seats_total 
    INTO v_used, v_total 
    FROM organizations 
    WHERE id = p_organization_id;
    
    RETURN v_used < v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment seats_used
CREATE OR REPLACE FUNCTION increment_seats_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE organizations 
    SET seats_used = seats_used + 1 
    WHERE id = NEW.organization_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement seats_used
CREATE OR REPLACE FUNCTION decrement_seats_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE organizations 
    SET seats_used = seats_used - 1 
    WHERE id = OLD.organization_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update seats count
CREATE TRIGGER update_seats_on_member_change
    AFTER INSERT OR DELETE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION 
        CASE 
            WHEN TG_OP = 'INSERT' THEN increment_seats_used()
            WHEN TG_OP = 'DELETE' THEN decrement_seats_used()
        END;

-- ============================================
-- 8. MIGRATE EXISTING DATA
-- ============================================

-- Create organizations for existing users
INSERT INTO organizations (name, slug, owner_id, plan, seats_total, seats_used)
SELECT 
    COALESCE(raw_user_meta_data->>'company_name', email, 'Mi Organización') as name,
    LOWER(REGEXP_REPLACE(COALESCE(raw_user_meta_data->>'company_name', email, 'org'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8) as slug,
    id as owner_id,
    'starter'::organization_plan as plan,
    1 as seats_total,
    1 as seats_used
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE owner_id = auth.users.id
);

-- Link existing AI systems to organizations
UPDATE ai_systems 
SET organization_id = (
    SELECT id FROM organizations 
    WHERE owner_id = ai_systems.user_id 
    LIMIT 1
)
WHERE organization_id IS NULL;

-- Create member records for owners
INSERT INTO organization_members (organization_id, user_id, email, role, status, invited_by)
SELECT 
    o.id as organization_id,
    o.owner_id as user_id,
    u.email as email,
    'owner'::member_role as role,
    'active'::member_status as status,
    o.owner_id as invited_by
FROM organizations o
JOIN auth.users u ON u.id = o.owner_id
WHERE NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = o.id AND user_id = o.owner_id
);
