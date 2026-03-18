-- Verificar que el usuario puede leer su propia membresía
-- Reemplaza con tu email

-- 1. Verificar que la membresía existe
SELECT 
    om.id,
    om.user_id,
    om.email,
    om.role,
    om.status,
    om.organization_id,
    o.name as org_name
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.email = 'pablo.jordan@moeveglobal.com';

-- 2. Verificar las políticas RLS activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'organization_members';

-- 3. Verificar que la política "Users can view own membership" existe
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'organization_members' 
AND policyname = 'Users can view own membership';

-- 4. Si la política no existe, crearla manualmente:
-- CREATE POLICY "Users can view own membership" 
--   ON organization_members FOR SELECT USING (user_id = auth.uid());
