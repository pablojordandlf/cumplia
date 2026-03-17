-- Migration: SSO Providers Support
-- Created: 2026-03-17
-- Description: Creates tables and functions for SSO/SAML authentication

-- ============================================
-- 1. SSO PROVIDERS TABLE
-- ============================================

CREATE TABLE sso_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Display name: "Microsoft Azure AD", "Google Workspace"
    provider_type VARCHAR(50) NOT NULL DEFAULT 'saml', -- saml, oidc
    
    -- SAML Configuration
    metadata_xml TEXT, -- SAML Metadata XML content
    metadata_url TEXT, -- URL to fetch metadata (optional, alternative to XML)
    entity_id VARCHAR(500), -- Extracted from metadata
    sso_url VARCHAR(500), -- Single Sign-On URL (extracted from metadata)
    certificate TEXT, -- X.509 Certificate (extracted from metadata)
    
    -- Domain configuration
    domains TEXT[] NOT NULL DEFAULT '{}', -- Email domains: ['company.com']
    
    -- Attribute mapping (SAML attributes to JWT claims)
    attribute_mapping JSONB DEFAULT '{
        "email": "email",
        "first_name": "firstName",
        "last_name": "lastName",
        "groups": "groups"
    }',
    
    -- Auto-provisioning settings
    auto_provision BOOLEAN DEFAULT true, -- Auto-create user if not exists
    default_role member_role DEFAULT 'viewer', -- Default role for auto-provisioned users
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_provider_type CHECK (provider_type IN ('saml', 'oidc')),
    CONSTRAINT metadata_required CHECK (metadata_xml IS NOT NULL OR metadata_url IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_sso_providers_org ON sso_providers(organization_id);
CREATE INDEX idx_sso_providers_domains ON sso_providers USING GIN (domains);
CREATE INDEX idx_sso_providers_active ON sso_providers(is_active) WHERE is_active = true;

-- ============================================
-- 2. SSO SESSIONS TABLE
-- ============================================

CREATE TABLE sso_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
    saml_request_id VARCHAR(255),
    auth_state VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE INDEX idx_sso_sessions_user ON sso_sessions(user_id);
CREATE INDEX idx_sso_sessions_provider ON sso_sessions(provider_id);
CREATE INDEX idx_sso_sessions_expires ON sso_sessions(expires_at) WHERE consumed_at IS NULL;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view SSO providers of their organization
CREATE POLICY "Users can view org SSO providers" ON sso_providers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = sso_providers.organization_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
    );

-- Policy: Only admins and owners can manage SSO providers
CREATE POLICY "Admins can manage SSO providers" ON sso_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = sso_providers.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- Policy: Users can view their own SSO sessions
CREATE POLICY "Users can view own SSO sessions" ON sso_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Policy: System can create SSO sessions
CREATE POLICY "System can create SSO sessions" ON sso_sessions
    FOR INSERT WITH CHECK (true);

-- Policy: System can update SSO sessions
CREATE POLICY "System can update SSO sessions" ON sso_sessions
    FOR UPDATE USING (true);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sso_providers_updated_at 
    BEFORE UPDATE ON sso_providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if domain has SSO configured
CREATE OR REPLACE FUNCTION get_sso_provider_by_email(p_email VARCHAR)
RETURNS TABLE (
    provider_id UUID,
    organization_id UUID,
    provider_name VARCHAR,
    provider_type VARCHAR,
    metadata_xml TEXT,
    metadata_url TEXT,
    domains TEXT[]
) AS $$
DECLARE
    v_domain VARCHAR;
BEGIN
    v_domain := SPLIT_PART(p_email, '@', 2);
    
    RETURN QUERY
    SELECT 
        sp.id,
        sp.organization_id,
        sp.name,
        sp.provider_type,
        sp.metadata_xml,
        sp.metadata_url,
        sp.domains
    FROM sso_providers sp
    WHERE sp.is_active = true
    AND v_domain = ANY(sp.domains)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate domain is not public
CREATE OR REPLACE FUNCTION is_valid_sso_domain(p_domain VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT (p_domain = ANY(ARRAY[
        'gmail.com', 'googlemail.com',
        'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
        'yahoo.com', 'ymail.com',
        'icloud.com', 'me.com', 'mac.com',
        'protonmail.com', 'proton.me',
        'zoho.com', 'aol.com',
        'yandex.com', 'yandex.ru', 'mail.ru',
        'qq.com', '163.com', '126.com',
        'foxmail.com', 'naver.com', 'daum.net', 'hanmail.net'
    ]));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if domain is available
CREATE OR REPLACE FUNCTION is_domain_available(p_domain VARCHAR, p_org_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM sso_providers
        WHERE p_domain = ANY(domains)
        AND is_active = true
        AND (p_org_id IS NULL OR organization_id != p_org_id)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to extract domain from email
CREATE OR REPLACE FUNCTION extract_domain(p_email VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN SPLIT_PART(p_email, '@', 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 5. HELPER VIEWS
-- ============================================

CREATE OR REPLACE VIEW organizations_with_sso AS
SELECT 
    o.*,
    EXISTS (
        SELECT 1 FROM sso_providers sp 
        WHERE sp.organization_id = o.id AND sp.is_active = true
    ) as has_sso_enabled
FROM organizations o;
