-- ============================================
-- SCRIPT COMPLETO: Crear tablas de billing + Asignar plan Professional
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABLA: Organizations (Organizaciones/Empresas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    plan_name VARCHAR(50) DEFAULT 'starter',
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    subscription_status VARCHAR(50),
    subscription_ends_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TABLA: Organization Members (relación usuario-org)
-- ============================================
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, org_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(org_id);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
DROP POLICY IF EXISTS org_members_select_own ON organization_members;
CREATE POLICY org_members_select_own ON organization_members
    FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 3. TABLA: Plans (Estructura de Precios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    stripe_price_id VARCHAR(100),
    price_monthly DECIMAL(8,2),
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insertar planes actuales (Starter/Essential/Professional/Enterprise)
INSERT INTO public.plans (name, display_name, price_monthly, limits) VALUES
('starter', 'Starter', 0.00, '{"use_cases": 1, "documents": 0, "users": 1, "fria_generation": false, "api_access": false}'),
('essential', 'Essential', 29.00, '{"use_cases": 5, "documents": 5, "users": 3, "fria_generation": true, "api_access": false}'),
('professional', 'Professional', 99.00, '{"use_cases": -1, "documents": -1, "users": -1, "fria_generation": true, "api_access": true, "integrations": true, "custom_templates": true}'),
('enterprise', 'Enterprise', 0.00, '{"use_cases": -1, "documents": -1, "users": -1, "fria_generation": true, "api_access": true, "integrations": true, "custom_templates": true, "sso": true, "sla": true}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    limits = EXCLUDED.limits;

-- ============================================
-- 4. TABLA: Subscriptions (Suscripciones de usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(255) NOT NULL DEFAULT 'starter',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_own ON subscriptions;
CREATE POLICY subscriptions_select_own ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 5. TABLA: Documents (Documentos generados)
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ai_policy', 'employee_notice', 'systems_register', 'fria', 'candidate_notice')),
    title VARCHAR(255) NOT NULL,
    content_json JSONB,
    pdf_url VARCHAR(255),
    docx_url VARCHAR(255),
    generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(organization_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. ASIGNAR PLAN PROFESSIONAL AL USUARIO
-- ============================================

-- Variables (cambia esto si es necesario)
-- TU UUID:
DO $$
DECLARE
    v_user_id UUID := '357a36c9-4154-49ee-90f7-5fb7453efcf7';
    v_org_id UUID;
    v_user_exists BOOLEAN;
BEGIN
    -- Verificar que el usuario existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user_id) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        RAISE EXCEPTION 'Usuario con ID % no encontrado en auth.users', v_user_id;
    END IF;
    
    -- Crear organización
    INSERT INTO public.organizations (
        id, name, plan_name, subscription_status, subscription_ends_at
    ) VALUES (
        v_user_id,  -- Usamos el mismo UUID que el usuario para simplificar
        'Mi Empresa',
        'professional',
        'active',
        NOW() + INTERVAL '100 years'
    )
    ON CONFLICT (id) DO UPDATE SET
        plan_name = 'professional',
        subscription_status = 'active',
        subscription_ends_at = NOW() + INTERVAL '100 years',
        updated_at = NOW()
    RETURNING id INTO v_org_id;
    
    -- Crear relación usuario-organización
    INSERT INTO public.organization_members (
        user_id, org_id, role, joined_at
    ) VALUES (
        v_user_id,
        v_org_id,
        'admin',
        NOW()
    )
    ON CONFLICT (user_id, org_id) DO NOTHING;
    
    -- Crear/actualizar suscripción
    INSERT INTO public.subscriptions (
        user_id, plan_type, status, current_period_end
    ) VALUES (
        v_user_id,
        'professional',
        'active',
        NOW() + INTERVAL '100 years'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = 'professional',
        status = 'active',
        current_period_end = NOW() + INTERVAL '100 years',
        updated_at = NOW();
        
    RAISE NOTICE '✅ Usuario % configurado con plan Professional', v_user_id;
END $$;

-- ============================================
-- 7. VERIFICAR RESULTADO
-- ============================================
SELECT 
    'Usuario' as tipo,
    u.id,
    u.email,
    COALESCE(s.plan_type, 'no subscription') as subscription_plan,
    COALESCE(o.plan_name, 'no org') as org_plan,
    o.subscription_status,
    o.subscription_ends_at
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
LEFT JOIN public.organization_members om ON om.user_id = u.id
LEFT JOIN public.organizations o ON o.id = om.org_id
WHERE u.id = '357a36c9-4154-49ee-90f7-5fb7453efcf7';

-- Resultado esperado:
-- subscription_plan = 'professional'
-- org_plan = 'professional'
-- subscription_status = 'active'
-- subscription_ends_at = fecha futura tipo 2126-03-15
