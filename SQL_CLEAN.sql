-- ============================================
-- SETUP: Funciones para Sistema de Invitaciones
-- ============================================
-- Copia SOLO ESTO a Supabase SQL Editor

-- FUNCIÓN 1: Validar token de invitación
DROP FUNCTION IF EXISTS validate_invitation_token(uuid);

CREATE OR REPLACE FUNCTION validate_invitation_token(p_token uuid)
RETURNS jsonb AS $$
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
    FROM pending_invitations pi
    LEFT JOIN organizations o ON pi.organization_id = o.id
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- FUNCIÓN 2: Aceptar invitación (atómico)
DROP FUNCTION IF EXISTS accept_invitation(uuid, uuid);

CREATE OR REPLACE FUNCTION accept_invitation(p_token uuid, p_user_id uuid)
RETURNS jsonb AS $$
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
    FROM pending_invitations pi
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
        UPDATE pending_invitations 
        SET status = 'expired'
        WHERE id = v_invitation.id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitación expiró'
        );
    END IF;
    
    -- Insertar en organization_members (crear o actualizar)
    INSERT INTO organization_members (
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
    UPDATE pending_invitations 
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
