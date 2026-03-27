-- Add risk_analysis_completed column to use_cases table
ALTER TABLE use_cases ADD COLUMN IF NOT EXISTS risk_analysis_completed BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_use_cases_risk_analysis_completed ON use_cases(risk_analysis_completed);
CREATE INDEX IF NOT EXISTS idx_use_cases_ai_act_level_risk_analysis ON use_cases(ai_act_level, risk_analysis_completed);

-- Add comment
COMMENT ON COLUMN use_cases.risk_analysis_completed IS 'Tracks whether a risk analysis has been completed for this system (template applied + at least 1 applicable factor + user marked as complete)';
