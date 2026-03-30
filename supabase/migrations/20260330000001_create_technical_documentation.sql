-- Technical documentation table (Art. 11 + Annex IV of EU AI Act)
CREATE TABLE IF NOT EXISTS technical_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  -- Annex IV Section 1: General description
  system_purpose TEXT,
  intended_users TEXT,
  deployment_context TEXT,
  -- Annex IV Section 2: Architecture and development
  architecture_description TEXT,
  training_data_description TEXT,
  training_methodology TEXT,
  -- Annex IV Section 3: Performance metrics
  accuracy_metrics TEXT,
  robustness_measures TEXT,
  known_limitations TEXT,
  -- Annex IV Section 4: Risk management reference
  risk_management_summary TEXT,
  -- Annex IV Section 5: Changes and versioning
  version TEXT DEFAULT '1.0',
  change_log TEXT,
  -- Annex IV Section 6: Human oversight
  human_oversight_measures TEXT,
  stop_mechanism TEXT,
  -- Meta
  completeness_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_technical_documentation_use_case ON technical_documentation(use_case_id);

ALTER TABLE technical_documentation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_manage_tech_docs"
  ON technical_documentation FOR ALL
  USING (
    use_case_id IN (
      SELECT uc.id FROM use_cases uc
      JOIN organization_members om ON om.organization_id = uc.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );
