-- Diagnóstico: Fuerza eliminación total y recreación simple
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Desactivar RLS temporalmente para verificar
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'organization_members'
    LOOP
        EXECUTE format('DROP POLICY %I ON organization_members', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- PASO 3: Verificar que no queden políticas
SELECT 'Políticas restantes después de eliminar:' as info, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'organization_members';
