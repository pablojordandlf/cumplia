-- Table: plans
CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'free'|'pro'|'agency'
    display_name VARCHAR(100) NOT NULL,
    stripe_price_id VARCHAR(100),
    price_monthly DECIMAL(8,2),
    limits JSONB NOT NULL DEFAULT '{}'::jsonb, -- {use_cases: 3, documents: 0, managed_orgs: 1, ai_check_exports: 0}
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed data for plans
INSERT INTO public.plans (name, display_name, stripe_price_id, price_monthly, limits) VALUES
('free', 'Free', NULL, 0.00, '{"use_cases": 3, "documents": 0, "managed_orgs": 1, "ai_check_exports": 0}'),
('pro', 'Pro', 'price_pro_id_placeholder', 29.00, '{"use_cases": -1, "documents": -1, "managed_orgs": 1, "ai_check_exports": -1}'),
('agency', 'Agency', 'price_agency_id_placeholder', 99.00, '{"use_cases": -1, "documents": -1, "managed_orgs": -1, "ai_check_exports": -1}');

-- Modify table: organizations
ALTER TABLE public.organizations
ADD COLUMN plan_name VARCHAR(50) DEFAULT 'free',
ADD COLUMN stripe_customer_id VARCHAR(100),
ADD COLUMN stripe_subscription_id VARCHAR(100),
ADD COLUMN subscription_status VARCHAR(50),
ADD COLUMN subscription_ends_at TIMESTAMPTZ,
ADD COLUMN trial_ends_at TIMESTAMPTZ;

-- New table: agency_clients
CREATE TABLE public.agency_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_org_id uuid NOT NULL REFERENCES public.organizations(id),
    client_org_id uuid NOT NULL REFERENCES public.organizations(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_agency_client ON public.agency_clients (agency_org_id, client_org_id);


-- New table: documents
CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ai_policy', 'employee_notice', 'systems_register', 'fria', 'candidate_notice')),
    title VARCHAR(255) NOT NULL,
    content_json JSONB,
    pdf_url VARCHAR(255),
    docx_url VARCHAR(255),
    generated_at TIMESTAMPTZ DEFAULT NOW()
);
