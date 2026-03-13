-- Migration: 20260408100000_risk_control_catalog.sql

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

-- Table: use_case_risks (Note: This table assumes a `use_cases` table exists, which is not defined in the prompt.
-- For this migration, we define it as a standalone table as per the prompt's example.
-- If a `use_cases` table exists elsewhere, foreign key constraint should be adjusted.)
CREATE TABLE IF NOT EXISTS use_case_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id uuid, -- Placeholder, assuming a `use_cases` table might exist. Constraint to be added if `use_cases` table is confirmed.
  catalog_risk_id uuid REFERENCES risk_catalog(id),
  custom_name text,
  custom_description text,
  status text DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated', 'accepted')),
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: use_case_controls (Note: This table assumes a `use_cases` table exists, which is not defined in the prompt.
-- For this migration, we define it as a standalone table as per the prompt's example.
-- If a `use_cases` table exists elsewhere, foreign key constraint should be adjusted.)
CREATE TABLE IF NOT EXISTS use_case_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id uuid, -- Placeholder, assuming a `use_cases` table might exist. Constraint to be added if `use_cases` table is confirmed.
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
