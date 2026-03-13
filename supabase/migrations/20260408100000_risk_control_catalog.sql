-- Migration: 20260408100000_risk_control_catalog.sql

-- Table: use_cases (base table for use case inventory)
CREATE TABLE IF NOT EXISTS use_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sector text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'classified', 'analyzed', 'compliant', 'non_compliant')),
  ai_act_level text DEFAULT 'unclassified' CHECK (ai_act_level IN ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'unclassified')),
  confidence_score numeric(3,2),
  classification_reason text,
  classification_data jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on use_cases
ALTER TABLE use_cases ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own use cases
CREATE POLICY "Users can view own use_cases" ON use_cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own use_cases" ON use_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own use_cases" ON use_cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own use_cases" ON use_cases
  FOR DELETE USING (auth.uid() = user_id);

-- Table: use_case_catalog (predefined use case templates/suggestions)
CREATE TABLE IF NOT EXISTS use_case_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  sector text NOT NULL,
  typical_ai_act_level text NOT NULL CHECK (typical_ai_act_level IN ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'unclassified')),
  template_data jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on use_case_catalog (read-only for all authenticated users)
ALTER TABLE use_case_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view catalog" ON use_case_catalog
  FOR SELECT USING (true);

-- Table: risk_catalog
CREATE TABLE IF NOT EXISTS risk_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  ai_act_article text NOT NULL,
  ai_act_level text NOT NULL CHECK (ai_act_level IN ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk')),
  category text NOT NULL,
  sector_tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: control_catalog
CREATE TABLE IF NOT EXISTS control_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  implementation_guide text,
  ai_act_level text NOT NULL CHECK (ai_act_level IN ('high_risk', 'limited_risk', 'minimal_risk')),
  category text NOT NULL,
  related_risk_ids uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: use_case_risks
CREATE TABLE IF NOT EXISTS use_case_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id uuid REFERENCES use_cases(id) ON DELETE CASCADE,
  catalog_risk_id uuid REFERENCES risk_catalog(id),
  custom_name text,
  custom_description text,
  status text DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated', 'accepted')),
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: use_case_controls
CREATE TABLE IF NOT EXISTS use_case_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id uuid REFERENCES use_cases(id) ON DELETE CASCADE,
  use_case_risk_id uuid REFERENCES use_case_risks(id) ON DELETE CASCADE,
  catalog_control_id uuid REFERENCES control_catalog(id),
  custom_name text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'implemented', 'verified', 'failed')),
  implementation_notes text,
  evidence_url text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
