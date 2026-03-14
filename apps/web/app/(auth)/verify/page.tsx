'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
       <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Revisa tu email</CardTitle>
          <CardDescription className="text-center">
            Hemos enviado un enlace mágico a tu correo. Haz clic en él para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500">
            Si no lo encuentras, revisa tu carpeta de spam.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}