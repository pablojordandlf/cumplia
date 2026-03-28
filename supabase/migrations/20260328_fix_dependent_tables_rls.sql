-- Migration: 20260328_fix_dependent_tables_rls.sql
-- Description: Fix RLS policies for tables dependent on use_cases (risks, controls, etc.)
-- Note: Only applies to tables that actually exist in the schema
-- Created: 2026-03-28

-- ============================================
-- HELPER: Fix RLS for any risk-related table
-- These tables depend on use_cases, so users should see risks for systems they can access
-- ============================================

-- Check if table exists before applying policies
-- This is safe to run even if tables don't exist yet

-- If ai_system_risks exists, apply policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_system_risks') THEN
    
    -- Drop old policies
    DROP POLICY IF EXISTS ai_system_risks_select ON ai_system_risks;
    DROP POLICY IF EXISTS ai_system_risks_insert ON ai_system_risks;
    DROP POLICY IF EXISTS ai_system_risks_update ON ai_system_risks;
    DROP POLICY IF EXISTS ai_system_risks_delete ON ai_system_risks;
    
    -- New policy: Users can see risks for systems they can access
    CREATE POLICY ai_system_risks_select ON ai_system_risks
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = ai_system_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                )
              )
            )
        )
      );
    
    CREATE POLICY ai_system_risks_insert ON ai_system_risks
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = ai_system_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                    AND om.role IN ('owner', 'admin', 'editor')
                )
              )
            )
        )
      );
    
    CREATE POLICY ai_system_risks_update ON ai_system_risks
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = ai_system_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                    AND om.role IN ('owner', 'admin', 'editor')
                )
              )
            )
        )
      );
    
    CREATE POLICY ai_system_risks_delete ON ai_system_risks
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = ai_system_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
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
  END IF;
END $$;

-- If use_case_risks exists, apply policy (common alternative table name)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'use_case_risks') THEN
    
    DROP POLICY IF EXISTS use_case_risks_select ON use_case_risks;
    DROP POLICY IF EXISTS use_case_risks_insert ON use_case_risks;
    DROP POLICY IF EXISTS use_case_risks_update ON use_case_risks;
    DROP POLICY IF EXISTS use_case_risks_delete ON use_case_risks;
    
    CREATE POLICY use_case_risks_select ON use_case_risks
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = use_case_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                )
              )
            )
        )
      );
    
    CREATE POLICY use_case_risks_insert ON use_case_risks
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = use_case_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                    AND om.role IN ('owner', 'admin', 'editor')
                )
              )
            )
        )
      );
    
    CREATE POLICY use_case_risks_update ON use_case_risks
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = use_case_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                    AND om.role IN ('owner', 'admin', 'editor')
                )
              )
            )
        )
      );
    
    CREATE POLICY use_case_risks_delete ON use_case_risks
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = use_case_risks.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
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
  END IF;
END $$;

-- If risk_analysis exists, apply policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risk_analysis') THEN
    
    DROP POLICY IF EXISTS risk_analysis_select ON risk_analysis;
    DROP POLICY IF EXISTS risk_analysis_insert ON risk_analysis;
    DROP POLICY IF EXISTS risk_analysis_update ON risk_analysis;
    DROP POLICY IF EXISTS risk_analysis_delete ON risk_analysis;
    
    CREATE POLICY risk_analysis_select ON risk_analysis
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = risk_analysis.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                )
              )
            )
        )
      );
    
    CREATE POLICY risk_analysis_insert ON risk_analysis
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = risk_analysis.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                    AND om.role IN ('owner', 'admin', 'editor')
                )
              )
            )
        )
      );
    
    CREATE POLICY risk_analysis_update ON risk_analysis
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = risk_analysis.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
                uc.organization_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = uc.organization_id
                    AND om.user_id = auth.uid()
                    AND om.status = 'active'
                    AND om.role IN ('owner', 'admin', 'editor')
                )
              )
            )
        )
      );
    
    CREATE POLICY risk_analysis_delete ON risk_analysis
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM use_cases uc
          WHERE uc.id = risk_analysis.use_case_id
            AND (
              uc.user_id = auth.uid()
              OR (
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
  END IF;
END $$;

-- ============================================
-- Verification: List all tables with RLS enabled
-- ============================================

SELECT 
  schemaname,
  tablename,
  COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
