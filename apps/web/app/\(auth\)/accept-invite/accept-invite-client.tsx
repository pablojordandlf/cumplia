'use client';

/**
 * Cliente component para aceptar invitación.
 * Maneja dos casos:
 * 1. Usuario sin sesión → Formulario de registro
 * 2. Usuario con sesión → Botón de aceptación
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ValidationData {
  invitationId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  expiresAt: string;
}

interface AcceptInviteClientProps {
  token: string;
  invitationData: ValidationData;
}

type PageState = 'check-session' | 'not-authenticated' | 'authenticated-match' | 'authenticated-mismatch' | 'accepting' | 'accepted' | 'error';

export default function AcceptInviteClient({ token, invitationData }: AcceptInviteClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<PageState>('check-session');
  const [sessionEmail, setSessionEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Verificar si hay sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Sin sesión → mostrar formulario de registro
          setState('not-authenticated');
          return;
        }

        // Con sesión → verificar si el email coincide
        setSessionEmail(user.email || '');
        if (user.email === invitationData.email) {
          setState('authenticated-match');
        } else {
          setState('authenticated-mismatch');
        }
      } catch (err) {
        console.error('[accept-invite] Error checking session:', err);
        setError('Error al verificar tu sesión');
        setState('error');
      }
    };

    checkSession();
  }, [invitationData.email, supabase.auth]);

  // Caso 1: Usuario NO autenticado → Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPasswordError('');

    try {
      if (password.length < 8) {
        setPasswordError('La contraseña debe tener al menos 8 caracteres');
        setIsLoading(false);
        return;
      }

      setState('accepting');

      const response = await fetch('/api/v1/auth/register-with-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitationData.email,
          password,
          invitation_token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Error al registrarse');
        setState('error');
        setIsLoading(false);
        return;
      }

      // ✅ Registro exitoso
      setState('accepted');
      setIsLoading(false);

      // Redirigir al dashboard
      setTimeout(() => {
        router.push(`/dashboard?organizationId=${data.data.organizationId}`);
      }, 2000);
    } catch (err) {
      console.error('[accept-invite] Register error:', err);
      setError('Error interno. Por favor intenta de nuevo.');
      setState('error');
      setIsLoading(false);
    }
  };

  // Caso 2: Usuario autenticado con email coincidente → Aceptar invitación
  const handleAcceptInvitation = async () => {
    setIsLoading(true);
    setError('');

    try {
      setState('accepting');

      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Error al aceptar la invitación');
        setState('authenticated-match');
        setIsLoading(false);
        return;
      }

      // ✅ Invitación aceptada
      setState('accepted');
      setIsLoading(false);

      // Redirigir al dashboard
      setTimeout(() => {
        router.push(`/dashboard?organizationId=${invitationData.organizationId}`);
      }, 2000);
    } catch (err) {
      console.error('[accept-invite] Accept error:', err);
      setError('Error interno. Por favor intenta de nuevo.');
      setState('authenticated-match');
      setIsLoading(false);
    }
  };

  // ==========================================
  // RENDERIZADO POR ESTADO
  // ==========================================

  if (state === 'check-session') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificando...</CardTitle>
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

  // ==========================================
  // CASO 1: SIN AUTENTICACIÓN → REGISTRO
  // ==========================================
  if (state === 'not-authenticated') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>¡Bienvenido a {invitationData.organizationName}!</CardTitle>
          <CardDescription>Completa tu registro para unirte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invitationData.email}
                disabled
                className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Este email no puede ser cambiado</p>
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label>Tu rol en {invitationData.organizationName}</Label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm capitalize">
                {invitationData.role}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                disabled={isLoading}
                required
              />
              {passwordError && (
                <p className="text-xs text-red-600 dark:text-red-400">{passwordError}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Botones */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Registrando...' : 'Crear cuenta'}
            </Button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // CASO 2: AUTENTICADO CON EMAIL COINCIDENTE
  // ==========================================
  if (state === 'authenticated-match') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>¡Bienvenido a {invitationData.organizationName}!</CardTitle>
          <CardDescription>Completa tu incorporación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-600 dark:text-blue-400">
            ✓ Sesión iniciada como <strong>{sessionEmail}</strong>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-600 dark:text-slate-400">Tu rol</Label>
            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm capitalize font-medium">
              {invitationData.role}
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleAcceptInvitation}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Aceptando...' : 'Unirme a la organización'}
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // CASO 3: AUTENTICADO PERO EMAIL NO COINCIDE
  // ==========================================
  if (state === 'authenticated-mismatch') {
    return (
      <Card className="w-full max-w-md border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <CardTitle>Email No Coincide</CardTitle>
          </div>
          <CardDescription>
            La invitación es para <strong>{invitationData.email}</strong>, pero tu sesión activa
            es <strong>{sessionEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Elige una opción:
          </p>

          <Button variant="default" className="w-full" asChild>
            <Link href={`/accept-invite?token=${token}`}>Cerrar sesión e intentar de nuevo</Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Ir a mi dashboard</Link>
          </Button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:support@cumplia.com" className="text-blue-600 hover:underline">
              Contacta soporte
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // CASO 4: ACEPTANDO (EN PROGRESO)
  // ==========================================
  if (state === 'accepting') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Por favor espera mientras completamos tu incorporación...
          </p>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // CASO 5: ÉXITO
  // ==========================================
  if (state === 'accepted') {
    return (
      <Card className="w-full max-w-md border-green-500/20 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <CardTitle>¡Bienvenido!</CardTitle>
          </div>
          <CardDescription>Tu cuenta ha sido configurada correctamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Redirigiendo al dashboard en unos segundos...
          </p>

          <Button className="w-full" asChild>
            <Link href={`/dashboard?organizationId=${invitationData.organizationId}`}>
              <LogIn className="w-4 h-4 mr-2" />
              Ir al dashboard ahora
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // CASO 6: ERROR
  // ==========================================
  if (state === 'error') {
    return (
      <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <CardTitle>Error</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:support@cumplia.com" className="text-blue-600 hover:underline">
              Contacta soporte
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
