-- Migration: Fix updated_by trigger issue
-- The trigger is trying to access 'updated_by' column which doesn't exist

-- Option 1: Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS on_use_case_update ON use_cases;
DROP FUNCTION IF EXISTS handle_use_case_update();

-- Option 2: Alternatively, if you want to keep audit functionality,
-- we can create the missing column and proper trigger
-- Uncomment the following lines if you want audit tracking:

-- ALTER TABLE use_cases 
-- ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- CREATE OR REPLACE FUNCTION handle_use_case_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   NEW.updated_by = auth.uid();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_use_case_update
--   BEFORE UPDATE ON use_cases
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_use_case_update();
