-- ============================================
-- 🧹 CLEANUP SCRIPT COMPLETO: Borrar usuario y TODOS sus datos
-- User: pablo.jordan.dlf@gmail.com
-- User ID: 357a36c9-4154-49ee-90f7-5fb7453efcf7
-- ============================================
-- Este script borra en el ORDEN CORRECTO respetando
-- todas las foreign key constraints
-- ============================================

-- Reemplaza este valor con el user_id que obtuviste:
-- SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com';

-- ============================================
-- ORDEN DE ELIMINACIÓN (respetando foreign keys)
-- ============================================
-- 1. use_case_versions (creadas por el usuario)
-- 2. use_cases (creadas por el usuario)
-- 3. pending_invitations (enviadas o dirigidas al usuario)
-- 4. organization_members (membresías del usuario)
-- 5. audit_logs (audits del usuario)
-- 6. profiles (perfil del usuario)
-- 7. auth.users (finalmente el usuario)

-- ============================================
-- 1️⃣ BORRAR use_case_versions CREADAS POR EL USUARIO
-- ============================================
DELETE FROM use_case_versions 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar:
SELECT COUNT(*) as use_case_versions_remaining 
FROM use_case_versions 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';
-- Debe retornar: 0

-- ============================================
-- 2️⃣ BORRAR use_cases CREADAS POR EL USUARIO
-- ============================================
DELETE FROM use_cases 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar:
SELECT COUNT(*) as use_cases_remaining 
FROM use_cases 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';
-- Debe retornar: 0

-- ============================================
-- 3️⃣ BORRAR OTRAS TABLAS CON FOREIGN KEYS
-- ============================================

-- Risk analysis (si existen)
DELETE FROM risk_analysis 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Risk details (si existen)
DELETE FROM risk_details 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Templates (si existen)
DELETE FROM templates 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Systems (si existen)
DELETE FROM systems 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 4️⃣ BORRAR pending_invitations
-- ============================================

-- Invitaciones que el usuario ENVIÓ
DELETE FROM pending_invitations 
WHERE invited_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Invitaciones dirigidas al usuario (por email)
DELETE FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- Verificar:
SELECT COUNT(*) as pending_invitations_remaining 
FROM pending_invitations 
WHERE invited_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'
OR email = 'pablo.jordan.dlf@gmail.com';
-- Debe retornar: 0

-- ============================================
-- 5️⃣ BORRAR organization_members
-- ============================================
DELETE FROM organization_members 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar:
SELECT COUNT(*) as org_members_remaining 
FROM organization_members 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';
-- Debe retornar: 0

-- ============================================
-- 6️⃣ BORRAR audit_logs (si existen)
-- ============================================
DELETE FROM audit_logs 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar:
SELECT COUNT(*) as audit_logs_remaining 
FROM audit_logs 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';
-- Debe retornar: 0 (o la tabla puede no existir)

-- ============================================
-- 7️⃣ BORRAR profiles
-- ============================================
DELETE FROM profiles 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar:
SELECT COUNT(*) as profiles_remaining 
FROM profiles 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';
-- Debe retornar: 0 (o la tabla puede no existir)

-- ============================================
-- 8️⃣ FINALMENTE: BORRAR EL USUARIO DE AUTH
-- ============================================
DELETE FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar:
SELECT COUNT(*) as users_remaining 
FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';
-- Debe retornar: 0 ✅

-- ============================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================
-- Si TODOS estos retornan 0, está completamente limpio:

SELECT 'use_case_versions' as table_name, COUNT(*) as remaining_rows 
FROM use_case_versions 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'use_cases', COUNT(*) 
FROM use_cases 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'risk_analysis', COUNT(*) 
FROM risk_analysis 
WHERE created_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'organization_members', COUNT(*) 
FROM organization_members 
WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'pending_invitations (invited_by)', COUNT(*) 
FROM pending_invitations 
WHERE invited_by = '357a36c9-4154-49ee-90f7-5fb7453efcf7'

UNION ALL
SELECT 'pending_invitations (email)', COUNT(*) 
FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com'

UNION ALL
SELECT 'auth.users', COUNT(*) 
FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- ============================================
-- 📋 SI AÚN HAY ERRORES DE FOREIGN KEY
-- ============================================
-- Ejecuta esto para ver QUÉ está referenciando al usuario:

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.column_name = 'id'
AND ccu.table_name = 'users'
ORDER BY tc.table_name;

-- Esto te mostrará TODAS las tablas que tienen foreign keys a users.id
-- Luego puedes borrar datos de esas tablas primero
