-- Migration: 20260328_fix_ai_system_risks_rls.sql
-- Description: Update RLS policies for ai_system_risks to work with org-scoped systems

-- ============================================
-- 1. RECREATE ai_system_risks RLS POLICIES
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can insert own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can update own system risks" ON ai_system_risks;
DROP POLICY IF EXISTS "Users can delete own system risks" ON ai_system_risks;

-- NEW POLICY 1: SELECT - Can view if owner or org member
CREATE POLICY ai_system_risks_select ON ai_system_risks
  FOR SELECT USING (
    -- Owner of the system
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = ai_system_risks.ai_system_id
        AND uc.user_id = auth.uid()
    )
    OR
    -- OR member of the organization
    (
      EXISTS (
        SELECT 1 FROM use_cases uc
        WHERE uc.id = ai_system_risks.ai_system_id
          AND uc.organization_id IS NOT NULL
      )
      AND EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = (
          SELECT uc.organization_id FROM use_cases uc
          WHERE uc.id = ai_system_risks.ai_system_id
        )
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'editor', 'viewer')
      )
    )
  );

-- NEW POLICY 2: INSERT - Can create if creator or org admin
CREATE POLICY ai_system_risks_insert ON ai_system_risks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = ai_system_risks.ai_system_id
        AND (
          -- Creator
          uc.user_id = auth.uid()
          OR
          -- Org admin/owner
          (
            uc.organization_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM organization_members om
              WHERE om.organization_id = uc.organization_id
                AND om.user_id = auth.uid()
                AND om.status = 'active'
                AND om.role IN ('owner', 'admin')
            )
          )
        )
    )
  );

-- NEW POLICY 3: UPDATE - Creator or org admin can update
CREATE POLICY ai_system_risks_update ON ai_system_risks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = ai_system_risks.ai_system_id
        AND (
          -- Creator
          uc.user_id = auth.uid()
          OR
          -- Org admin
          (
            uc.organization_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM organization_members om
              WHERE om.organization_id = uc.organization_id
                AND om.user_id = auth.uid()
                AND om.status = 'active'
                AND om.role IN ('owner', 'admin')
            )
          )
        )
    )
  );

-- NEW POLICY 4: DELETE - Only creator can delete
CREATE POLICY ai_system_risks_delete ON ai_system_risks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = ai_system_risks.ai_system_id
        AND uc.user_id = auth.uid()
    )
  );

-- ============================================
-- 2. VERIFY RLS POLICIES
-- ============================================

SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'ai_system_risks'
ORDER BY policyname;
