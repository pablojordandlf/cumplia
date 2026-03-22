-- ============================================
-- MIGRACIÓN: Correcciones Base de Datos CumplIA
-- Fecha: 2026-03-22
-- Descripción: Colección de fixes para esquema multi-tenant y organizaciones
-- ============================================

-- === MIGRACIÓN 001: Crear tipo ENUM member_status si no existe ===
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
        CREATE TYPE public.member_status AS ENUM ('active', 'invited', 'suspended', 'removed');
    END IF;
END
$$;

COMMIT;

-- === MIGRACIÓN 002: Eliminar FK duplicada en organization_members ===
BEGIN;

-- Elimina la constraint duplicada si existe
ALTER TABLE public.organization_members 
DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;

COMMIT;

-- === MIGRACIÓN 003: Refactorizar PK de organization_members ===
BEGIN;

-- a) Elimina la PK compuesta actual si existe (la nueva será id)
ALTER TABLE public.organization_members 
DROP CONSTRAINT IF EXISTS organization_members_pkey;

-- b) Asegura que id tenga DEFAULT gen_random_uuid()
ALTER TABLE public.organization_members 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- c) Convierte 'id' en la nueva PRIMARY KEY
ALTER TABLE public.organization_members 
ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id);

-- d) Añade UNIQUE(user_id, organization_id)
ALTER TABLE public.organization_members 
ADD CONSTRAINT organization_members_user_org_unique UNIQUE (user_id, organization_id);

COMMIT;

-- === MIGRACIÓN 004: Tabla pending_invitations ===
BEGIN;

-- Crear tabla pending_invitations
CREATE TABLE IF NOT EXISTS public.pending_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_by uuid NOT NULL REFERENCES auth.users(id),
    email character varying NOT NULL,
    name character varying,
    role character varying DEFAULT 'admin',
    invite_token character varying NOT NULL UNIQUE,
    invite_expires_at timestamp with time zone NOT NULL,
    status character varying DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(organization_id, email)
);

-- Índices para pending_invitations
CREATE INDEX IF NOT EXISTS idx_pending_invitations_org_id 
ON public.pending_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token 
ON public.pending_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email 
ON public.pending_invitations(email);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_pending_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pending_invitations_updated_at ON public.pending_invitations;
CREATE TRIGGER update_pending_invitations_updated_at 
BEFORE UPDATE ON public.pending_invitations 
FOR EACH ROW EXECUTE FUNCTION update_pending_invitations_updated_at();

COMMIT;

-- Migrar datos existentes de organization_members a pending_invitations
BEGIN;

INSERT INTO public.pending_invitations (
    organization_id, invited_by, email, name, role, 
    invite_token, invite_expires_at, status, created_at
)
SELECT 
    organization_id, invited_by, email, name, 
    COALESCE(role, 'admin'), 
    invite_token, invite_expires_at, 
    CASE 
        WHEN status = 'invited' THEN 'pending'
        WHEN status = 'active' THEN 'accepted'
        ELSE 'pending'
    END,
    created_at
FROM public.organization_members
WHERE invite_token IS NOT NULL 
AND (status = 'invited' OR status = 'pending');

COMMIT;

-- Eliminar columnas migradas de organization_members
BEGIN;

ALTER TABLE public.organization_members 
DROP COLUMN IF EXISTS invite_token,
DROP COLUMN IF EXISTS invite_expires_at,
DROP COLUMN IF EXISTS invited_by;

COMMIT;

-- RLS Policies para pending_invitations
BEGIN;

-- Habilitar RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- SELECT: Admins pueden ver invitaciones de su organización
CREATE POLICY "Admins can view pending invitations" 
ON public.pending_invitations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

-- INSERT: Solo admins pueden crear invitaciones
CREATE POLICY "Admins can create pending invitations" 
ON public.pending_invitations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

-- UPDATE: Solo admins pueden actualizar (cancelar) invitaciones
CREATE POLICY "Admins can update pending invitations" 
ON public.pending_invitations FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

