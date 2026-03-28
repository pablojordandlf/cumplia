/**
 * GET /accept-invite?token=xxx
 * 
 * Página server component que:
 * 1. Lee el token de la query string
 * 2. Valida el token llamando /api/v1/invitations/validate
 * 3. Si es válido → renderiza AcceptInviteClient con los datos
 * 4. Si es inválido → muestra error
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AcceptInviteClient from './accept-invite-client';

interface AcceptInvitePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

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
  data?: ValidationData;
}

async function validateToken(token: string): Promise<ValidationResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/invitations/validate?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        isValid: false,
        error: errorData.error || 'Error al validar la invitación',
      };
    }

    return response.json();
  } catch (error) {
    console.error('[accept-invite] Validation error:', error);
    return {
      isValid: false,
      error: 'No se pudo validar la invitación. Intenta de nuevo más tarde.',
    };
  }
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const params = await searchParams;
  const token = params.token;

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <CardTitle>Enlace Inválido</CardTitle>
            </div>
            <CardDescription>El enlace de invitación no es válido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Asegúrate de que copié el enlace completo del email. El enlace debe incluir el token
              de invitación.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validar el token
  const validation = await validateToken(token);

  // Si la validación falló, mostrar error
  if (!validation.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <CardTitle>Invitación No Válida</CardTitle>
            </div>
            <CardDescription>{validation.error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.error?.includes('expiró') && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  La invitación ha expirado. Contacta al administrador de la organización para
                  obtener una nueva.
                </p>
              </>
            )}
            {validation.error?.includes('ya') && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta invitación ya fue procesada. Si aún necesitas acceso, contacta al
                  administrador.
                </p>
              </>
            )}
            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Volver al inicio
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button className="w-full">Iniciar sesión</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Token válido, renderizar componente cliente
  const data = validation.data!;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Suspense fallback={<LoadingCard />}>
        <AcceptInviteClient
          token={token}
          invitationData={data}
        />
      </Suspense>
    </div>
  );
}

function LoadingCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Cargando...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}
