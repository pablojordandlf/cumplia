'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

// URL base para redirecciones
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationContext, setInvitationContext] = useState<{
    token: string;
    maskedEmail: string;
    orgName: string;
    role: string;
  } | null>(null);
  const router = useRouter();

  // Check for invitation context on mount
  useEffect(() => {
    const token = searchParams.get('invitation_token');

    if (token) {
      const maskedEmail = sessionStorage.getItem('invitation_masked_email') ?? '';
      const orgName = sessionStorage.getItem('invitation_org_name');
      const role = sessionStorage.getItem('invitation_role');

      setInvitationContext({
        token,
        maskedEmail,
        orgName: orgName || 'Organization',
        role: role || 'member',
      });
    }
  }, [searchParams]);

  // Registro con email/password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // === If invitation exists, use special endpoint ===
    if (invitationContext) {
      try {
        const response = await fetch('/api/v1/auth/register-with-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            invitation_token: invitationContext.token,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle specific errors
          if (response.status === 422) {
            setError('Este email ya está registrado');
          } else {
            setError(result.error || 'Error en el registro');
          }
          setIsLoading(false);
          return;
        }

        // Clean up sessionStorage
        sessionStorage.removeItem('invitation_token');
        sessionStorage.removeItem('invitation_masked_email');
        sessionStorage.removeItem('invitation_org_id');
        sessionStorage.removeItem('invitation_org_name');
        sessionStorage.removeItem('invitation_role');

        setSuccess(true);
        setIsLoading(false);

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        return;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error en el registro');
        setIsLoading(false);
        return;
      }
    }

    // === Regular signup (no invitation) ===
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: APP_URL 
          ? `${APP_URL}/auth/callback`
          : `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Este email ya está registrado'
        : signUpError.message
      );
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-sm sm:max-w-md bg-[#2a2a2a] border-[#8B9BB4]/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-500">¡Registro Exitoso!</CardTitle>
          <CardDescription className="text-center text-[#8B9BB4]">
            {invitationContext
              ? `Felicitaciones! Te has unido a ${invitationContext.orgName}. Redirigiendo al dashboard...`
              : 'Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz click en el enlace para activar tu cuenta.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!invitationContext && (
            <Button onClick={() => router.push('/login')} className="w-full bg-[#E8FF47] hover:bg-[#d4ec2e] text-[#0a0a0a]">
              Ir a Iniciar Sesión
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md bg-[#2a2a2a] border-[#8B9BB4]/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-[#E3DFD5]">Crear Cuenta</CardTitle>
        <CardDescription className="text-center text-[#8B9BB4]">
          {invitationContext 
            ? `Te unirás a ${invitationContext.orgName} como ${invitationContext.role}`
            : 'Regístrate para comenzar con CumplIA'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Invitation Banner */}
        {invitationContext && (
          <Alert className="bg-[#0B1C3D]/05 border-[#0B1C3D]/15">
            <AlertCircle className="h-4 w-4 text-[#0B1C3D]" />
            <AlertDescription className="text-[#0B1C3D] ml-2">
              ✓ Has sido invitado a unirte a <strong>{invitationContext.orgName}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleRegister} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[#E3DFD5]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={invitationContext?.maskedEmail || 'tu@empresa.com'}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-[#1a1a1a] border-[#8B9BB4]/30 text-[#E3DFD5]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[#E3DFD5]">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-[#1a1a1a] border-[#8B9BB4]/30 text-[#E3DFD5]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-[#E3DFD5]">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="bg-[#1a1a1a] border-[#8B9BB4]/30 text-[#E3DFD5]"
            />
          </div>
          <Button type="submit" className="w-full bg-[#E8FF47] hover:bg-[#d4ec2e] text-[#0a0a0a] font-semibold" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        {error && (
          <Alert className="bg-[#C92A2A]/10 border-[#C92A2A]/30">
            <AlertCircle className="h-4 w-4 text-[#C92A2A]" />
            <AlertDescription className="text-[#C92A2A] ml-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm text-[#8B9BB4]">
          <span>¿Ya tienes cuenta? </span>
          <Link href="/login" className="text-[#0B1C3D] hover:underline font-medium">
            Inicia sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
