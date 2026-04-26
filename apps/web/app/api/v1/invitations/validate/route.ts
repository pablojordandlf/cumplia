/**
 * GET /api/v1/invitations/validate?token=xxx
 *
 * Valida un token de invitación sin crear nada.
 * Puede ser llamado por usuarios anónimos o autenticados.
 *
 * Retorna:
 * {
 *   isValid: boolean,
 *   error?: string,
 *   data?: {
 *     invitationId: uuid,
 *     maskedEmail: string,   // e.g. "j***@example.com"
 *     organizationId: uuid,
 *     organizationName: string,
 *     role: string,
 *     expiresAt: timestamp
 *   }
 * }
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ValidationData {
  invitationId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  expiresAt: string;
}

interface ValidationResponse {
  isValid: boolean;
  error?: string;
  data?: Omit<ValidationData, 'email'> & { maskedEmail: string };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.length <= 2 ? '***' : `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`;
  return `${masked}@${domain}`;
}

export async function GET(request: NextRequest): Promise<NextResponse<ValidationResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validar que el token está presente
    if (!token) {
      return NextResponse.json(
        {
          isValid: false,
          error: 'Token requerido en query string',
        },
        { status: 400 }
      );
    }

    // Validar que el token es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json(
        {
          isValid: false,
          error: 'Token inválido',
        },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase
    const supabase = await createClient();

    // Llamar la función SQL validate_invitation_token
    const { data, error } = await supabase.rpc('validate_invitation_token', {
      p_token: token,
    });

    if (error) {
      console.error('[validate-invitation] RPC error:', error);
      return NextResponse.json(
        {
          isValid: false,
          error: 'Error al validar el token',
        },
        { status: 500 }
      );
    }

    // data ya es un objeto JSONB con { isValid, error, data }
    if (!data) {
      return NextResponse.json(
        {
          isValid: false,
          error: 'Respuesta vacía del servidor',
        },
        { status: 500 }
      );
    }

    // Mask the email before returning to unauthenticated callers
    const responseData: ValidationResponse = data.isValid && data.data
      ? {
          isValid: true,
          data: {
            invitationId: data.data.invitationId,
            maskedEmail: maskEmail(data.data.email),
            organizationId: data.data.organizationId,
            organizationName: data.data.organizationName,
            role: data.data.role,
            expiresAt: data.data.expiresAt,
          },
        }
      : { isValid: false, error: data.error };

    return NextResponse.json(responseData, {
      status: data.isValid ? 200 : 400,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[validate-invitation] Error:', error);
    return NextResponse.json(
      {
        isValid: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
