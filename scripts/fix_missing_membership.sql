-- Script para crear organización y membresía faltante para un usuario existente
-- Reemplaza el email con el del usuario afectado

DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_company_name TEXT;
    v_slug TEXT;
    v_org_id UUID;
BEGIN
    -- CONFIGURACIÓN: Cambiar este email por el del usuario
    v_email := 'pablo.jordan@moeveglobal.com';
    
    -- Buscar el usuario
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', v_email;
    END IF;
    
    -- Verificar si ya tiene organización como owner
    SELECT id INTO v_org_id
    FROM organizations
    WHERE owner_id = v_user_id;
    
    -- Verificar si ya tiene membresía
    IF EXISTS (
        SELECT 1 FROM organization_members 
        WHERE user_id = v_user_id
    ) THEN
        RAISE NOTICE 'El usuario ya tiene membresía. No se requieren cambios.';
        RETURN;
    END IF;
    
    -- Si tiene organización pero no membresía, crearla
    IF v_org_id IS NOT NULL THEN
        INSERT INTO organization_members (
            organization_id, user_id, email, role, status, invited_by
        ) VALUES (
            v_org_id, v_user_id, v_email, 'owner', 'active', v_user_id
        );
        RAISE NOTICE 'Membresía creada para organización existente %', v_org_id;
    ELSE
        -- Crear nueva organización
        v_company_name := COALESCE(
            (SELECT raw_user_meta_data->>'company_name' FROM auth.users WHERE id = v_user_id),
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id),
            split_part(v_email, '@', 1),
            'Mi Organización'
        );
        
        v_slug := LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(v_user_id::TEXT, 1, 8);
        
        INSERT INTO organizations (
            name, slug, owner_id, plan, seats_total, seats_used
        ) VALUES (
            v_company_name, v_slug, v_user_id, 'starter', 1, 1
        )
        RETURNING id INTO v_org_id;
        
        -- Crear membresía para owner
        INSERT INTO organization_members (
            organization_id, user_id, email, role, status, invited_by
        ) VALUES (
            v_org_id, v_user_id, v_email, 'owner', 'active', v_user_id
        );
        
        RAISE NOTICE 'Organización % creada con ID %', v_company_name, v_org_id;
        RAISE NOTICE 'Membresía owner creada para %', v_email;
    END IF;
END $$;

-- Verificación
SELECT 
    u.email,
    o.name as org_name,
    o.id as org_id,
    om.role,
    om.status
FROM auth.users u
LEFT JOIN organizations o ON o.owner_id = u.id
LEFT JOIN organization_members om ON om.user_id = u.id
WHERE u.email = 'pablo.jordan@moeveglobal.com';
