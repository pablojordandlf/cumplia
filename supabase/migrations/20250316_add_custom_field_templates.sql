-- Migration: Create custom_field_templates table for template management
CREATE TABLE IF NOT EXISTS custom_field_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Template scope: 'global' or specific risk level
    applies_to VARCHAR(50) NOT NULL DEFAULT 'global', -- 'global', 'prohibited', 'high', 'limited', 'minimal', 'gpai', 'unclassified'
    -- Array of field definitions (key names only, values are empty initially)
    field_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Example: [{"id": "uuid", "key": "Responsable"}, {"id": "uuid", "key": "URL"}]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_field_templates_user_id 
ON custom_field_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_custom_field_templates_applies_to 
ON custom_field_templates(applies_to);

CREATE INDEX IF NOT EXISTS idx_custom_field_templates_active 
ON custom_field_templates(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE custom_field_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own templates"
    ON custom_field_templates
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
    ON custom_field_templates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON custom_field_templates
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON custom_field_templates
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_custom_field_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_custom_field_templates_updated_at 
ON custom_field_templates;

CREATE TRIGGER trigger_update_custom_field_templates_updated_at
    BEFORE UPDATE ON custom_field_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_field_templates_updated_at();

COMMENT ON TABLE custom_field_templates IS 'Templates for custom fields that can be applied to use cases based on risk level';
COMMENT ON COLUMN custom_field_templates.applies_to IS 'Scope: global or specific ai_act_level value';
COMMENT ON COLUMN custom_field_templates.field_definitions IS 'Array of field keys without values: [{"id": "uuid", "key": "Field Name"}]';
