-- CLEANUP: Eliminar todos los registros de pablo.jordan.dlf@gmail.com
-- ⚠️ EJECUTAR EN ESTE ORDEN (mantener dependencias)

-- 1️⃣ PASO 1: Obtener el user_id (necesario para los demás pasos)
SELECT id as user_id, email, created_at FROM auth.users 
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- 2️⃣ PASO 2: Ver qué invitaciones existen para este email
SELECT id, email, status, invite_expires_at, organization_id 
FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- 3️⃣ PASO 3: Ver membresías de organización
SELECT id, user_id, organization_id, role, status 
FROM organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com' LIMIT 1);

-- 4️⃣ PASO 4: Ver logs de aceptación de invitaciones
SELECT id, user_id, invitation_id, accepted_at, ip_address 
FROM invitation_acceptance_logs 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com' LIMIT 1);

---
-- 🗑️ ELIMINAR EN ESTE ORDEN (respetando FK constraints):

-- PASO 1: Eliminar logs de aceptación (no tiene FK dependientes)
DELETE FROM invitation_acceptance_logs 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com' LIMIT 1);

-- PASO 2: Eliminar membresías de organización
DELETE FROM organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com' LIMIT 1);

-- PASO 3: Eliminar invitaciones pendientes
DELETE FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- PASO 4: Eliminar usuario de auth.users (⚠️ Esto eliminará el usuario de Supabase Auth)
-- 🔴 SOLO ejecutar si REALMENTE quieres eliminar la cuenta
DELETE FROM auth.users 
WHERE email = 'pablo.jordan.dlf@gmail.com';

---
-- ✅ VERIFICACIÓN FINAL
SELECT 'auth.users' as tabla, COUNT(*) as registros FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com'
UNION ALL
SELECT 'organization_members', COUNT(*) FROM organization_members WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com' LIMIT 1)
UNION ALL
SELECT 'pending_invitations', COUNT(*) FROM pending_invitations WHERE email = 'pablo.jordan.dlf@gmail.com'
UNION ALL
SELECT 'invitation_acceptance_logs', COUNT(*) FROM invitation_acceptance_logs WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pablo.jordan.dlf@gmail.com' LIMIT 1);

-- Debería retornar 0 en todas las filas si la limpieza fue exitosa
