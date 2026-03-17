'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SSOProviderList } from '@/components/sso/sso-provider-list';
import { SSOProviderSetup } from '@/components/sso/sso-provider-setup';
import { Plus, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOrganization } from '@/hooks/use-organization';
import { usePermissions } from '@/hooks/use-permissions';

export default function SSOSettingsPage() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { role, isLoading: permLoading } = usePermissions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = role === 'owner' || role === 'admin';
  const isLoading = orgLoading || permLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No se encontró la organización</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta página. Solo los administradores y owners pueden configurar SSO.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setRefreshKey(prev => prev + 1); // Force refresh of provider list
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Configuración SSO
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura el inicio de sesión único (SSO) para tu organización mediante SAML 2.0.
        </p>
      </div>

      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          El SSO permite que los usuarios de tu empresa inicien sesión con sus credenciales corporativas 
          (Microsoft Azure AD, Google Workspace, Okta, etc.). Requiere plan Enterprise.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proveedores SSO</CardTitle>
            <CardDescription>
              Gestiona los proveedores de identidad configurados para tu organización.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo Proveedor SSO</DialogTitle>
              </DialogHeader>
              <SSOProviderSetup
                organizationId={organization.id}
                onSuccess={handleSuccess}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <SSOProviderList 
            key={refreshKey}
            organizationId={organization.id} 
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información de Configuración</CardTitle>
          <CardDescription>
            Datos que necesitarás proporcionar a tu proveedor de identidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Entity ID (Issuer):</p>
            <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">
              {`https://auth.supabase.co/sso/saml/${organization.id}`}
            </code>
          </div>
          <div>
            <p className="text-sm font-medium">ACS URL (Assertion Consumer Service):</p>
            <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">
              {`${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/api/v1/auth/sso/callback`}
            </code>
          </div>
          <div>
            <p className="text-sm font-medium">Formato de Name ID:</p>
            <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">
              urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
