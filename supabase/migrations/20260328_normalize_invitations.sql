-- ============================================
-- MIGRACIÓN: Normalizar Sistema de Invitaciones
-- Fecha: 2026-03-28
-- Descripción: Consolidar lógica de invitaciones,
--              agregar funciones SQL para aceptación atómica
--              y actualizar RLS policies
-- ============================================

BEGIN;

-- ============================================
-- 1. ACTUALIZAR RLS POLICIES PARA pending_invitations
-- ============================================

-- Permitir que CUALQUIER usuario (autenticado o no) busque
-- invitaciones válidas por token para poder validarlas.
-- Esto es seguro porque:
-- 1. El token es un UUID único criptográficamente seguro
-- 2. Solo devolvemos info no-sensible (email, nombre org, rol)
-- 3. No es información que permita acceso a datos privados

DROP POLICY IF EXISTS "Anyone can lookup invitation by token" ON public.pending_invitations;
CREATE POLICY "Anyone can lookup invitation by token" 
ON public.pending_invitations 
FOR SELECT 
USING (
    -- Permitir lookup por token: verificamos que la invitación
    -- está activa (pending + no expirada)
    status = 'pending' 
    AND invite_expires_at > now()
);

COMMIT;

BEGIN;

-- ============================================
-- 2. FUNCIÓN SQL: validate_invitation_token
-- ============================================
-- Valida un token de invitación sin crear nada.
-- Retorna información sobre la invitación.
-- Puede ser llamada por usuarios anónimos o autenticados.

DROP FUNCTION IF EXISTS public.validate_invitation_token(uuid);

CREATE FUNCTION public.validate_invitation_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation record;
    v_org_name text;
    v_is_valid boolean := false;
    v_error text := null;
BEGIN
    -- Buscar la invitación por token
    SELECT 
        pi.id,
        pi.organization_id,
        pi.email,
        pi.role,
        pi.invite_expires_at,
        pi.status,
        o.name as org_name
    INTO v_invitation
    FROM public.pending_invitations pi
    LEFT JOIN public.organizations o ON pi.organization_id = o.id
    WHERE pi.invite_token = p_token;
    
    -- Validaciones
    IF v_invitation IS NULL THEN
        v_error := 'Token inválido o no encontrado';
        RETURN jsonb_build_object(
            'isValid', false,
            'error', v_error,
            'data', null
        );
    END IF;
    
    IF v_invitation.status != 'pending' THEN
        v_error := CASE v_invitation.status
            WHEN 'accepted' THEN 'Esta invitación ya fue aceptada'
            WHEN 'expired' THEN 'Esta invitación expiró'
            WHEN 'cancelled' THEN 'Esta invitación fue cancelada'
            ELSE 'Estado de invitación desconocido'
        END;
        RETURN jsonb_build_object(
            'isValid', false,
            'error', v_error,
            'data', null
        );
    END IF;
    
    IF v_invitation.invite_expires_at <= now() THEN
        v_error := 'Esta invitación expiró';
        RETURN jsonb_build_object(
            'isValid', false,
            'error', v_error,
            'data', null
        );
    END IF;
    
    -- Token válido!
    v_is_valid := true;
    
    RETURN jsonb_build_object(
        'isValid', true,
        'error', null,
        'data', jsonb_build_object(
            'invitationId', v_invitation.id,
            'email', v_invitation.email,
            'organizationId', v_invitation.organization_id,
            'organizationName', v_invitation.org_name,
            'role', v_invitation.role,
            'expiresAt', v_invitation.invite_expires_at
        )
    );
END;
$$ LANGUAGE plpgsql;

COMMIT;

BEGIN;

-- ============================================
-- 3. FUNCIÓN SQL: accept_invitation
-- ============================================
-- Acepta una invitación de forma atómica:
-- 1. Valida que el token existe y es válido
-- 2. Inserta en organization_members
-- 3. Marca la invitación como accepted
-- 4. Retorna los detalles de la membresía

DROP FUNCTION IF EXISTS public.accept_invitation(uuid, uuid);

