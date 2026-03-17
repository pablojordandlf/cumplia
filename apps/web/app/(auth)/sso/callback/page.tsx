'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSSO } from '@/hooks/use-sso';

export default function SSOCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleSSOCallback, isLoading, error } = useSSO();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [statusMessage, setStatusMessage] = useState('Procesando autenticación SSO...');

  useEffect(() => {
    const processCallback = async () => {
      // Check for error in query params
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (errorParam) {
        setStatus('error');
        setStatusMessage(errorDescription || 'Error en la autenticación SSO');
        return;
      }

      // Check for required params
      const hasSAMLResponse = searchParams.has('SAMLResponse');
      const hasCode = searchParams.has('code');
      const hasState = searchParams.has('state');

      if (!hasSAMLResponse && !hasCode) {
        setStatus('error');
        setStatusMessage('No se recibieron datos de autenticación válidos');
        return;
      }

      // Process the SSO callback
      const result = await handleSSOCallback(searchParams);

      if (result.success) {
        setStatus('success');
        setStatusMessage('Autenticación exitosa. Redirigiendo...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setStatus('error');
        setStatusMessage(result.error || 'Error en la autenticación SSO');
      }
    };

    processCallback();
  }, [searchParams, handleSSOCallback, router]);

  const handleRetry = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {status === 'processing' && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-6 w-6 text-destructive" />}
          </div>
          <CardTitle>
            {status === 'processing' && 'Iniciando sesión...'}
            {status === 'success' && '¡Bienvenido!'}
            {status === 'error' && 'Error de autenticación'}
          </CardTitle>
          <CardDescription>{statusMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'error' && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleRetry} className="w-full">
                Volver al inicio de sesión
              </Button>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center text-sm text-muted-foreground">
              Serás redirigido automáticamente...
            </div>
          )}
          
          {status === 'processing' && (
            <div className="text-center text-sm text-muted-foreground">
              Esto puede tomar unos segundos...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
