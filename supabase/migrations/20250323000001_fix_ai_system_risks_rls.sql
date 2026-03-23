-- Migration: Fix ai_system_risks RLS policies for organization-based permissions
-- Date: 2026-03-23
-- Description: Updates RLS policies on ai_system_risks to use organization membership
-- instead of legacy user_id checks

BEGIN;

-- Drop old policies that check use_cases.user_id
DROP POLICY IF EXISTS "Users can view own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can insert own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can update own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can delete own system risks" ON ai_system_risks;

-- Create new policies based on organization membership

-- SELECT: Any active member can view risks
CREATE POLICY "Users can view system risks via organization" 
ON ai_system_risks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM use_cases uc 
    JOIN organization_members om ON om.organization_id = uc.organization_id
    WHERE uc.id = ai_system_risks.ai_system_id 
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- INSERT: Only editors, admins, and owners can create risks
CREATE POLICY "Users can insert system risks via organization" 
ON ai_system_risks FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM use_cases uc 
    JOIN organization_members om ON om.organization_id = uc.organization_id
    WHERE uc.id = ai_system_risks.ai_system_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin', 'editor')
    AND om.status = 'active'
  )
);

-- UPDATE: Only editors, admins, and owners can update risks
CREATE POLICY "Users can update system risks via organization" 
ON ai_system_risks FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM use_cases uc 
    JOIN organization_members om ON om.organization_id = uc.organization_id
    WHERE uc.id = ai_system_risks.ai_system_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin', 'editor')
    AND om.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM use_cases uc 
    JOIN organization_members om ON om.organization_id = uc.organization_id
    WHERE uc.id = ai_system_risks.ai_system_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin', 'editor')
    AND om.status = 'active'
  )
);

-- DELETE: Only admins and owners can delete risks
CREATE POLICY "Users can delete system risks via organization" 
ON ai_system_risks FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM use_cases uc 
    JOIN organization_members om ON om.organization_id = uc.organization_id
    WHERE uc.id = ai_system_risks.ai_system_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
);

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (opcional)
-- ============================================
/*
-- Verificar que las políticas nuevas están activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ai_system_risks'
ORDER BY policyname;
*/