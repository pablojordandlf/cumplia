-- ============================================
-- SQL PARA EJECUTAR EN SUPABASE DASHBOARD
-- ============================================
-- Copia TODO este contenido
-- Ve a: Supabase Dashboard → SQL Editor → Pega → Run

BEGIN;

-- 1. CREAR FUNCIÓN: validate_invitation_token
-- Valida un token de invitación sin crear nada
DROP FUNCTION IF EXISTS public.validate_invitation_token(uuid) CASCADE;

CREATE FUNCTION public.validate_invitation_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation record;
BEGIN
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
    
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object(
            'isValid', false,
            'error', 'Token inválido o no encontrado',
            'data', null
        );
    END IF;
    
    IF v_invitation.status != 'pending' THEN
        RETURN jsonb_build_object(
            'isValid', false,
            'error', CASE v_invitation.status
                WHEN 'accepted' THEN 'Esta invitación ya fue aceptada'
                WHEN 'expired' THEN 'Esta invitación expiró'
                WHEN 'cancelled' THEN 'Esta invitación fue cancelada'
                ELSE 'Estado desconocido'
            END,
            'data', null
        );
    END IF;
    
    IF v_invitation.invite_expires_at <= now() THEN
        RETURN jsonb_build_object(
            'isValid', false,
            'error', 'Esta invitación expiró',
            'data', null
        );
    END IF;
    
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

-- 2. CREAR FUNCIÓN: accept_invitation
-- Acepta una invitación de forma atómica
DROP FUNCTION IF EXISTS public.accept_invitation(uuid, uuid) CASCADE;

CREATE FUNCTION public.accept_invitation(
    p_token uuid,
    p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation record;
BEGIN
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
    
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Token inválido'
        );
    END IF;
    
    IF v_invitation.status != 'pending' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitación ya fue procesada'
        );
    END IF;
    
    IF v_invitation.invite_expires_at <= now() THEN
        UPDATE public.pending_invitations 
        SET status = 'expired'
        WHERE id = v_invitation.id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitación expiró'
        );
    END IF;
    
    -- Insertar en organization_members
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
        NULL,
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
    
    -- Marcar invitación como aceptada
    UPDATE public.pending_invitations 
    SET status = 'accepted', updated_at = now()
    WHERE id = v_invitation.id;
    
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
        'error', 'Error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 3. ACTUALIZAR RLS POLICY
DROP POLICY IF EXISTS "Anyone can lookup invitation by token" ON public.pending_invitations;

CREATE POLICY "Anyone can lookup invitation by token" 
ON public.pending_invitations 
FOR SELECT 
USING (
    status = 'pending' 
    AND invite_expires_at > now()
);

COMMIT;

-- ============================================
-- VERIFICACIÓN (opcional)
-- Ejecuta estas queries para confirmar que funciones existen:
-- ============================================

-- SELECT * FROM pg_proc WHERE proname IN ('validate_invitation_token', 'accept_invitation');
-- SELECT * FROM pending_invitations LIMIT 1;
