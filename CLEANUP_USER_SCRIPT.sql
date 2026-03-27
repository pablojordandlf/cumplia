-- ============================================
-- 🧹 CLEANUP SCRIPT: Borrar usuario y datos asociados
-- User: pablo.jordan.dlf@gmail.com
-- ============================================
-- ⚠️ IMPORTANTE: Este script elimina PERMANENTEMENTE
-- todos los datos del usuario. Hacer backup antes.
-- ============================================

-- 1. Buscar el user_id desde auth.users
-- Primero, verifica que el usuario existe:
SELECT id, email, created_at FROM auth.users 
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- Guardar el user_id en una variable (reemplaza <USER_ID> abajo con el valor real)
-- Ejemplo: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

-- ============================================
-- 2. ELIMINAR DATOS EN ORDEN (respetando foreign keys)
-- ============================================

-- Paso 1: Eliminar invitaciones que el usuario ENVIÓ
DELETE FROM pending_invitations 
WHERE invited_by = '<USER_ID>';

-- Paso 2: Eliminar invitaciones dirigidas al usuario (por email)
DELETE FROM pending_invitations 
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- Paso 3: Eliminar actividades/audits del usuario
DELETE FROM audit_logs 
WHERE user_id = '<USER_ID>';

-- Paso 4: Eliminar roles del usuario en organizaciones
DELETE FROM organization_members 
WHERE user_id = '<USER_ID>';

-- Paso 5: Eliminar organizaciones que el usuario creó (cascade borrará todo lo relacionado)
-- ⚠️ Solo si el usuario es el ÚNICO dueño
DELETE FROM organizations 
WHERE created_by = '<USER_ID>' 
AND id NOT IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id != '<USER_ID>' AND status = 'active'
);

-- Paso 6: Eliminar perfil de usuario (si existe tabla de profiles)
DELETE FROM profiles 
WHERE user_id = '<USER_ID>';

-- Paso 7: Finalmente, eliminar el usuario de auth.users
-- ⚠️ Esto es PERMANENTE - no se puede recuperar
DELETE FROM auth.users 
WHERE id = '<USER_ID>';

-- ============================================
-- 3. VERIFICAR QUE ESTÁ LIMPIO
-- ============================================

-- Verificar que no quedan datos del usuario:
SELECT 'pending_invitations (invited_by)' as table_name, COUNT(*) as count FROM pending_invitations WHERE invited_by = '<USER_ID>'
UNION ALL
SELECT 'pending_invitations (email)', COUNT(*) FROM pending_invitations WHERE email = 'pablo.jordan.dlf@gmail.com'
UNION ALL
SELECT 'organization_members', COUNT(*) FROM organization_members WHERE user_id = '<USER_ID>'
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs WHERE user_id = '<USER_ID>'
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles WHERE user_id = '<USER_ID>'
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users WHERE id = '<USER_ID>';

-- Si todos retornan 0, está completamente limpio ✅

-- ============================================
-- ALTERNATIVA: Script más seguro (paso a paso)
-- ============================================
-- Si prefieres ejecutar de una vez sin el user_id manual:

-- OPCIÓN A: Ver las organizaciones que el usuario es miembro
SELECT om.organization_id, o.name, om.role, om.status
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = '<USER_ID>';

-- OPCIÓN B: Ver las invitaciones que el usuario envió
SELECT id, email, organization_id, status, created_at
FROM pending_invitations
WHERE invited_by = '<USER_ID>';

-- OPCIÓN C: Ver las invitaciones dirigidas al usuario (por email)
SELECT id, organization_id, role, status, created_at
FROM pending_invitations
WHERE email = 'pablo.jordan.dlf@gmail.com';

-- ============================================
-- 🎯 PASOS PARA EJECUTAR ESTE SCRIPT
-- ============================================
-- 1. Ve a Supabase Studio → SQL Editor
-- 2. Corre la query de búsqueda (línea 14-16) para obtener el user_id
-- 3. Copia el user_id (formato: UUID)
-- 4. Reemplaza TODOS los '<USER_ID>' en este archivo con el valor real
-- 5. Ejecuta cada sección por separado (2, 3, etc.) para ver resultados
-- 6. Ejecuta la sección de VERIFICAR para confirmar que está limpio
-- 7. ¡Listo! El usuario está completamente borrado de la BD

-- ============================================
-- 📝 NOTAS DE SEGURIDAD
-- ============================================
-- - Este script NO afecta:
--   * Historiales en auth_audit_log (Supabase mantiene internamente)
--   * Backups automáticos (Supabase los mantiene por 30 días)
--   * Logs de API (si existen en otra tabla)
--
-- - Asegúrate de:
--   * Hacer backup ANTES de ejecutar
--   * Reemplazar <USER_ID> correctamente (no dejar placeholders)
--   * Ejecutar en el ambiente correcto (dev, no production)
--   * Revisar las queries de verificación antes de eliminar
