-- Tabla para versionado de casos de uso
CREATE TABLE IF NOT EXISTS use_case_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sector TEXT,
    ai_act_level TEXT,
    ai_act_role TEXT,
    classification_data JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_notes TEXT,
    
    CONSTRAINT unique_version_per_use_case UNIQUE (use_case_id, version_number)
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_use_case_versions_use_case_id ON use_case_versions(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_versions_created_at ON use_case_versions(created_at);

-- Políticas de seguridad RLS
ALTER TABLE use_case_versions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver versiones de sus propios casos de uso
CREATE POLICY "Users can view their own use case versions" 
    ON use_case_versions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM use_cases 
            WHERE use_cases.id = use_case_versions.use_case_id 
            AND use_cases.user_id = auth.uid()
        )
    );

-- Política: Los usuarios solo pueden crear versiones de sus propios casos de uso
CREATE POLICY "Users can create versions for their own use cases" 
    ON use_case_versions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM use_cases 
            WHERE use_cases.id = use_case_versions.use_case_id 
            AND use_cases.user_id = auth.uid()
        )
    );

-- Trigger para auto-incrementar número de versión si no se especifica
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.version_number IS NULL THEN
        SELECT COALESCE(MAX(version_number), 0) + 1
        INTO NEW.version_number
        FROM use_case_versions
        WHERE use_case_id = NEW.use_case_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_version_number ON use_case_versions;
CREATE TRIGGER trigger_set_version_number
    BEFORE INSERT ON use_case_versions
    FOR EACH ROW
    EXECUTE FUNCTION set_version_number();

-- Trigger para crear versión automáticamente al actualizar un caso de uso
CREATE OR REPLACE FUNCTION create_version_on_update()
RETURNS TRIGGER AS $$
DECLARE
    last_version INTEGER;
BEGIN
    -- Solo crear versión si cambió la clasificación o datos importantes
    IF OLD.classification_data IS DISTINCT FROM NEW.classification_data OR
       OLD.ai_act_level IS DISTINCT FROM NEW.ai_act_level OR
       OLD.name IS DISTINCT FROM NEW.name OR
       OLD.description IS DISTINCT FROM NEW.description THEN
        
        -- Obtener última versión
        SELECT COALESCE(MAX(version_number), 0) INTO last_version
        FROM use_case_versions
        WHERE use_case_id = NEW.id;
        
        -- Insertar versión anterior
        INSERT INTO use_case_versions (
            use_case_id,
            version_number,
            name,
            description,
            sector,
            ai_act_level,
            ai_act_role,
            classification_data,
            created_by,
            created_at,
            version_notes
        ) VALUES (
            OLD.id,
            last_version + 1,
            OLD.name,
            OLD.description,
            OLD.sector,
            OLD.ai_act_level,
            OLD.ai_act_role,
            OLD.classification_data,
            OLD.updated_by,
            OLD.updated_at,
            'Versión creada automáticamente por modificación'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_version_on_update ON use_cases;
CREATE TRIGGER trigger_create_version_on_update
    BEFORE UPDATE ON use_cases
    FOR EACH ROW
    EXECUTE FUNCTION create_version_on_update();

-- Vista para ver versiones con email del creador
CREATE OR REPLACE VIEW use_case_versions_with_users AS
SELECT 
    v.*,
    u.email as created_by_email
FROM use_case_versions v
LEFT JOIN auth.users u ON v.created_by = u.id;

-- Comentarios
COMMENT ON TABLE use_case_versions IS 'Almacena el historial de versiones de cada caso de uso';
COMMENT ON COLUMN use_case_versions.version_number IS 'Número secuencial de versión dentro de cada caso de uso';
COMMENT ON COLUMN use_case_versions.classification_data IS 'Snapshot de los datos de clasificación AI Act en el momento de la versión';
COMMENT ON COLUMN use_case_versions.version_notes IS 'Notas opcionales sobre qué cambió en esta versión';