-- DELETE: Solo admins pueden eliminar invitaciones
CREATE POLICY "Admins can delete pending invitations" 
ON public.pending_invitations FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

COMMIT;

-- === MIGRACIÓN 005: Unificar modelo de suscripción a nivel de organización ===
-- ⚠️ ATENCIÓN: Esta migración elimina la tabla subscriptions. Revisar antes de ejecutar.

BEGIN;

-- Migrar datos de subscriptions a organizations antes de eliminar
UPDATE public.organizations o
SET 
    subscription_status = s.status,
    subscription_ends_at = s.current_period_end
FROM public.subscriptions s
JOIN public.organization_members om ON om.user_id = s.user_id
WHERE om.organization_id = o.id 
AND om.role IN ('owner', 'admin')
AND s.status = 'active';

COMMIT;

BEGIN;

-- Eliminar tabla subscriptions
DROP TABLE IF EXISTS public.subscriptions;

COMMIT;

-- Añadir stripe_customer_id a organizations
BEGIN;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id character varying;

COMMIT;

-- === MIGRACIÓN 006: FK de organizations.plan_name → plans.name ===
BEGIN;

-- Asegurar que todos los valores existen en plans
UPDATE public.organizations 
SET plan_name = 'starter' 
WHERE plan_name NOT IN (SELECT name FROM public.plans)
OR plan_name IS NULL;

COMMIT;

BEGIN;

-- Añadir FK con NOT VALID para evitar lock prolongado
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_plan_name_fkey 
FOREIGN KEY (plan_name) REFERENCES public.plans(name) NOT VALID;

COMMIT;

-- Validar constraint en transacción separada
BEGIN;

ALTER TABLE public.organizations 
VALIDATE CONSTRAINT organizations_plan_name_fkey;

COMMIT;

-- === MIGRACIÓN 007: Añadir organization_id a use_case_obligations ===
BEGIN;

-- a) Añadir columna nullable inicialmente
ALTER TABLE public.use_case_obligations 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) NOT VALID;

COMMIT;

BEGIN;

-- b) Rellenar la columna desde use_cases
UPDATE public.use_case_obligations uob 
SET organization_id = uc.organization_id 
FROM public.use_cases uc 
WHERE uob.use_case_id = uc.id;

COMMIT;

BEGIN;

-- c) Aplicar NOT NULL después de rellenar
ALTER TABLE public.use_case_obligations 
ALTER COLUMN organization_id SET NOT NULL;

COMMIT;

BEGIN;

-- d) Validar constraint
ALTER TABLE public.use_case_obligations 
VALIDATE CONSTRAINT use_case_obligations_organization_id_fkey;

COMMIT;

BEGIN;

-- e) Añadir índice
CREATE INDEX IF NOT EXISTS idx_use_case_obligations_org_id 
ON public.use_case_obligations(organization_id);

COMMIT;

-- RLS policies actualizadas para use_case_obligations
BEGIN;

DROP POLICY IF EXISTS "Users can view obligations of their org" ON public.use_case_obligations;
DROP POLICY IF EXISTS "Users can create obligations in their org" ON public.use_case_obligations;
DROP POLICY IF EXISTS "Users can update obligations in their org" ON public.use_case_obligations;
DROP POLICY IF EXISTS "Users can delete obligations in their org" ON public.use_case_obligations;

-- SELECT
CREATE POLICY "Users can view obligations of their org" 
ON public.use_case_obligations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = use_case_obligations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.status = 'active'
    )
);

-- INSERT
CREATE POLICY "Users can create obligations in their org" 
ON public.use_case_obligations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = use_case_obligations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
);

-- UPDATE
CREATE POLICY "Users can update obligations in their org" 
ON public.use_case_obligations FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = use_case_obligations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = use_case_obligations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
);

