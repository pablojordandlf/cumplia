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
 *     email: string,
 *     organizationId: uuid,
 *     organizationName: string,
 *     role: string,
 *     expiresAt: timestamp
 *   }
 * }
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, withRateLimitHeaders } from '@/lib/rate-limit';

interface ValidationResponse {
  isValid: boolean;
  error?: string;
  data?: {
    invitationId: string;
    email: string;
    organizationId: string;
    organizationName: string;
    role: string;
    expiresAt: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ValidationResponse>> {
  try {
    // Rate limit: 30 validation attempts per minute per IP
    const ip = getClientIP(request);
    const { allowed, remaining, resetAt } = checkRateLimit(`validate:${ip}`, 30, 60_000);
    if (!allowed) {
      const resp = NextResponse.json(
        { isValid: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      return withRateLimitHeaders(resp, remaining, resetAt);
    }

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

    // Retornar la respuesta tal como viene de la BD
    return NextResponse.json(data as ValidationResponse, {
      status: data.isValid ? 200 : 400,
      headers: {
        'Cache-Control': 'no-store', // No cachear invitaciones
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
