'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SSOSettingsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/settings')}
          className="mb-4 -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Configuración
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Configuración SSO
        </h1>
        <p className="text-muted-foreground mt-2">
          Inicio de Sesión Único (Single Sign-On) para tu organización.
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Próximamente Disponible</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              La configuración de SSO/SAML está en desarrollo. Pronto podrás 
              integrar tu proveedor de identidad corporativo (Azure AD, Google Workspace, Okta).
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
                Volver a Configuración
              </Button>
              <Button 
                disabled 
                className="bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                Solicitar Acceso Anticipado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info cards about SSO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">¿Qué es SSO?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              El Inicio de Sesión Único (SSO) permite que los empleados de tu empresa 
              accedan a CumplIA usando sus credenciales corporativas existentes, 
              sin necesidad de contraseñas adicionales.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proveedores Soportados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Microsoft Azure AD / Entra ID</li>
              <li>• Google Workspace</li>
              <li>• Okta</li>
              <li>• OneLogin</li>
              <li>• Cualquier proveedor SAML 2.0</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requisitos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              El SSO estará disponible exclusivamente para clientes Enterprise. 
              Incluye soporte dedicado y SLA garantizado.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">¿Interesado?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Si tu empresa necesita SSO, contáctanos para una demostración personalizada.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Contactar Ventas (Próximamente)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
