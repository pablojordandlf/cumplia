-- Script para asignar plan Professional al usuario (para pruebas)
-- Ejecutar en Supabase SQL Editor

-- IMPORTANTE: Reemplaza 'USER_ID_AQUI' con tu UUID real de Supabase Auth
-- Puedes obtener tu user_id ejecutando: SELECT id FROM auth.users WHERE email = 'tu@email.com';

-- Opción 1: Asignar a través de la tabla subscriptions (método recomendado)
INSERT INTO public.subscriptions (
    user_id,
    plan_type,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    current_period_end
) VALUES (
    'USER_ID_AQUI',  -- <-- REEMPLAZA ESTO: Ve a Supabase Auth > Users y copia tu UUID
    'professional',  -- Plan Professional (ilimitado en casos de uso y documentos)
    'active',
    'cus_manual_dev',
    'sub_manual_dev',
    NOW() + INTERVAL '100 years'  -- Válido por 100 años (pruebas)
)
ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'professional',
    status = 'active',
    current_period_end = NOW() + INTERVAL '100 years',
    updated_at = NOW();

-- Opción 2: Si usas tabla organizations
UPDATE public.organizations
SET 
    plan_name = 'professional',
    subscription_status = 'active'
WHERE id = 'USER_ID_AQUI';  -- <-- REEMPLAZA ESTO con tu UUID

-- Verificar que se asignó correctamente
SELECT 
    u.id as user_id,
    u.email,
    s.plan_type,
    s.status,
    s.current_period_end,
    o.plan_name as org_plan,
    o.subscription_status as org_status
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
LEFT JOIN public.organizations o ON o.id = u.id
WHERE u.email = 'tu@email.com';  -- <-- O usa: WHERE u.id = 'TU_UUID_AQUI'

-- Resultado esperado:
-- plan_type = 'professional' 
-- status = 'active'
-- current_period_end = fecha futura (2099+)