-- DELETE
CREATE POLICY "Users can delete obligations in their org" 
ON public.use_case_obligations FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = use_case_obligations.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

COMMIT;

-- === MIGRACIÓN 008: Añadir organization_id a obligation_evidences ===
BEGIN;

-- a) Añadir columna nullable inicialmente
ALTER TABLE public.obligation_evidences 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) NOT VALID;

COMMIT;

BEGIN;

-- b) Rellenar la columna desde use_cases
UPDATE public.obligation_evidences oe 
SET organization_id = uc.organization_id 
FROM public.use_cases uc 
WHERE oe.use_case_id = uc.id;

COMMIT;

BEGIN;

-- c) Aplicar NOT NULL después de rellenar
ALTER TABLE public.obligation_evidences 
ALTER COLUMN organization_id SET NOT NULL;

COMMIT;

BEGIN;

-- d) Validar constraint
ALTER TABLE public.obligation_evidences 
VALIDATE CONSTRAINT obligation_evidences_organization_id_fkey;

COMMIT;

BEGIN;

-- e) Añadir índice
CREATE INDEX IF NOT EXISTS idx_obligation_evidences_org_id 
ON public.obligation_evidences(organization_id);

COMMIT;

-- RLS policies actualizadas para obligation_evidences
BEGIN;

DROP POLICY IF EXISTS "Users can view evidences of their org" ON public.obligation_evidences;
DROP POLICY IF EXISTS "Users can create evidences in their org" ON public.obligation_evidences;
DROP POLICY IF EXISTS "Users can update evidences in their org" ON public.obligation_evidences;
DROP POLICY IF EXISTS "Users can delete evidences in their org" ON public.obligation_evidences;

-- SELECT
CREATE POLICY "Users can view evidences of their org" 
ON public.obligation_evidences FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = obligation_evidences.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.status = 'active'
    )
);

-- INSERT
CREATE POLICY "Users can create evidences in their org" 
ON public.obligation_evidences FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = obligation_evidences.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
);

-- UPDATE
CREATE POLICY "Users can update evidences in their org" 
ON public.obligation_evidences FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = obligation_evidences.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = obligation_evidences.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
);

-- DELETE
CREATE POLICY "Users can delete evidences in their org" 
ON public.obligation_evidences FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = obligation_evidences.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

COMMIT;

-- === MIGRACIÓN 009: Unificar soft-delete en use_cases ===
BEGIN;

-- a) Sincronizar datos: marcar como eliminados si is_active = false
UPDATE public.use_cases 
SET deleted_at = now() 
WHERE is_active = false AND deleted_at IS NULL;

COMMIT;

-- Verificar si hay RLS policies o índices que referencien is_active
-- Esta query muestra dependencias antes de eliminar la columna
-- Ejecutar manualmente para confirmar:
/*
SELECT 
    schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'use_cases' 
AND indexdef LIKE '%is_active%';

SELECT 
    schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE tablename = 'use_cases' 
AND (qual::text LIKE '%is_active%' OR with_check::text LIKE '%is_active%');
*/

-- ⚠️ REVISAR ANTES DE EJECUTAR: Eliminar columna is_active
-- Descomentar solo después de verificar que no hay dependencias:
-- ALTER TABLE public.use_cases DROP COLUMN IF EXISTS is_active;

-- === MIGRACIÓN 010: Corregir DEFAULT de use_case_risks.applicable ===
BEGIN;

ALTER TABLE public.use_case_risks 
ALTER COLUMN applicable SET DEFAULT true;

COMMIT;

-- === MIGRACIÓN 011: Eliminar seats_used como contador manual ===
-- Opción A: Vista (recomendada para data integrity)
BEGIN;

CREATE OR REPLACE FUNCTION public.get_seats_used(org_id uuid) 
RETURNS integer 
LANGUAGE sql SECURITY DEFINER 
AS $$ 
SELECT COUNT(*)::integer 
FROM public.organization_members 
WHERE organization_id = org_id AND status = 'active';
$$;

