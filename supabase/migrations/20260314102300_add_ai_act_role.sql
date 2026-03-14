-- ============================================
-- MIGRATION: Add ai_act_role column to use_cases
-- ============================================
-- Ejecutar esto en el SQL Editor de Supabase
-- 
-- Esta columna almacena el rol del usuario según el AI Act:
-- provider, deployer, distributor, importer
-- ============================================

-- Añadir columna ai_act_role
ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS ai_act_role TEXT 
CHECK (ai_act_role IN ('provider', 'deployer', 'distributor', 'importer'));

-- Comentario documentación
COMMENT ON COLUMN use_cases.ai_act_role IS 'Rol del usuario según AI Act Art. 3: provider, deployer, distributor, importer';

-- Crear índice para búsquedas eficientes por rol
CREATE INDEX IF NOT EXISTS idx_use_cases_ai_act_role ON use_cases(ai_act_role);

-- ============================================
-- VERIFICACIÓN (opcional - descomentar para probar)
-- ============================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'use_cases' AND column_name = 'ai_act_role';
