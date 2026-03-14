-- Migration: Update pricing plans to new 4-tier structure
-- Created: 2026-03-14

-- Clear existing plans and insert new structure
TRUNCATE TABLE public.plans CASCADE;

-- Insert new plan structure
INSERT INTO public.plans (name, display_name, stripe_price_id, price_monthly, limits) VALUES
-- FREE: Trial/Test tier
('free', 
 'Free', 
 NULL, 
 0.00, 
 '{
   "use_cases": 1,
   "documents": 0,
   "users": 1,
   "ai_check_exports": 0,
   "fria_generation": false,
   "api_access": false,
   "integrations": false,
   "custom_templates": false,
   "multi_department": false,
   "priority_support": false
 }'::jsonb
),

-- PRO: Small businesses (€99/month)
('pro', 
 'PRO', 
 'price_pro_monthly', 
 99.00, 
 '{
   "use_cases": 5,
   "documents": 10,
   "users": 3,
   "ai_check_exports": -1,
   "fria_generation": true,
   "api_access": false,
   "integrations": false,
   "custom_templates": false,
   "multi_department": false,
   "priority_support": false
 }'::jsonb
),

-- BUSINESS: Growing companies (€239/month)
('business', 
 'Business', 
 'price_business_monthly', 
 239.00, 
 '{
   "use_cases": 15,
   "documents": -1,
   "users": 10,
   "ai_check_exports": -1,
   "fria_generation": true,
   "api_access": true,
   "integrations": true,
   "custom_templates": true,
   "multi_department": true,
   "priority_support": true
 }'::jsonb
),

-- ENTERPRISE: Large organizations (Custom pricing)
('enterprise', 
 'Enterprise', 
 NULL, 
 0.00, 
 '{
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
   "sso": true,
   "sla": true,
   "dedicated_manager": true
 }'::jsonb
);

-- Update existing subscriptions to map old plans to new structure
-- 'starter' -> 'free'
-- 'professional' -> 'pro'  
-- 'business' (old €299) -> 'business' (new €239)
-- 'agency' -> 'enterprise' (temporary mapping)

UPDATE public.subscriptions 
SET plan_type = CASE 
    WHEN plan_type = 'starter' THEN 'free'
    WHEN plan_type = 'professional' THEN 'pro'
    WHEN plan_type = 'agency' THEN 'business'
    ELSE plan_type
END
WHERE plan_type IN ('starter', 'professional', 'agency');

-- Also update organizations.plan_name to match
UPDATE public.organizations 
SET plan_name = CASE 
    WHEN plan_name = 'starter' THEN 'free'
    WHEN plan_name = 'professional' THEN 'pro'
    WHEN plan_name = 'agency' THEN 'business'
    ELSE plan_name
END
WHERE plan_name IN ('starter', 'professional', 'agency');

-- Create function to check if user can perform action based on plan
CREATE OR REPLACE FUNCTION public.check_plan_limit(
    p_user_id UUID,
    p_limit_name TEXT,
    p_current_count INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
    v_limit INTEGER;
    v_plan_name TEXT;
BEGIN
    -- Get user's plan
    SELECT COALESCE(s.plan_type, o.plan_name, 'free')
    INTO v_plan_name
    FROM auth.users u
    LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN public.organizations o ON o.id = (
        SELECT org_id FROM public.organization_members 
        WHERE user_id = u.id LIMIT 1
    )
    WHERE u.id = p_user_id;
    
    -- Get limit for this plan
    SELECT (limits->>p_limit_name)::INTEGER
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

-- Create function to get user's plan features
CREATE OR REPLACE FUNCTION public.get_user_plan_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_features JSONB;
    v_plan_name TEXT;
BEGIN
    -- Get user's plan
    SELECT COALESCE(s.plan_type, o.plan_name, 'free')
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

COMMENT ON TABLE public.plans IS 'Pricing plans: free (€0), pro (€99), business (€239), enterprise (custom)';