COMMIT;

-- Opción B: Trigger (descomentar si se prefiere performance sobre integrity)
/*
BEGIN;

CREATE OR REPLACE FUNCTION update_organization_seats_used()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.organizations 
        SET seats_used = seats_used + 1 
        WHERE id = NEW.organization_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.organizations 
        SET seats_used = seats_used - 1 
        WHERE id = OLD.organization_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        IF NEW.status = 'active' AND OLD.status != 'active' THEN
            UPDATE public.organizations 
            SET seats_used = seats_used + 1 
            WHERE id = NEW.organization_id;
        ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
            UPDATE public.organizations 
            SET seats_used = seats_used - 1 
            WHERE id = NEW.organization_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_seats_trigger ON public.organization_members;
CREATE TRIGGER update_seats_trigger
AFTER INSERT OR DELETE OR UPDATE OF status ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION update_organization_seats_used();

COMMIT;
*/

-- Eliminar columna seats_used solo si se elige la opción con trigger
-- ALTER TABLE public.organizations DROP COLUMN IF EXISTS seats_used;

-- === MIGRACIÓN 012: UNIQUE constraint en use_case_obligations ===
BEGIN;

-- Eliminar duplicados primero (mantener el de menor id)
DELETE FROM public.use_case_obligations 
WHERE id NOT IN (
    SELECT MIN(id) FROM public.use_case_obligations 
    GROUP BY use_case_id, obligation_key
);

COMMIT;

BEGIN;

-- Añadir constraint UNIQUE
ALTER TABLE public.use_case_obligations 
ADD CONSTRAINT use_case_obligations_unique_key 
UNIQUE (use_case_id, obligation_key);

COMMIT;

-- === MIGRACIÓN 013: Versión actual en use_case_versions ===
BEGIN;

-- a) Añadir columna a use_cases
ALTER TABLE public.use_cases 
ADD COLUMN IF NOT EXISTS current_version_id uuid 
REFERENCES public.use_case_versions(id) ON DELETE SET NULL;

COMMIT;

BEGIN;

-- b) Rellenar con la versión de número más alto por caso de uso
UPDATE public.use_cases uc 
SET current_version_id = uv.id 
FROM public.use_case_versions uv 
WHERE uv.use_case_id = uc.id 
AND uv.version_number = (
    SELECT MAX(version_number) FROM public.use_case_versions 
    WHERE use_case_id = uc.id
);

COMMIT;

-- === MIGRACIÓN 014: Normalizar arrays de risk_templates ===
BEGIN;

-- a) Crear tabla de mapeo de niveles
CREATE TABLE IF NOT EXISTS public.risk_template_level_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES public.risk_templates(id) ON DELETE CASCADE,
    ai_act_level text NOT NULL CHECK (ai_act_level IN 
        ('high_risk','limited_risk','minimal_risk','prohibited')),
    UNIQUE(template_id, ai_act_level),
    created_at timestamp with time zone DEFAULT now()
);

COMMIT;

BEGIN;

-- b) Crear tabla de reglas de sistemas
CREATE TABLE IF NOT EXISTS public.risk_template_system_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES public.risk_templates(id) ON DELETE CASCADE,
    use_case_id uuid NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    rule_type text NOT NULL CHECK (rule_type IN ('excluded','included')),
    UNIQUE(template_id, use_case_id, rule_type),
    created_at timestamp with time zone DEFAULT now()
);

COMMIT;

BEGIN;

