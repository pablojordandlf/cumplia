'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Loader2 } from 'lucide-react';
import { SSODomainCheckResult } from '@/types/sso';

// URL base para redirecciones
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ssoResult, setSsoResult] = useState<SSODomainCheckResult | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' 
        ? 'Email o contraseña incorrectos'
        : signInError.message
      );
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

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
        {/* Google OAuth */}
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full"
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
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O con tu email
            </span>
          </div>
        </div>

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
