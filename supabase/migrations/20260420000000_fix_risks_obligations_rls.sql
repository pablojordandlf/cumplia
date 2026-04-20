-- Migration: Fix RLS policies for use_case_risks and use_case_obligations
-- Problem: current policies only allow access via org membership, breaking solo users
-- Fix: allow access if the user owns the use_case (user_id match) OR is an org member

-- ============================================================
-- use_case_risks: drop org-only policies, restore user+org
-- ============================================================

DROP POLICY IF EXISTS "Users can view system risks via organization" ON use_case_risks;
DROP POLICY IF EXISTS "Users can insert system risks via organization" ON use_case_risks;
DROP POLICY IF EXISTS "Users can update system risks via organization" ON use_case_risks;
DROP POLICY IF EXISTS "Users can delete system risks via organization" ON use_case_risks;

DROP POLICY IF EXISTS use_case_risks_select ON use_case_risks;
DROP POLICY IF EXISTS use_case_risks_insert ON use_case_risks;
DROP POLICY IF EXISTS use_case_risks_update ON use_case_risks;
DROP POLICY IF EXISTS use_case_risks_delete ON use_case_risks;

CREATE POLICY "use_case_risks_select" ON use_case_risks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = use_case_risks.use_case_id
        AND (
          uc.user_id = auth.uid()
          OR uc.organization_id IN (SELECT get_user_org_ids(auth.uid()))
        )
    )
  );

CREATE POLICY "use_case_risks_insert" ON use_case_risks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = use_case_risks.use_case_id
        AND (
          uc.user_id = auth.uid()
          OR uc.organization_id IN (SELECT get_user_org_ids(auth.uid()))
        )
    )
  );

CREATE POLICY "use_case_risks_update" ON use_case_risks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = use_case_risks.use_case_id
        AND (
          uc.user_id = auth.uid()
          OR uc.organization_id IN (SELECT get_user_org_ids(auth.uid()))
        )
    )
  );

CREATE POLICY "use_case_risks_delete" ON use_case_risks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc
      WHERE uc.id = use_case_risks.use_case_id
        AND (
          uc.user_id = auth.uid()
          OR uc.organization_id IN (SELECT get_user_org_ids(auth.uid()))
        )
    )
  );

-- ============================================================
-- use_case_obligations: replace org-only policy with user+org
-- Solo users have organization_id = NULL so the old policy blocked them
-- ============================================================

DROP POLICY IF EXISTS "Org members can view obligations" ON use_case_obligations;
DROP POLICY IF EXISTS "Org members can insert obligations" ON use_case_obligations;
DROP POLICY IF EXISTS "Org members can update obligations" ON use_case_obligations;
DROP POLICY IF EXISTS "Org members can delete obligations" ON use_case_obligations;

CREATE POLICY "use_case_obligations_select" ON use_case_obligations
  FOR SELECT USING (
    use_case_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "use_case_obligations_insert" ON use_case_obligations
  FOR INSERT WITH CHECK (
    use_case_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "use_case_obligations_update" ON use_case_obligations
  FOR UPDATE USING (
    use_case_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "use_case_obligations_delete" ON use_case_obligations
  FOR DELETE USING (
    use_case_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (SELECT get_user_org_ids(auth.uid()))
    )
  );