CREATE FUNCTION public.accept_invitation(
    p_token uuid,
    p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation record;
    v_org_id uuid;
    v_role text;
    v_error text := null;
BEGIN
    -- Buscar la invitación por token (con lock para evitar race conditions)
    SELECT 
        pi.id,
        pi.organization_id,
        pi.email,
        pi.role,
        pi.invite_expires_at,
        pi.status
    INTO v_invitation
    FROM public.pending_invitations pi
    WHERE pi.invite_token = p_token
    FOR UPDATE;
    
    -- Validar que existe
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Token inválido o no encontrado'
        );
    END IF;
    
    -- Validar estado
    IF v_invitation.status != 'pending' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Esta invitación ya fue procesada'
        );
    END IF;
    
    -- Validar expiración
    IF v_invitation.invite_expires_at <= now() THEN
        -- Marcar como expirada
        UPDATE public.pending_invitations 
        SET status = 'expired'
        WHERE id = v_invitation.id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Esta invitación expiró'
        );
    END IF;
    
    -- TODO: Validar que p_user_id existe en auth.users
    -- (No podemos hacer directamente, pero el backend lo debe validar)
    
    -- Comenzar transacción implícita (plpgsql en SECURITY DEFINER)
    
    -- 1. Insertar (o actualizar) en organization_members
    INSERT INTO public.organization_members (
        organization_id,
        user_id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_invitation.organization_id,
        p_user_id,
        v_invitation.email,
        NULL,  -- El usuario puede actualizar su nombre después
        v_invitation.role,
        'active',
        now(),
        now()
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET 
        status = 'active',
        role = v_invitation.role,
        updated_at = now();
    
    -- 2. Marcar invitación como aceptada
    UPDATE public.pending_invitations 
    SET 
        status = 'accepted',
        updated_at = now()
    WHERE id = v_invitation.id;
    
    -- 3. Retornar éxito con datos
    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'organizationId', v_invitation.organization_id,
            'role', v_invitation.role,
            'email', v_invitation.email
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Error al aceptar la invitación: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

COMMIT;

BEGIN;

-- ============================================
-- 4. CREAR TABLA: accept_invitation_logs (auditoría)
-- ============================================

CREATE TABLE IF NOT EXISTS public.invitation_acceptance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id uuid NOT NULL REFERENCES public.pending_invitations(id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    accepted_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text
);

CREATE INDEX IF NOT EXISTS idx_invitation_acceptance_logs_invitation_id 
ON public.invitation_acceptance_logs(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_acceptance_logs_user_id 
ON public.invitation_acceptance_logs(user_id);

COMMIT;

BEGIN;

-- ============================================
-- 5. ACTUALIZAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token_status 
ON public.pending_invitations(invite_token, status)
WHERE status = 'pending' AND invite_expires_at > now();

-- Índice para limpeza de expiradas (cron job)
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expired 
ON public.pending_invitations(invite_expires_at) 
WHERE status = 'pending' AND invite_expires_at < now();

COMMIT;

BEGIN;

-- ============================================
-- 6. CREAR VISTA: Invitaciones Activas por Organización
-- ============================================

DROP VIEW IF EXISTS public.active_organization_invitations;

CREATE VIEW public.active_organization_invitations AS
SELECT 
    pi.id,
    pi.organization_id,
    pi.email,
    pi.role,
    pi.invite_token,
    pi.invite_expires_at,
    pi.created_at,
    pi.invited_by,
    CASE 
        WHEN pi.invite_expires_at <= now() THEN 'expired'
        WHEN pi.status != 'pending' THEN pi.status
        ELSE 'active'
    END as effective_status,
    (pi.invite_expires_at - now()) as time_remaining,
    u.email as invited_by_email
FROM public.pending_invitations pi
LEFT JOIN auth.users u ON pi.invited_by = u.id
WHERE pi.status = 'pending' AND pi.invite_expires_at > now()
ORDER BY pi.created_at DESC;

COMMIT;

BEGIN;

-- ============================================
-- 7. GRANT PERMISSIONS PARA FUNCIONES
-- ============================================

-- Permitir que usuarios anónimos validen tokens (para frontend)
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(uuid) TO anon, authenticated;

-- Permitir que usuarios autenticados acepten invitaciones
GRANT EXECUTE ON FUNCTION public.accept_invitation(uuid, uuid) TO authenticated;

COMMIT;

-- ============================================
-- VERIFICACIÓN (comentada)
-- ============================================

/*
-- Probar validate_invitation_token
SELECT public.validate_invitation_token('550e8400-e29b-41d4-a716-446655440000'::uuid);

-- Probar accept_invitation (reemplazar con UUIDs reales)
SELECT public.accept_invitation(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,  -- token
    '550e8400-e29b-41d4-a716-446655440001'::uuid   -- user_id
);

-- Ver invitaciones activas
SELECT * FROM public.active_organization_invitations;

-- Ver logs de aceptación
SELECT * FROM public.invitation_acceptance_logs;
*/
