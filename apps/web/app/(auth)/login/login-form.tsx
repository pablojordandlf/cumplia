'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Loader2 } from 'lucide-react';
import { SSODomainCheckResult } from '@/types/sso';

// URL base para redirecciones
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ssoResult, setSsoResult] = useState<SSODomainCheckResult | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email?: string } | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    };
    checkSession();
  }, []);

  // Sign out and clear session
  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.refresh();
  };

  // Check for SSO provider by domain
  const checkDomainSSO = useCallback(async (emailValue: string) => {
    if (!emailValue || !emailValue.includes('@')) {
      setSsoResult(null);
      return;
    }

    const domain = emailValue.split('@')[1];
    if (!domain || domain.length < 3) {
      setSsoResult(null);
      return;
    }

    setIsCheckingDomain(true);
    try {
      const response = await fetch(`/api/v1/auth/check-domain?domain=${encodeURIComponent(domain)}`);
      if (response.ok) {
        const data = await response.json();
        setSsoResult(data);
      } else {
        setSsoResult(null);
      }
    } catch {
      setSsoResult(null);
    } finally {
      setIsCheckingDomain(false);
    }
  }, []);

  // Debounced domain check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email.includes('@')) {
        checkDomainSSO(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, checkDomainSSO]);

  // SSO Login
  const handleSSOLogin = async () => {
    if (!email || !ssoResult?.hasSSO) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/sso/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión con SSO');
        setIsLoading(false);
        return;
      }

      // Redirect to IdP
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la autenticación SSO');
      setIsLoading(false);
    }
  };

  // Login con email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('🟡 Login: Attempt sign in with email/password...');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('🔴 Login: Sign in error:', signInError);
      setError(signInError.message === 'Invalid login credentials' 
        ? 'Email o contraseña incorrectos'
        : signInError.message
      );
      setIsLoading(false);
    } else {
      console.log('🟢 Login: Sign in successful');
      // If there's a redirect URL from query params (e.g., from accept-invite), use it
      if (redirectUrl) {
        console.log(`🟡 Login: Redirecting to ${redirectUrl}`);
        router.push(decodeURIComponent(redirectUrl));
      } else {
        console.log('🟡 Login: Redirecting to /dashboard');
        router.push('/dashboard');
      }
      router.refresh();
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Introduce tus credenciales para acceder
        </CardDescription>
      </CardHeader>

      {/* Show message if already logged in */}
      {currentUser && (
        <div className="mx-6 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            Sesión activa como <strong>{currentUser.email}</strong>
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              Continuar al dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwitchAccount}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}
      <CardContent className="grid gap-4">
        {/* SSO Button (shown when domain has SSO configured) */}
        {ssoResult?.hasSSO && ssoResult.provider && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Button 
              variant="outline" 
              onClick={handleSSOLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              Continuar con {ssoResult.provider.name}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Tu empresa usa autenticación SSO
            </p>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {isCheckingDomain && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {/* Only show password field if no SSO detected */}
          {(!ssoResult?.hasSSO) && (
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Show login button only if no SSO or for non-SSO domains */}
          {(!ssoResult?.hasSSO) && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Iniciar Sesión'}
            </Button>
          )}
          
          {/* When SSO is detected, show alternative login option */}
          {ssoResult?.hasSSO && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setSsoResult(null)}
                className="text-sm text-muted-foreground underline hover:text-primary"
              >
                Usar email y contraseña en su lugar
              </button>
            </div>
          )}
        </form>

        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">¿No tienes cuenta? </span>
          <Link href="/register" className="underline hover:text-primary">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
