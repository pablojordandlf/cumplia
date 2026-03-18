-- ============================================
-- DIAGNÓSTICO RLS - Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Verificar que el usuario existe en organization_members
SELECT 
    om.id,
    om.user_id,
    om.email,
    om.role,
    om.status,
    om.organization_id,
    o.name as org_name,
    o.owner_id
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = '662a9430-6051-44bd-80fa-bbedc39add21'::uuid
   OR om.email = 'pablo.jordan@moeveglobal.com';

-- 2. Verificar políticas activas en organization_members
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'organization_members';

-- 3. Verificar si el usuario puede ver su propio registro (simulación RLS)
-- Esto debería retornar el registro si las políticas funcionan
SET ROLE postgres;
SELECT * FROM organization_members 
WHERE user_id = '662a9430-6051-44bd-80fa-bbedc39add21'::uuid;

-- 4. Verificar si hay problema con la columna user_id
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'organization_members' 
AND column_name = 'user_id';

-- 5. Ver todos los registros de la tabla (como admin)
-- CUIDADO: Esto muestra todos los registros
SELECT id, user_id, email, role, status, organization_id, created_at
FROM organization_members
ORDER BY created_at DESC
LIMIT 10;
