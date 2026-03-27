-- ============================================
-- 🧹 FINAL CLEANUP: Borrar usuario completamente
-- User Email: pablo.jordan.dlf@gmail.com
-- User ID: 357a36c9-4154-49ee-90f7-5fb7453efcf7
-- ============================================
-- Este script incluye TODAS las tablas encontradas
-- en information_schema (11 tablas con FKs)
-- ============================================

-- Orden de eliminación (respetando foreign keys):
-- 1. use_case_versions (created_by FK) ← PRIMERO
-- 2. use_case_versions_with_users (view - no delete needed)
-- 3. use_cases (user_id FK)
-- 4. use_case_obligations (user_id FK)
-- 5. obligation_evidences (user_id FK)
-- 6. risk_templates (created_by FK)
-- 7. custom_field_templates (user_id FK)
-- 8. pending_invitations (invited_by FK)
-- 9. organization_members (user_id FK)
-- 10. organizations (owner_id FK) ← si es el único owner
-- 11. auth.users (FINAL - NO SE PUEDE RECUPERAR)

-- ============================================
-- 1️⃣ DELETE FROM use_case_versions
-- ============================================
DELETE FROM use_case_versions 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'use_case_versions deleted' as status, COUNT(*) as count 
FROM use_case_versions 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 2️⃣ DELETE FROM use_cases
-- ============================================
DELETE FROM use_cases 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'use_cases deleted' as status, COUNT(*) as count 
FROM use_cases 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 3️⃣ DELETE FROM use_case_obligations
-- ============================================
DELETE FROM use_case_obligations 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'use_case_obligations deleted' as status, COUNT(*) as count 
FROM use_case_obligations 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 4️⃣ DELETE FROM obligation_evidences
-- ============================================
DELETE FROM obligation_evidences 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'obligation_evidences deleted' as status, COUNT(*) as count 
FROM obligation_evidences 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 5️⃣ DELETE FROM risk_templates
-- ============================================
DELETE FROM risk_templates 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'risk_templates deleted' as status, COUNT(*) as count 
FROM risk_templates 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 6️⃣ DELETE FROM custom_field_templates
-- ============================================
DELETE FROM custom_field_templates 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'custom_field_templates deleted' as status, COUNT(*) as count 
FROM custom_field_templates 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 7️⃣ DELETE FROM pending_invitations
-- ============================================

-- Invitaciones que el usuario ENVIÓ
DELETE FROM pending_invitations 
WHERE invited_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Invitaciones dirigidas al email del usuario
DELETE FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com';

SELECT 'pending_invitations deleted' as status, COUNT(*) as count 
FROM pending_invitations 
WHERE invited_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7' 
OR email = 'pablo.jordan.dlf@gmail.com';

-- ============================================
-- 8️⃣ DELETE FROM organization_members
-- ============================================
DELETE FROM organization_members 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'organization_members deleted' as status, COUNT(*) as count 
FROM organization_members 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 9️⃣ DELETE FROM organizations (CUIDADO)
-- ============================================
-- Solo si el usuario es el ÚNICO owner/creator
-- Primero verifica cuántas organizaciones tiene

SELECT id, name, owner_id, created_at 
FROM organizations 
WHERE owner_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Si retorna resultados, decides si borrarlas:
-- Opción A: Si la org NO tiene otros miembros, puedes borrarla:
DELETE FROM organizations 
WHERE owner_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'
AND id NOT IN (
  SELECT DISTINCT organization_id 
  FROM organization_members 
  WHERE user_id != '357a36c9-4154-49ee-90f7-5fb7453efcf7'
);

-- Opción B: Si quieres transferir la org a otro usuario, 
-- ejecuta esto en lugar de DELETE:
-- UPDATE organizations 
-- SET owner_id = '<OTRO_USER_ID>' 
-- WHERE owner_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'organizations deleted' as status, COUNT(*) as count 
FROM organizations 
WHERE owner_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 🔟 FINALMENTE: DELETE FROM auth.users
-- ============================================
-- ⚠️ ESTO ES PERMANENTE - NO SE PUEDE RECUPERAR
-- ⚠️ Asegúrate que todos los pasos anteriores completaron

DELETE FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

SELECT 'auth.users deleted' as status, COUNT(*) as count 
FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- ✅ VERIFICACIÓN FINAL - TODO DEBE SER 0
-- ============================================

SELECT 'use_case_versions' as table_name, COUNT(*) as remaining 
FROM use_case_versions 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'use_cases', COUNT(*) 
FROM use_cases 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'use_case_obligations', COUNT(*) 
FROM use_case_obligations 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'obligation_evidences', COUNT(*) 
FROM obligation_evidences 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'risk_templates', COUNT(*) 
FROM risk_templates 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'custom_field_templates', COUNT(*) 
FROM custom_field_templates 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'pending_invitations (by user)', COUNT(*) 
FROM pending_invitations 
WHERE invited_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'pending_invitations (email)', COUNT(*) 
FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com'

UNION ALL
SELECT 'organization_members', COUNT(*) 
FROM organization_members 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'organizations', COUNT(*) 
FROM organizations 
WHERE owner_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'auth.users', COUNT(*) 
FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Si TODOS retornan 0 → Usuario completamente borrado ✅

-- ============================================
-- 📋 INSTRUCCIONES DE EJECUCIÓN
-- ============================================
-- 1. Copia TODOS los statements de arriba (desde 1️⃣ hasta 🔟)
-- 2. Vete a Supabase Studio → SQL Editor
-- 3. Pega el código completo
-- 4. Dale "RUN" o Ctrl+Enter
-- 5. Ve los resultados (cada DELETE mostrará cuántos registros eliminó)
-- 6. IMPORTANTE: Lee el resultado de "DELETE FROM organizations"
--    - Si retorna 0: el usuario no creó organizaciones ✅
--    - Si retorna N: tienes organizaciones sin otros miembros (las borrará)
-- 7. Ejecuta la VERIFICACIÓN FINAL (último SELECT)
-- 8. Si TODOS retornan 0 → Perfecto! Usuario completamente limpio ✅
-- 9. Si ALGUNO retorna > 0 → Algo no se borró, revisa los errores
