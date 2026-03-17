-- Migration: 20250317000001_create_risk_management_tables.sql
-- Description: Complete risk management system for AI Act compliance (Article 9)

-- ============================================
-- 1. RISK CATALOG - MIT AI Risk Repository
-- ============================================

CREATE TABLE IF NOT EXISTS risk_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_number integer NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  domain text NOT NULL,
  subdomain text,
  ai_act_article text NOT NULL,
  ai_act_level text NOT NULL CHECK (ai_act_level IN ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk')),
  criticality text NOT NULL CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
  timing text NOT NULL CHECK (timing IN ('pre-deployment', 'post-deployment', 'both')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE risk_catalog IS 'MIT AI Risk Repository - 50 prioritized risks mapped to AI Act';

-- Enable RLS
ALTER TABLE risk_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view risk catalog" ON risk_catalog
  FOR SELECT USING (true);

-- ============================================
-- 2. RISK TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS risk_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ai_act_level text NOT NULL CHECK (ai_act_level IN ('high_risk', 'limited_risk', 'minimal_risk')),
  is_default boolean DEFAULT false,
  is_system boolean DEFAULT false,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE risk_templates IS 'Templates defining which risks apply to different AI Act risk levels';

-- Enable RLS
ALTER TABLE risk_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates" ON risk_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own templates" ON risk_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON risk_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates" ON risk_templates
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- 3. RISK TEMPLATE ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS risk_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES risk_templates(id) ON DELETE CASCADE,
  catalog_risk_id uuid NOT NULL REFERENCES risk_catalog(id) ON DELETE CASCADE,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, catalog_risk_id)
);

COMMENT ON TABLE risk_template_items IS 'Links templates to specific risks from catalog';

-- Enable RLS
ALTER TABLE risk_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view template items" ON risk_template_items
  FOR SELECT USING (true);

CREATE POLICY "Template owners can manage items" ON risk_template_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM risk_templates rt 
      WHERE rt.id = risk_template_items.template_id 
      AND rt.created_by = auth.uid()
    )
  );

-- ============================================
-- 4. AI SYSTEM RISKS (Risk instances for each system)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_system_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  catalog_risk_id uuid NOT NULL REFERENCES risk_catalog(id),
  template_id uuid REFERENCES risk_templates(id),
  
  -- Assessment fields
  status text DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated', 'accepted', 'not_applicable')),
  probability text CHECK (probability IN ('low', 'medium', 'high', 'critical')),
  impact text CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  residual_risk_score integer CHECK (residual_risk_score >= 1 AND residual_risk_score <= 10),
  
  -- Mitigation fields
  mitigation_measures text,
  responsible_person text,
  due_date date,
  completed_at timestamptz,
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(ai_system_id, catalog_risk_id)
);

COMMENT ON TABLE ai_system_risks IS 'Risk assessments and mitigation tracking for each AI system';

-- Enable RLS
ALTER TABLE ai_system_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own system risks" ON ai_system_risks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM use_cases uc 
      WHERE uc.id = ai_system_risks.ai_system_id 
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own system risks" ON ai_system_risks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM use_cases uc 
      WHERE uc.id = ai_system_risks.ai_system_id 
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own system risks" ON ai_system_risks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc 
      WHERE uc.id = ai_system_risks.ai_system_id 
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own system risks" ON ai_system_risks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM use_cases uc 
      WHERE uc.id = ai_system_risks.ai_system_id 
      AND uc.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. INDEXES
-- ============================================

CREATE INDEX idx_risk_catalog_domain ON risk_catalog(domain);
CREATE INDEX idx_risk_catalog_criticality ON risk_catalog(criticality);
CREATE INDEX idx_risk_catalog_ai_act_level ON risk_catalog(ai_act_level);

CREATE INDEX idx_risk_templates_level ON risk_templates(ai_act_level);
CREATE INDEX idx_risk_templates_org ON risk_templates(organization_id);

CREATE INDEX idx_template_items_template ON risk_template_items(template_id);
CREATE INDEX idx_template_items_risk ON risk_template_items(catalog_risk_id);

CREATE INDEX idx_ai_system_risks_system ON ai_system_risks(ai_system_id);
CREATE INDEX idx_ai_system_risks_status ON ai_system_risks(status);
CREATE INDEX idx_ai_system_risks_catalog ON ai_system_risks(catalog_risk_id);

-- ============================================
-- 6. TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_risk_catalog_updated_at BEFORE UPDATE ON risk_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_templates_updated_at BEFORE UPDATE ON risk_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_system_risks_updated_at BEFORE UPDATE ON ai_system_risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
