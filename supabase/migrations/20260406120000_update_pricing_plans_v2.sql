-- Migration: Update pricing plans to new 4-tier structure (April 2026)
-- New plan names: Evalúa (starter/free), Cumple (professional), Protege (business), Lidera (enterprise)
-- Prices: 0€, 399€, 899€, 2499€+
-- AI Systems: 3, 15, 50, unlimited

-- Clear existing plans and insert new structure
TRUNCATE TABLE public.plans CASCADE;

-- Insert new plan structure
INSERT INTO public.plans (name, display_name, stripe_price_id, price_monthly, limits) VALUES

-- EVALÚA: Free tier - evaluate first AI systems
('starter',
 'Evalúa',
 NULL,
 0.00,
 '{
   "ai_systems": 3,
   "use_cases": 3,
   "documents": 0,
   "users": 1,
   "ai_check_exports": 0,
   "fria_generation": false,
   "api_access": false,
   "integrations": false,
   "custom_templates": false,
   "multi_department": false,
   "priority_support": false,
   "ai_assistant": false,
   "generative_ai": false
 }'::jsonb
),

-- CUMPLE: Compliance tier - full compliance for SMEs (€399/month)
('professional',
 'Cumple',
 'price_professional_monthly',
 399.00,
 '{
   "ai_systems": 15,
   "use_cases": 15,
   "documents": -1,
   "users": 3,
   "ai_check_exports": -1,
   "fria_generation": true,
   "api_access": false,
   "integrations": false,
   "custom_templates": false,
   "multi_department": false,
   "priority_support": true,
   "ai_assistant": true,
   "generative_ai": true
 }'::jsonb
),

-- PROTEGE: Protection tier - larger companies (€899/month)
('business',
 'Protege',
 'price_business_monthly',
 899.00,
 '{
   "ai_systems": 50,
   "use_cases": 50,
   "documents": -1,
   "users": 10,
   "ai_check_exports": -1,
   "fria_generation": true,
   "api_access": false,
   "integrations": false,
   "custom_templates": true,
   "multi_department": true,
   "priority_support": true,
   "ai_assistant": true,
   "generative_ai": true
 }'::jsonb
),

-- LIDERA: Leadership tier - large organizations (€2499+/month, custom)
('enterprise',
 'Lidera',
 NULL,
 2499.00,
 '{
   "ai_systems": -1,
   "use_cases": -1,
   "documents": -1,
   "users": -1,
   "ai_check_exports": -1,
   "fria_generation": true,
   "api_access": true,
   "integrations": true,
   "custom_templates": true,
   "multi_department": true,
   "priority_support": true,
   "ai_assistant": true,
   "generative_ai": true,
   "sso": true,
   "sla": true,
   "dedicated_manager": true
 }'::jsonb
);

-- Also keep legacy 'free' name pointing to starter limits
INSERT INTO public.plans (name, display_name, stripe_price_id, price_monthly, limits) VALUES
('free',
 'Evalúa',
 NULL,
 0.00,
 '{
   "ai_systems": 3,
   "use_cases": 3,
   "documents": 0,
   "users": 1,
   "ai_check_exports": 0,
   "fria_generation": false,
   "api_access": false,
   "integrations": false,
   "custom_templates": false,
   "multi_department": false,
   "priority_support": false,
   "ai_assistant": false,
   "generative_ai": false
 }'::jsonb
);

-- Migrate existing subscriptions: map old plan names to new canonical names
UPDATE public.subscriptions
SET plan_type = CASE
    WHEN plan_type = 'free' THEN 'starter'
    WHEN plan_type = 'pro' THEN 'professional'
    WHEN plan_type = 'agency' THEN 'enterprise'
    ELSE plan_type
END
WHERE plan_type IN ('free', 'pro', 'agency');

-- Migrate organizations: map old plan names to new canonical names
UPDATE public.organizations
SET plan_name = CASE
    WHEN plan_name = 'free' THEN 'starter'
    WHEN plan_name = 'pro' THEN 'professional'
    WHEN plan_name = 'agency' THEN 'enterprise'
    ELSE plan_name
END
WHERE plan_name IN ('free', 'pro', 'agency');

-- Update check_plan_limit function to support both 'ai_systems' and legacy 'use_cases' limit names
CREATE OR REPLACE FUNCTION public.check_plan_limit(
    p_user_id UUID,
    p_limit_name TEXT,
    p_current_count INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
    v_limit INTEGER;
    v_plan_name TEXT;
    v_limit_key TEXT;
BEGIN
    -- Get user's plan
    SELECT COALESCE(s.plan_type, o.plan_name, 'starter')
    INTO v_plan_name
    FROM auth.users u
    LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN public.organizations o ON o.id = (
        SELECT org_id FROM public.organization_members
        WHERE user_id = u.id LIMIT 1
    )
    WHERE u.id = p_user_id;

    -- Normalize limit key: 'use_cases' maps to 'ai_systems'
    v_limit_key := CASE p_limit_name
        WHEN 'use_cases' THEN 'ai_systems'
        ELSE p_limit_name
    END;

    -- Get limit for this plan (try ai_systems key first, then use_cases for backward compat)
    SELECT COALESCE(
        (limits->>v_limit_key)::INTEGER,
        (limits->>'use_cases')::INTEGER
    )
    INTO v_limit
    FROM public.plans
    WHERE name = v_plan_name;

    -- -1 means unlimited
    IF v_limit = -1 THEN
        RETURN TRUE;
    END IF;

    -- Check if under limit
    RETURN p_current_count < COALESCE(v_limit, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_user_plan_features to return generative_ai flag
CREATE OR REPLACE FUNCTION public.get_user_plan_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_features JSONB;
    v_plan_name TEXT;
BEGIN
    -- Get user's plan
    SELECT COALESCE(s.plan_type, o.plan_name, 'starter')
    INTO v_plan_name
    FROM auth.users u
    LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN public.organizations o ON o.id = (
        SELECT org_id FROM public.organization_members
        WHERE user_id = u.id LIMIT 1
    )
    WHERE u.id = p_user_id;

    -- Get features for this plan
    SELECT limits INTO v_features
    FROM public.plans
    WHERE name = v_plan_name;

    RETURN COALESCE(v_features, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.plans IS 'Pricing plans: Evalúa/starter (€0), Cumple/professional (€399), Protege/business (€899), Lidera/enterprise (€2499+)';
