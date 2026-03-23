-- Migration: Fix ai_system_risks RLS policies for organization-based permissions
-- Date: 2026-03-23
-- Description: Updates RLS policies to use organization membership instead of user_id

-- ============================================
-- 1. DROP OLD POLICIES (user_id based)
-- ============================================

DROP POLICY IF EXISTS "Users can view own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can insert own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can update own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can delete own system risks" ON ai_system_risks;

-- ============================================
-- 2. CREATE NEW POLICIES (organization based)
-- ============================================

-- Policy: Organization members can view risks of their AI systems
CREATE POLICY "Org members can view system risks" ON ai_system_risks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      JOIN organization_members om ON om.organization_id = uc.organization_id
      WHERE uc.id = ai_system_risks.ai_system_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Policy: Editors, Admins, and Owners can insert risks
CREATE POLICY "Editors can insert system risks" ON ai_system_risks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM use_cases uc
      JOIN organization_members om ON om.organization_id = uc.organization_id
      WHERE uc.id = ai_system_risks.ai_system_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'editor')
      AND om.status = 'active'
    )
  );

-- Policy: Editors, Admins, and Owners can update risks
CREATE POLICY "Editors can update system risks" ON ai_system_risks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      JOIN organization_members om ON om.organization_id = uc.organization_id
      WHERE uc.id = ai_system_risks.ai_system_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'editor')
      AND om.status = 'active'
    )
  );

-- Policy: Only Admins and Owners can delete risks
CREATE POLICY "Admins can delete system risks" ON ai_system_risks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      JOIN organization_members om ON om.organization_id = uc.organization_id
      WHERE uc.id = ai_system_risks.ai_system_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
    )
  );

-- ============================================
-- 3. VERIFY POLICIES
-- ============================================

-- Run this to verify:
/*
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'ai_system_risks'
ORDER BY policyname;
*/
