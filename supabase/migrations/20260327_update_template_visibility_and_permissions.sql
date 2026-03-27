-- Migration: 20260327_update_template_visibility_and_permissions.sql
-- Description: Update template visibility, permissions, and organization scoping

-- ============================================
-- 1. UPDATE RISK TEMPLATES TABLE - Add is_editable column
-- ============================================

ALTER TABLE risk_templates
ADD COLUMN IF NOT EXISTS is_editable boolean DEFAULT true;

COMMENT ON COLUMN risk_templates.is_editable IS 'System templates (is_system=true) are not editable by users';

-- Set is_editable = false for all system templates (defaults)
UPDATE risk_templates SET is_editable = false WHERE is_system = true;
UPDATE risk_templates SET is_editable = true WHERE is_system = false;

-- ============================================
-- 2. UPDATE CUSTOM FIELD TEMPLATES TABLE - Add organization_id
-- ============================================

ALTER TABLE custom_field_templates
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

COMMENT ON COLUMN custom_field_templates.organization_id IS 'Organization this template belongs to; NULL for personal templates';
COMMENT ON COLUMN custom_field_templates.is_default IS 'System default templates (not editable)';

-- ============================================
-- 3. DROP OLD RLS POLICIES FOR RISK TEMPLATES
-- ============================================

DROP POLICY IF EXISTS "Users can view templates" ON risk_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON risk_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON risk_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON risk_templates;

-- ============================================
-- 4. CREATE NEW RLS POLICIES FOR RISK TEMPLATES
-- ============================================

-- View policies: System templates visible to all, custom templates only to organization members
CREATE POLICY "View system and org templates" ON risk_templates
  FOR SELECT USING (
    -- System templates visible to everyone
    is_system = true
    -- OR templates from user's organization
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    -- OR personal templates created by user
    OR created_by = auth.uid()
  );