-- c) Migrar datos existentes desde los arrays
INSERT INTO public.risk_template_level_mappings (template_id, ai_act_level)
SELECT id, unnest(applies_to_levels) 
FROM public.risk_templates 
WHERE applies_to_levels IS NOT NULL 
AND array_length(applies_to_levels, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.risk_template_system_rules (template_id, use_case_id, rule_type)
SELECT id, unnest(excluded_systems), 'excluded' 
FROM public.risk_templates 
WHERE excluded_systems IS NOT NULL 
AND array_length(excluded_systems, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.risk_template_system_rules (template_id, use_case_id, rule_type)
SELECT id, unnest(included_systems), 'included' 
FROM public.risk_templates 
WHERE included_systems IS NOT NULL 
AND array_length(included_systems, 1) > 0
ON CONFLICT DO NOTHING;

COMMIT;

BEGIN;

-- d) Eliminar columnas array originales
ALTER TABLE public.risk_templates 
DROP COLUMN IF EXISTS applies_to_levels,
DROP COLUMN IF EXISTS excluded_systems,
DROP COLUMN IF EXISTS included_systems;

COMMIT;

BEGIN;

-- e) RLS policies para tablas nuevas
-- Habilitar RLS
ALTER TABLE public.risk_template_level_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_template_system_rules ENABLE ROW LEVEL SECURITY;

-- risk_template_level_mappings policies
CREATE POLICY "Users can view level mappings" 
ON public.risk_template_level_mappings FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.risk_templates rt
        LEFT JOIN public.organizations o ON rt.organization_id = o.id
        WHERE rt.id = risk_template_level_mappings.template_id
        AND (
            rt.is_system = true 
            OR EXISTS (
                SELECT 1 FROM public.organization_members om
                WHERE om.organization_id = o.id
                AND om.user_id = (SELECT auth.uid())
                AND om.status = 'active'
            )
        )
    )
);

-- risk_template_system_rules policies  
CREATE POLICY "Users can view system rules" 
ON public.risk_template_system_rules FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.risk_templates rt
        JOIN public.use_cases uc ON uc.id = risk_template_system_rules.use_case_id
        WHERE rt.id = risk_template_system_rules.template_id
        AND EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = uc.organization_id
            AND om.user_id = (SELECT auth.uid())
            AND om.status = 'active'
        )
    )
);

-- Solo admins pueden modificar
CREATE POLICY "Admins can manage level mappings" 
ON public.risk_template_level_mappings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.risk_templates rt
        JOIN public.organizations o ON rt.organization_id = o.id
        JOIN public.organization_members om ON om.organization_id = o.id
        WHERE rt.id = risk_template_level_mappings.template_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

CREATE POLICY "Admins can manage system rules" 
ON public.risk_template_system_rules FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.use_cases uc
        JOIN public.organization_members om ON om.organization_id = uc.organization_id
        WHERE uc.id = risk_template_system_rules.use_case_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

COMMIT;

-- === MIGRACIÓN 015: Constraint para coherencia is_system en risk_templates ===
BEGIN;

ALTER TABLE public.risk_templates 
ADD CONSTRAINT risk_templates_system_no_org 
CHECK (
    (is_system = true AND organization_id IS NULL) OR 
    (is_system = false)
);

COMMIT;

-- === MIGRACIÓN 016: FK de organizations.plan_name y custom_field_templates ===
BEGIN;

-- a) Añadir organization_id
ALTER TABLE public.custom_field_templates 
ADD COLUMN IF NOT EXISTS organization_id uuid 
REFERENCES public.organizations(id) ON DELETE CASCADE;

COMMIT;

BEGIN;

-- b) Rellenar organization_id desde organization_members
UPDATE public.custom_field_templates cft 
SET organization_id = om.organization_id 
FROM public.organization_members om 
WHERE om.user_id = cft.user_id 
AND om.role IN ('owner', 'admin');

COMMIT;

BEGIN;

-- c) Añadir índice
CREATE INDEX IF NOT EXISTS idx_custom_field_templates_org_id 
ON public.custom_field_templates(organization_id);

COMMIT;

-- RLS policies actualizadas para custom_field_templates
BEGIN;

