/**
 * POST /api/invitations/accept
 * 
 * Acepta una invitación para el usuario actualmente autenticado.
 * Requiere sesión válida.
 * 
 * Body:
 * {
 *   token: string (uuid de la invitación)
 * }
 * 
 * Retorna:
 * {
 *   success: boolean,
 *   error?: string,
 *   data?: {
 *     organizationId: uuid,
 *     role: string,
 *     email: string
 *   }
 * }
 */

import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface AcceptInvitationRequest {
  token: string;
}

interface AcceptInvitationResponse {
  success: boolean;
  error?: string;
  data?: {
    organizationId: string;
    role: string;
    email: string;
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AcceptInvitationResponse>> {
  try {
    // Obtener sesión
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado',
        },
        { status: 401 }
      );
    }

    // Parsear body
    const body: AcceptInvitationRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token requerido',
        },
        { status: 400 }
      );
    }

    // Validar que el token es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido',
        },
        { status: 400 }
      );
    }

    // Llamar la función SQL accept_invitation
    const { data, error } = await supabase.rpc('accept_invitation', {
      p_token: token,
      p_user_id: user.id,
    });

    if (error) {
      console.error('[accept-invitation] RPC error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al aceptar la invitación',
        },
        { status: 500 }
      );
    }

    // data es un objeto JSONB con { success, error, data }
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Respuesta vacía del servidor',
        },
        { status: 500 }
      );
    }

    // Log de aceptación (optional, para auditoría)
    try {
      await supabase
        .from('invitation_acceptance_logs')
        .insert({
          invitation_id: token, // Nota: Esto es aproximado, idealmente querríamos el ID real
          user_id: user.id,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || undefined,
        });
    } catch (logError) {
      console.warn('[accept-invitation] Error logging acceptance:', logError);
      // No fallar por esto
    }

    // Retornar la respuesta
    return NextResponse.json(data as AcceptInvitationResponse, {
      status: data.success ? 200 : 400,
    });
  } catch (error) {
    console.error('[accept-invitation] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