-- Insert policy: Users can create templates for their organization
CREATE POLICY "Create org templates" ON risk_templates
  FOR INSERT WITH CHECK (
    -- Must belong to an organization and be a member, OR be creating personal template
    (
      organization_id IS NOT NULL 
      AND organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
    OR (
      organization_id IS NULL 
      AND created_by = auth.uid()
    )
  );

-- Update policy: Only custom templates can be edited by their org/creator
CREATE POLICY "Update own templates" ON risk_templates
  FOR UPDATE USING (
    is_editable = true
    AND (
      -- Creator of personal template
      (organization_id IS NULL AND created_by = auth.uid())
      -- OR member of organization that owns template
      OR (
        organization_id IS NOT NULL 
        AND organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  );

-- Delete policy: Only custom templates can be deleted
CREATE POLICY "Delete own templates" ON risk_templates
  FOR DELETE USING (
    is_editable = true
    AND (
      -- Creator of personal template
      (organization_id IS NULL AND created_by = auth.uid())
      -- OR member of organization that owns template
      OR (
        organization_id IS NOT NULL 
        AND organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  );

-- ============================================
-- 5. DROP OLD RLS POLICIES FOR CUSTOM FIELD TEMPLATES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own templates" ON custom_field_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON custom_field_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON custom_field_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON custom_field_templates;

-- ============================================
-- 6. CREATE NEW RLS POLICIES FOR CUSTOM FIELD TEMPLATES
-- ============================================

-- View policies: System defaults visible to all, org templates to members, personal to creator
CREATE POLICY "View system and org custom field templates" ON custom_field_templates
  FOR SELECT USING (
    -- System default templates
    is_default = true
    -- OR templates from user's organization
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    -- OR personal templates created by user
    OR (organization_id IS NULL AND user_id = auth.uid())
  );

-- Insert policy: Users can create templates for their organization or personal
CREATE POLICY "Create org custom field templates" ON custom_field_templates
  FOR INSERT WITH CHECK (
    -- Can create for their organization
    (
      organization_id IS NOT NULL 
      AND organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
    -- OR personal template
    OR (organization_id IS NULL AND user_id = auth.uid())
  );

-- Update policy: Only non-default templates can be edited
CREATE POLICY "Update custom field templates" ON custom_field_templates
  FOR UPDATE USING (
    is_default = false
    AND (
      -- Creator of personal template
      (organization_id IS NULL AND user_id = auth.uid())
      -- OR member of organization that owns template
      OR (
        organization_id IS NOT NULL 
        AND organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  );

-- Delete policy: Only non-default templates can be deleted
CREATE POLICY "Delete custom field templates" ON custom_field_templates
  FOR DELETE USING (
    is_default = false
    AND (
      -- Creator of personal template
      (organization_id IS NULL AND user_id = auth.uid())
      -- OR member of organization that owns template
      OR (
        organization_id IS NOT NULL 
        AND organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  );

-- ============================================
-- 7. CREATE FUNCTION TO GET APPLICABLE TEMPLATES BY RISK LEVEL
-- ============================================

CREATE OR REPLACE FUNCTION get_templates_by_risk_level(
  p_risk_level text,
  p_organization_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  is_system boolean,
  is_editable boolean,
  organization_id uuid,
  created_by uuid,
  applies_to_levels text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.name,
    rt.description,
    rt.is_system,
    rt.is_editable,
    rt.organization_id,
    rt.created_by,
    rt.applies_to_levels
  FROM risk_templates rt
  WHERE 
    -- Filter by risk level
    (rt.ai_act_level = p_risk_level OR p_risk_level = ANY(rt.applies_to_levels))
    AND rt.is_active = true
    -- System templates visible to all
    AND (
      rt.is_system = true
      -- OR organization templates (only if org matches)
      OR (
        p_organization_id IS NOT NULL 
        AND rt.organization_id = p_organization_id
      )
      -- OR personal templates visible to all (if no org filter)
      OR (p_organization_id IS NULL AND rt.organization_id IS NULL)
    )
  ORDER BY 
    rt.is_system DESC, -- System templates first
    rt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_templates_by_risk_level IS 'Returns templates applicable to a specific risk level, scoped by organization';

-- ============================================
-- 8. CREATE SIMILAR FUNCTION FOR CUSTOM FIELD TEMPLATES
-- ============================================

CREATE OR REPLACE FUNCTION get_custom_field_templates_by_level(
  p_applies_to text,
  p_organization_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  is_default boolean,
  organization_id uuid,
  user_id uuid,
  field_definitions jsonb,
  applies_to text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cft.id,
    cft.name,
    cft.description,
    cft.is_default,
    cft.organization_id,
    cft.user_id,
    cft.field_definitions,
    cft.applies_to
  FROM custom_field_templates cft
  WHERE 
    -- Filter by applies_to level
    (cft.applies_to = p_applies_to OR cft.applies_to = 'global')
    AND cft.is_active = true
    -- System default templates visible to all
    AND (
      cft.is_default = true
      -- OR organization templates (only if org matches)
      OR (
        p_organization_id IS NOT NULL 
        AND cft.organization_id = p_organization_id
      )
      -- OR personal templates visible to creator only (if no org filter)
      OR (p_organization_id IS NULL AND cft.organization_id IS NULL)
    )
  ORDER BY 
    cft.is_default DESC, -- System templates first
    cft.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_custom_field_templates_by_level IS 'Returns custom field templates by applies_to level, scoped by organization';

-- ============================================
-- 9. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_risk_templates_organization_id ON risk_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_templates_is_system ON risk_templates(is_system);
CREATE INDEX IF NOT EXISTS idx_risk_templates_is_editable ON risk_templates(is_editable);
CREATE INDEX IF NOT EXISTS idx_custom_field_templates_organization_id ON custom_field_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_templates_is_default ON custom_field_templates(is_default);

-- ============================================
-- 10. METADATA COMMENTS
-- ============================================

COMMENT ON TABLE risk_templates IS 'Risk templates for AI systems - system defaults (not editable) + organization custom templates (editable)';
COMMENT ON COLUMN risk_templates.is_editable IS 'System templates (is_system=true, is_default=true) are read-only';
COMMENT ON COLUMN risk_templates.applies_to_levels IS 'Array of risk levels this template applies to: ["high_risk"], ["limited_risk", "minimal_risk"], etc.';

COMMENT ON TABLE custom_field_templates IS 'Custom field templates - system defaults + organization custom templates scoped by organization';
COMMENT ON COLUMN custom_field_templates.organization_id IS 'Organization owner; NULL for personal templates';
COMMENT ON COLUMN custom_field_templates.is_default IS 'System default templates are read-only and available to all';
