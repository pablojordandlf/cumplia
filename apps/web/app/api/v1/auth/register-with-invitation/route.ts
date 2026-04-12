/**
 * POST /api/v1/auth/register-with-invitation
 * 
 * Registra un nuevo usuario a partir de una invitación válida.
 * Operación atómica: crea usuario + acepta invitación.
 * 
 * Body:
 * {
 *   email: string,
 *   password: string (mín 8 caracteres),
 *   invitation_token: string (uuid)
 * }
 * 
 * Retorna:
 * {
 *   success: boolean,
 *   error?: string,
 *   data?: {
 *     userId: uuid,
 *     email: string,
 *     organizationId: uuid,
 *     role: string,
 *     session: {
 *       access_token: string,
 *       refresh_token: string,
 *       expires_in: number
 *     }
 *   }
 * }
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, withRateLimitHeaders } from '@/lib/rate-limit';

interface RegisterWithInvitationRequest {
  email: string;
  password: string;
  invitation_token: string;
}

interface RegisterWithInvitationResponse {
  success: boolean;
  error?: string;
  data?: {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<RegisterWithInvitationResponse>> {
  // Rate limit: 10 registration attempts per minute per IP
  const ip = getClientIP(request);
  const { allowed, remaining, resetAt } = checkRateLimit(`register:${ip}`, 10, 60_000);
  if (!allowed) {
    const resp = NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
    return withRateLimitHeaders(resp, remaining, resetAt);
  }

  try {
    // Parsear body
    const body: RegisterWithInvitationRequest = await request.json();
    const { email, password, invitation_token } = body;

    // Validaciones básicas
    if (!email || !password || !invitation_token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password e invitation_token requeridos',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres',
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido',
        },
        { status: 400 }
      );
    }

    // Validar que el token es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invitation_token)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token de invitación inválido',
        },
        { status: 400 }
      );
    }

    // Paso 1: Validar que la invitación es válida
    const serverSupabase = await createClient();
    const validationResult = await serverSupabase.rpc('validate_invitation_token', {
      p_token: invitation_token,
    });

    if (!validationResult.data?.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.data?.error || 'Invitación inválida',
        },
        { status: 400 }
      );
    }

    // Validar que el email de la invitación coincide
    const invitationData = validationResult.data.data;
    if (invitationData.email !== email) {
      return NextResponse.json(
        {
          success: false,
          error: 'El email debe coincidir con el de la invitación',
        },
        { status: 400 }
      );
    }

    // Paso 2: Crear el usuario con el cliente admin
    // Usamos autoConfirm: true para que el usuario esté activo inmediatamente
    const adminSupabase = createAdminClient();
    const { data: createUserData, error: createUserError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: {
          registered_via_invitation: true,
          invitation_token,
        },
      });

    if (createUserError || !createUserData.user) {
      console.error('[register-with-invitation] Error creating user:', createUserError);

      // Si el error es 422, el usuario ya existe
      if (createUserError?.status === 422) {
        return NextResponse.json(
          {
            success: false,
            error: 'Este email ya está registrado',
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Error al crear la cuenta',
        },
        { status: 500 }
      );
    }

    const newUserId = createUserData.user.id;

    // Paso 3: Aceptar la invitación de forma atómica
    const { data: acceptResult, error: acceptError } = await serverSupabase.rpc(
      'accept_invitation',
      {
        p_token: invitation_token,
        p_user_id: newUserId,
      }
    );

    if (acceptError || !acceptResult?.success) {
      console.error('[register-with-invitation] Error accepting invitation:', acceptError);
      // La invitación falló, pero el usuario está creado
      // Idealmente aquí haríamos rollback, pero Supabase Auth no lo permite
      // Por eso es importante que accept_invitation sea muy segura
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario creado pero no se pudo aceptar la invitación. Contacta soporte.',
        },
        { status: 500 }
      );
    }

    // Paso 4: Crear sesión manualmente (login del usuario recién creado)
    // Necesitamos un token válido para que el usuario esté autenticado
    // Usamos la API de sesión del cliente regular (no admin)
    const { data: sessionData, error: sessionError } = await serverSupabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (sessionError || !sessionData.session) {
      console.error('[register-with-invitation] Error creating session:', sessionError);
      // Usuario y invitación OK, pero no se pudo crear sesión
      // El usuario podrá hacer login manualmente
      return NextResponse.json(
        {
          success: true,
          data: {
            userId: newUserId,
            email,
            organizationId: acceptResult.data.organizationId,
            role: acceptResult.data.role,
            session: {
              access_token: '',
              refresh_token: '',
              expires_in: 0,
            },
          },
        },
        { status: 200 }
      );
    }

    // ✅ TODO ÉXITO
    return NextResponse.json(
      {
        success: true,
        data: {
          userId: newUserId,
          email,
          organizationId: acceptResult.data.organizationId,
          role: acceptResult.data.role,
          session: {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token || '',
            expires_in: sessionData.session.expires_in || 3600,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[register-with-invitation] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
