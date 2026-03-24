-- Migration: Fix RLS policies for use_case_risks table
-- Created: 2026-03-23
-- Issue: API routes use organization membership checks but RLS policies still check legacy user_id

-- Drop existing RLS policies if they exist (old legacy policies)
DROP POLICY IF EXISTS "Users can view own system risks" ON use_case_risks;
DROP POLICY IF EXISTS "Users can insert own system risks" ON use_case_risks;
DROP POLICY IF EXISTS "Users can update own system risks" ON use_case_risks;
DROP POLICY IF EXISTS "Users can delete own system risks" ON use_case_risks;

-- Drop new policies if they exist (in case of partial previous run)
DROP POLICY IF EXISTS "Organization members can view risks" ON use_case_risks;
DROP POLICY IF EXISTS "Organization editors can insert risks" ON use_case_risks;
DROP POLICY IF EXISTS "Organization editors can update risks" ON use_case_risks;
DROP POLICY IF EXISTS "Organization admins can delete risks" ON use_case_risks;

-- Enable RLS on use_case_risks
ALTER TABLE use_case_risks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for organization members
CREATE POLICY "Organization members can view risks"
ON use_case_risks
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM use_cases uc
        JOIN organization_members om ON uc.organization_id = om.organization_id
        WHERE uc.id = use_case_risks.use_case_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
);

-- Policy: Allow insert for editors, admins, and owners
CREATE POLICY "Organization editors can insert risks"
ON use_case_risks
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM use_cases uc
        JOIN organization_members om ON uc.organization_id = om.organization_id
        WHERE uc.id = use_case_risks.use_case_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor')
    )
);

-- Policy: Allow update for editors, admins, and owners
CREATE POLICY "Organization editors can update risks"
ON use_case_risks
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM use_cases uc
        JOIN organization_members om ON uc.organization_id = om.organization_id
        WHERE uc.id = use_case_risks.use_case_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM use_cases uc
        JOIN organization_members om ON uc.organization_id = om.organization_id
        WHERE uc.id = use_case_risks.use_case_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor')
    )
);

-- Policy: Allow delete for admins and owners only
CREATE POLICY "Organization admins can delete risks"
ON use_case_risks
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM use_cases uc
        JOIN organization_members om ON uc.organization_id = om.organization_id
        WHERE uc.id = use_case_risks.use_case_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
);

-- Also update risk_templates RLS policies to allow organization-based access
DROP POLICY IF EXISTS "Users can view own templates" ON risk_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON risk_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON risk_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON risk_templates;

-- Drop new template policies if they exist (in case of partial previous run)
DROP POLICY IF EXISTS "Organization members can view templates" ON risk_templates;
DROP POLICY IF EXISTS "Organization editors can insert templates" ON risk_templates;
DROP POLICY IF EXISTS "Organization editors can update templates" ON risk_templates;
DROP POLICY IF EXISTS "Organization admins can delete templates" ON risk_templates;

-- Policy: View templates (system templates + own org templates)
CREATE POLICY "Organization members can view templates"
ON risk_templates
FOR SELECT
USING (
    is_system = true 
    OR organization_id IS NULL
    OR EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = risk_templates.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
);

-- Policy: Insert templates (own org only)
CREATE POLICY "Organization editors can insert templates"
ON risk_templates
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = risk_templates.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor')
    )
);

-- Policy: Update templates (own org + not system templates)
CREATE POLICY "Organization editors can update templates"
ON risk_templates
FOR UPDATE
USING (
    is_system = false
    AND EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = risk_templates.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor')
    )
)
WITH CHECK (
    is_system = false
    AND EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = risk_templates.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor')
    )
);

-- Policy: Delete templates (own org + not system templates + admin/owner only)
CREATE POLICY "Organization admins can delete templates"
ON risk_templates
FOR DELETE
USING (
    is_system = false
    AND EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = risk_templates.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
);
