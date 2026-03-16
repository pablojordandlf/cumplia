-- Migration: Fix all database issues
-- 1. Add notes column to use_case_versions
-- 2. Drop problematic updated_by trigger

-- Add notes column if it doesn't exist
ALTER TABLE use_case_versions 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop the problematic trigger that references updated_by
DROP TRIGGER IF EXISTS on_use_case_update ON use_cases;
DROP FUNCTION IF EXISTS handle_use_case_update();

-- Also check for any other triggers that might reference updated_by
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE action_statement LIKE '%updated_by%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_rec.trigger_name, trigger_rec.event_object_table);
    END LOOP;
END $$;
