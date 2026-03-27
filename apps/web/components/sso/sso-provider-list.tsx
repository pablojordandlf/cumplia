'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSSOProviders } from '@/hooks/use-sso-providers';
import { SSOProvider } from '@/types/sso';
import { Building2, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SSOProviderListProps {
  organizationId: string;
  onEdit?: (provider: SSOProvider) => void;
}

export function SSOProviderList({ organizationId, onEdit }: SSOProviderListProps) {
  const { providers, getProviders, deleteProvider, updateProvider, isLoading, error } = useSSOProviders();

  useEffect(() => {
    getProviders(organizationId);
  }, [organizationId, getProviders]);

  const handleToggleActive = async (provider: SSOProvider) => {
    await updateProvider(organizationId, provider.id, {
      ...provider,
      is_active: !provider.is_active,
    });
  };

  const handleDelete = async (providerId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor SSO? Los usuarios no podrán iniciar sesión con este método.')) {
      await deleteProvider(organizationId, providerId);
    }
  };

  if (isLoading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && providers.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No hay proveedores SSO configurados.<br />
            Haz clic en "Añadir Proveedor" para configurar uno.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <Card key={provider.id} className={!provider.is_active ? 'opacity-60' : undefined}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">{provider.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {provider.provider_type.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={provider.is_active}
                  onCheckedChange={() => handleToggleActive(provider)}
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(provider)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(provider.id)}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Dominios:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {provider.domains.map((domain) => (
                    <Badge key={domain} variant="secondary">
                      @{domain}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Aprovisionamiento: {provider.auto_provision ? 'Automático' : 'Manual'}</span>
                <span>Rol por defecto: {provider.default_role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