DROP POLICY IF EXISTS "Users can view custom field templates" ON public.custom_field_templates;
DROP POLICY IF EXISTS "Users can create custom field templates" ON public.custom_field_templates;
DROP POLICY IF EXISTS "Users can update custom field templates" ON public.custom_field_templates;
DROP POLICY IF EXISTS "Users can delete custom field templates" ON public.custom_field_templates;

-- SELECT
CREATE POLICY "Users can view custom field templates" 
ON public.custom_field_templates FOR SELECT 
USING (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = custom_field_templates.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.status = 'active'
    )
);

-- INSERT
CREATE POLICY "Users can create custom field templates" 
ON public.custom_field_templates FOR INSERT 
WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = custom_field_templates.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
);

-- UPDATE
CREATE POLICY "Users can update custom field templates" 
ON public.custom_field_templates FOR UPDATE 
USING (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = custom_field_templates.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
)
WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = custom_field_templates.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin', 'editor')
        AND om.status = 'active'
    )
);

-- DELETE
CREATE POLICY "Users can delete custom field templates" 
ON public.custom_field_templates FOR DELETE 
USING (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = custom_field_templates.organization_id
        AND om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);

COMMIT;

-- === MIGRACIÓN 017: Índices en columnas FK de alto tráfico ===
BEGIN;

-- use_cases índices
CREATE INDEX IF NOT EXISTS idx_use_cases_org_id ON public.use_cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_use_cases_user_id ON public.use_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_use_cases_deleted_at ON public.use_cases(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- use_case_risks índices
CREATE INDEX IF NOT EXISTS idx_use_case_risks_use_case_id ON public.use_case_risks(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_risks_catalog_risk_id ON public.use_case_risks(catalog_risk_id);

-- use_case_obligations índices
CREATE INDEX IF NOT EXISTS idx_use_case_obligations_use_case_id ON public.use_case_obligations(use_case_id);

-- obligation_evidences índices  
CREATE INDEX IF NOT EXISTS idx_obligation_evidences_use_case_id ON public.obligation_evidences(use_case_id);
CREATE INDEX IF NOT EXISTS idx_obligation_evidences_obligation_id ON public.obligation_evidences(obligation_id);

-- organization_members índices
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);

-- risk_template_items índices
CREATE INDEX IF NOT EXISTS idx_risk_template_items_template_id ON public.risk_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_risk_template_items_catalog_risk_id ON public.risk_template_items(catalog_risk_id);

-- use_case_versions índices
CREATE INDEX IF NOT EXISTS idx_use_case_versions_use_case_id ON public.use_case_versions(use_case_id);

COMMIT;

-- ============================================
-- BLOQUE DE VERIFICACIÓN
-- Ejecutar estas queries para confirmar los cambios
-- ============================================

/*
-- Verificar tipo ENUM creado
SELECT typname, enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE typname = 'member_status';

-- Verificar PK refactoreada
SELECT column_name, constraint_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'organization_members';

-- Verificar tabla pending_invitations creada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pending_invitations';

-- Verificar subscriptions eliminada
SELECT * FROM information_schema.tables 
WHERE table_name = 'subscriptions';

-- Verificar FK organizations_plan_name_fkey
SELECT constraint_name, status 
FROM information_schema.table_constraints 
WHERE table_name = 'organizations' AND constraint_name = 'organizations_plan_name_fkey';

-- Verificar organization_id en use_case_obligations
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'use_case_obligations' AND column_name = 'organization_id';

-- Verificar organization_id en obligation_evidences
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'obligation_evidences' AND column_name = 'organization_id';

-- Verificar tablas de junction creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('risk_template_level_mappings', 'risk_template_system_rules');

-- Verificar índices creados
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('use_cases', 'use_case_risks', 'use_case_obligations', 
    'obligation_evidences', 'organization_members', 'risk_template_items', 'use_case_versions');

-- Verificar RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('pending_invitations', 'use_case_obligations', 'obligation_evidences', 
    'custom_field_templates', 'risk_template_level_mappings', 'risk_template_system_rules')
ORDER BY tablename, policyname;
*/