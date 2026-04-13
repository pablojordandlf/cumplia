-- Add assignment fields to use_case_obligations
-- Allows assigning obligations to specific org members

ALTER TABLE use_case_obligations
  ADD COLUMN IF NOT EXISTS assigned_to_email TEXT;

CREATE INDEX IF NOT EXISTS idx_use_case_obligations_assigned_to_email
  ON use_case_obligations(assigned_to_email);
