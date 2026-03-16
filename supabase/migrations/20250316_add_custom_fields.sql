-- Migration: Add custom_fields column for dynamic additional information
-- This allows users to add custom key-value pairs to each use case

-- Add custom_fields column as JSONB
ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

-- Create index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_use_cases_custom_fields 
ON use_cases USING GIN (custom_fields);

-- Add comment for documentation
COMMENT ON COLUMN use_cases.custom_fields IS 'Array of custom field objects with key, value, and id properties';
