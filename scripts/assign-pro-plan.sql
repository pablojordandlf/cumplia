-- Script para asignar plan Pro/Agency al usuario de Pablo
-- Ejecutar en Supabase SQL Editor

-- Opción 1: Asignar a través de la tabla subscriptions (método recomendado)
-- Reemplaza 'USER_ID_AQUI' con el UUID real del usuario de Pablo

INSERT INTO public.subscriptions (
    user_id,
    plan_type,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    current_period_end
) VALUES (
    'USER_ID_AQUI',  -- <-- Reemplaza esto con tu user_id de Supabase Auth
    'pro',  -- o 'agency' para plan Agency
    'active',
    'cus_manual_' || gen_random_uuid(),
    'sub_manual_' || gen_random_uuid(),
    NOW() + INTERVAL '100 years'  -- Válido por 100 años (prácticamente ilimitado)
)
ON CONFLICT (user_id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = 'active',
    current_period_end = NOW() + INTERVAL '100 years',
    updated_at = NOW();

-- Opción 2: Alternativamente, asignar a través de la tabla organizations
UPDATE public.organizations
SET 
    plan_name = 'pro',  -- o 'agency'
    subscription_status = 'active'
WHERE id = 'USER_ID_AQUI';  -- <-- Reemplaza esto con tu user_id

-- Verificar el plan asignado
SELECT 
    u.id,
    u.email,
    s.plan_type,
    s.status,
    o.plan_name as org_plan
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
LEFT JOIN public.organizations o ON o.id = u.id
WHERE u.id = 'USER_ID_AQUI';  -- <-- Reemplaza esto con tu user_id
