-- ============================================
-- SUPABASE MIGRATION: AI Act Compliance App
-- ============================================
-- Este archivo debe ejecutarse en el SQL Editor de Supabase
-- O via CLI: supabase db push

-- ============================================
-- 1. TABLA: Catálogo de Casos de Uso Predefinidos
-- ============================================
CREATE TABLE IF NOT EXISTS use_case_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sector TEXT NOT NULL,
    ai_act_level TEXT NOT NULL CHECK (ai_act_level IN ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk')),
    typical_purpose TEXT,
    obligations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. TABLA: Casos de Uso del Usuario
-- ============================================
CREATE TABLE IF NOT EXISTS use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_id UUID REFERENCES use_case_catalog(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    sector TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'classified', 'in_review', 'compliant', 'non_compliant')),
    ai_act_level TEXT DEFAULT 'unclassified' CHECK (ai_act_level IN ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'unclassified')),
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    classification_reason TEXT,
    classification_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_use_cases_user_id ON use_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_use_cases_status ON use_cases(status);
CREATE INDEX IF NOT EXISTS idx_use_cases_sector ON use_cases(sector);
CREATE INDEX IF NOT EXISTS idx_use_cases_ai_act_level ON use_cases(ai_act_level);
CREATE INDEX IF NOT EXISTS idx_use_cases_deleted_at ON use_cases(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- 4. TRIGGER PARA updated_at AUTOMÁTICO
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_use_cases_updated_at ON use_cases;
CREATE TRIGGER update_use_cases_updated_at
    BEFORE UPDATE ON use_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) - CRÍTICO
-- ============================================

-- Habilitar RLS en ambas tablas
ALTER TABLE use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE use_case_catalog ENABLE ROW LEVEL SECURITY;

-- Políticas para use_cases: Usuarios solo ven/modifican sus propios registros
DROP POLICY IF EXISTS use_cases_select_own ON use_cases;
CREATE POLICY use_cases_select_own ON use_cases
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS use_cases_insert_own ON use_cases;
CREATE POLICY use_cases_insert_own ON use_cases
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS use_cases_update_own ON use_cases;
CREATE POLICY use_cases_update_own ON use_cases
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS use_cases_delete_own ON use_cases;
CREATE POLICY use_cases_delete_own ON use_cases
    FOR DELETE USING (user_id = auth.uid());

-- Política para use_case_catalog: Todos los usuarios autenticados pueden leer
DROP POLICY IF EXISTS catalog_select_all ON use_case_catalog;
CREATE POLICY catalog_select_all ON use_case_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins pueden modificar el catálogo (opcional, comentado por defecto)
-- DROP POLICY IF EXISTS catalog_admin_all ON use_case_catalog;
-- CREATE POLICY catalog_admin_all ON use_case_catalog
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 6. SEED DATA: Catálogo de Casos de Uso AI Act
-- ============================================

INSERT INTO use_case_catalog (name, description, sector, ai_act_level, typical_purpose, obligations) VALUES
-- Prohibited
('Subliminal Manipulation', 'Sistemas de IA que manipulación subliminal para alterar comportamiento', 'general', 'prohibited', 'Manipulación de comportamiento', '["Art. 5.1.a"]'),
('Social Scoring', 'Sistemas de puntuación social por parte de autoridades públicas', 'government', 'prohibited', 'Clasificación ciudadana', '["Art. 5.1.c"]'),
('Real-time Remote Biometric ID', 'Identificación biométrica remota en tiempo real en espacios públicos', 'security', 'prohibited', 'Vigilancia masiva', '["Art. 5.1.d"]'),

-- High Risk
('Recruitment AI', 'IA para selección de personal y evaluación de candidatos', 'employment', 'high_risk', 'Evaluación de empleo', '["Art. 6.2", "Art. 10"]'),
('Credit Scoring', 'Algoritmos de puntuación crediticia para préstamos', 'finance', 'high_risk', 'Evaluación financiera', '["Art. 6.2", "Art. 10"]'),
('Medical Diagnosis AI', 'IA para diagnóstico médico y tratamiento', 'healthcare', 'high_risk', 'Diagnóstico clínico', '["Art. 6.1.a", "Art. 10"]'),
('Education Assessment', 'Evaluación educativa automatizada que afecta acceso a formación', 'education', 'high_risk', 'Evaluación académica', '["Art. 6.1.b"]'),
('Justice/Risk Assessment', 'Evaluación de riesgo en contextos judiciales', 'justice', 'high_risk', 'Asistencia judicial', '["Art. 6.1.d"]'),
('Border Control', 'Verificación de identidad en fronteras', 'border', 'high_risk', 'Control migratorio', '["Art. 6.1.g"]'),
('Critical Infrastructure', 'Gestión de infraestructura crítica (agua, energía, transporte)', 'infrastructure', 'high_risk', 'Operación crítica', '["Art. 6.1.c"]'),

-- Limited Risk
('Chatbot', 'Chatbots que interactúan con humanos', 'customer_service', 'limited_risk', 'Atención al cliente', '["Art. 50"]'),
('Emotion Recognition', 'Reconocimiento de emociones (no biométrico)', 'general', 'limited_risk', 'Análisis de sentimiento', '["Art. 50"]'),
('Deepfake Disclosure', 'Contenido generado por IA que debe ser revelado', 'media', 'limited_risk', 'Generación de contenido', '["Art. 50"]'),

-- Minimal Risk
('AI-Enabled Games', 'Videojuegos con elementos de IA', 'entertainment', 'minimal_risk', 'Entretenimiento', '[]'),
('Spam Filter', 'Filtros de spam en correo electrónico', 'general', 'minimal_risk', 'Filtrado de contenido', '[]'),
('Product Recommendations', 'Sistema de recomendación de productos', 'ecommerce', 'minimal_risk', 'Personalización', '[]')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. COMENTARIOS DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE use_cases IS 'Casos de uso de IA creados por usuarios para clasificación AI Act';
COMMENT ON TABLE use_case_catalog IS 'Catálogo predefinido de casos de uso según regulación AI Act';
COMMENT ON COLUMN use_cases.ai_act_level IS 'Nivel de riesgo según AI Act: prohibited, high_risk, limited_risk, minimal_risk, unclassified';
COMMENT ON COLUMN use_cases.user_id IS 'Referencia al usuario propietario (RLS aplica)';

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================
