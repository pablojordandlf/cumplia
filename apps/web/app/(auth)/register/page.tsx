'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

// URL base para redirecciones (usa env var o fallback a window.location)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Usar la URL configurada o fallback a window.location.origin
    const redirectTo = APP_URL 
      ? `${APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    const { error: supabaseError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (supabaseError) {
      setError(supabaseError.message);
      setIsLoading(false);
    } else {
      router.push('/verify');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Registrarse</CardTitle>
          <CardDescription className="text-center">
            Introduce tu correo electrónico para enviarte un enlace de registro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de registro'}
              </Button>
            </div>
          </form>
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
