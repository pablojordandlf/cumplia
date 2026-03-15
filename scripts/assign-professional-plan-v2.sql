-- Script para asignar plan Professional al usuario (usando organizations)
-- Ejecutar en Supabase SQL Editor

-- OPCIÓN 1: Usando la tabla organizations (método recomendado si subscriptions no existe)
-- ================================================================================

-- Primero, verificar que existe tu usuario y obtener info
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Verificar si ya tienes una organización
SELECT * FROM public.organizations 
WHERE id IN (
    SELECT org_id FROM public.organization_members 
    WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'
);

-- Si NO tienes organización, crear una:
INSERT INTO public.organizations (
    id,
    name,
    plan_name,
    subscription_status,
    subscription_ends_at,
    created_at,
    updated_at
) VALUES (
    '357a36c9-4154-49ee-90f7-5fb7453efcf7',  -- Mismo UUID que el usuario
    'Mi Empresa',  -- Cambia esto por el nombre de tu empresa
    'professional',  -- Plan professional (ilimitado)
    'active',
    NOW() + INTERVAL '100 years',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    plan_name = 'professional',
    subscription_status = 'active',
    subscription_ends_at = NOW() + INTERVAL '100 years',
    updated_at = NOW();

-- Si ya tienes organización, actualizar el plan:
UPDATE public.organizations
SET 
    plan_name = 'professional',
    subscription_status = 'active',
    subscription_ends_at = NOW() + INTERVAL '100 years',
    updated_at = NOW()
WHERE id IN (
    SELECT org_id FROM public.organization_members 
    WHERE user_id = '357a36c9-4154-49ee-90f7-5fb7453efcf7'
);

-- Crear relación usuario-organización si no existe:
INSERT INTO public.organization_members (
    user_id,
    org_id,
    role,
    joined_at
) VALUES (
    '357a36c9-4154-49ee-90f7-5fb7453efcf7',
    '357a36c9-4154-49ee-90f7-5fb7453efcf7',
    'admin',
    NOW()
)
ON CONFLICT (user_id, org_id) DO NOTHING;

-- Verificar que todo quedó correctamente:
SELECT 
    u.id as user_id,
    u.email,
    o.id as org_id,
    o.name as org_name,
    o.plan_name,
    o.subscription_status,
    o.subscription_ends_at
FROM auth.users u
LEFT JOIN public.organization_members om ON om.user_id = u.id
LEFT JOIN public.organizations o ON o.id = om.org_id
WHERE u.id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Resultado esperado:
-- plan_name = 'professional'
-- subscription_status = 'active'
-- subscription_ends_at = fecha futura (2099+)

-- OPCIÓN 2: Si prefieres crear la tabla subscriptions (alternativa)
-- =================================================================
/*
-- Descomenta esto si quieres crear la tabla subscriptions:

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    plan_type VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Luego insertar tu suscripción:
INSERT INTO public.subscriptions (
    user_id,
    plan_type,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    current_period_end
) VALUES (
    '357a36c9-4154-49ee-90f7-5fb7453efcf7',
    'professional',
    'active',
    'cus_manual_dev',
    'sub_manual_dev',
    NOW() + INTERVAL '100 years'
)
ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'professional',
    status = 'active',
    current_period_end = NOW() + INTERVAL '100 years',
    updated_at = NOW();
*/
