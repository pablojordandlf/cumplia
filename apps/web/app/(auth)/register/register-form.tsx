'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
    email: string;
    orgName: string;
    role: string;
  } | null>(null);
  const router = useRouter();

  // Check for invitation context on mount
  useEffect(() => {
    const token = searchParams.get('invitation_token');
    const emailParam = searchParams.get('email');
    
    if (token && emailParam) {
      // Get org name from sessionStorage (set by accept-invite page)
      const orgName = sessionStorage.getItem('invitation_org_name');
      const role = sessionStorage.getItem('invitation_role');

      setInvitationContext({
        token,
        email: emailParam,
        orgName: orgName || 'Organization',
        role: role || 'member'
      });

      // Pre-fill email
      setEmail(emailParam);
      console.log('🟡 Invitation context found:', { token: token.substring(0, 8) + '...', email: emailParam });
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

    console.log('🟡 Starting signup process...');
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
      console.log('🟢 Signup successful, user created');
      
      // If invitation exists, complete it after signup
      if (invitationContext) {
        console.log('🟡 Completing invitation acceptance...');
        try {
          // Get the newly created user
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log('🟡 New user ID:', user.id);
            
            // Complete invitation acceptance
            await completeInvitationAcceptance(user.id);
            
            console.log('🟢 Invitation completed, cleaning up sessionStorage');
            // Clean up sessionStorage
            sessionStorage.removeItem('invitation_token');
            sessionStorage.removeItem('invitation_email');
            sessionStorage.removeItem('invitation_org_id');
            sessionStorage.removeItem('invitation_org_name');
            sessionStorage.removeItem('invitation_role');
            
            setSuccess(true);
            setIsLoading(false);
            
            // Redirect to dashboard instead of onboarding
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
            return;
          }
        } catch (inviteErr) {
          console.error('🟠 Warning: Could not complete invitation, but signup succeeded:', inviteErr);
          // Still show success even if invitation completion fails
        }
      }
      
      setSuccess(true);
      setIsLoading(false);
    }
  };

  // Complete invitation acceptance after signup
  async function completeInvitationAcceptance(userId: string) {
    if (!invitationContext) return;

    try {
      const { token, orgName } = invitationContext;

      console.log('🟡 Step 1: Fetching invitation details...');
      
      // Fetch invitation to get org_id and role
      const { data: invitation, error: fetchError } = await supabase
        .from('pending_invitations')
        .select('id, organization_id, role')
        .eq('invite_token', token)
        .single();

      if (fetchError || !invitation) {
        throw new Error(`Invitation not found: ${fetchError?.message}`);
      }

      console.log('🟡 Step 2: Invitation fetched, org_id:', invitation.organization_id);

      // Add user to organization_members
      console.log('🟡 Step 3: Adding user to organization...');
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role || 'member',
          status: 'active'
        });

      if (memberError && !memberError.message.includes('duplicate')) {
        console.warn('🟠 Warning: Failed to add member:', memberError);
        // Continue anyway
      } else {
        console.log('🟢 Step 4: User added to organization');
      }

      // Update pending_invitations status to accepted
      console.log('🟡 Step 5: Marking invitation as accepted...');
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.warn('🟠 Warning: Failed to update invitation status:', updateError);
      } else {
        console.log('🟢 Step 6: Invitation marked as accepted');
      }

      console.log('🟢 ✅ Invitation acceptance completed successfully');
    } catch (err) {
      console.error('🔴 Error completing invitation:', err);
      throw err;
    }
  }

  // Login con Google OAuth
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const redirectTo = APP_URL 
      ? `${APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-sm sm:max-w-md bg-[#2a2a2a] border-[#7a8a92]/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-500">¡Registro Exitoso!</CardTitle>
          <CardDescription className="text-center text-[#7a8a92]">
            {invitationContext
              ? `Felicitaciones! Te has unido a ${invitationContext.orgName}. Redirigiendo al dashboard...`
              : 'Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz click en el enlace para activar tu cuenta.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!invitationContext && (
            <Button onClick={() => router.push('/login')} className="w-full bg-[#E09E50] hover:bg-[#E09E50]/80 text-[#0a0a0a]">
              Ir a Iniciar Sesión
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md bg-[#2a2a2a] border-[#7a8a92]/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-[#E8ECEB]">Crear Cuenta</CardTitle>
        <CardDescription className="text-center text-[#7a8a92]">
          {invitationContext 
            ? `Te unirás a ${invitationContext.orgName} como ${invitationContext.role}`
            : 'Regístrate para comenzar con CumplIA'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Invitation Banner */}
        {invitationContext && (
          <Alert className="bg-[#E09E50]/10 border-[#E09E50]/30">
            <AlertCircle className="h-4 w-4 text-[#E09E50]" />
            <AlertDescription className="text-[#E09E50] ml-2">
              ✓ Has sido invitado a unirte a <strong>{invitationContext.orgName}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Google OAuth */}
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-[#2a2a2a] border-[#7a8a92]/30 text-[#E8ECEB] hover:bg-[#3a3a3a]"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-[#7a8a92]/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#2a2a2a] px-2 text-[#7a8a92]">
              O con tu email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleRegister} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[#E8ECEB]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@empresa.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || !!invitationContext}
              className="bg-[#1a1a1a] border-[#7a8a92]/30 text-[#E8ECEB]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[#E8ECEB]">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-[#1a1a1a] border-[#7a8a92]/30 text-[#E8ECEB]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-[#E8ECEB]">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="bg-[#1a1a1a] border-[#7a8a92]/30 text-[#E8ECEB]"
            />
          </div>
          <Button type="submit" className="w-full bg-[#E09E50] hover:bg-[#E09E50]/80 text-[#0a0a0a] font-semibold" disabled={isLoading}>
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

        <div className="text-center text-sm text-[#7a8a92]">
          <span>¿Ya tienes cuenta? </span>
          <Link href="/login" className="text-[#E09E50] hover:underline">
            Inicia sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
