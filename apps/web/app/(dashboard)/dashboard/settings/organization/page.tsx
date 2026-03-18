'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Loader2, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  plan: string;
  plan_name: string;
  seats_total: number;
  seats_used: number;
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Professional',
  professional: 'Professional',
  business: 'Business',
  enterprise: 'Enterprise',
};

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgPlan, setOrgPlan] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, []);

  async function fetchOrganization() {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Debes iniciar sesión para ver la configuración de la organización.');
        setIsLoading(false);
        return;
      }

      // Obtener el miembro actual con datos de organización
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, organizations!inner(id, name, plan, plan_name, seats_total, seats_used)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberError || !memberData) {
        console.error('Error fetching organization member:', memberError);
        setError('No se encontró tu membresía en ninguna organización activa.');
        setIsLoading(false);
        return;
      }

      // organizations viene como array desde la relación
      const orgArray = memberData.organizations as any[];
      const orgData = orgArray?.[0];

      if (!orgData || !orgData.id) {
        setError('No se encontró la información de tu organización.');
        setIsLoading(false);
        return;
      }

      const org: Organization = {
        id: orgData.id,
        name: orgData.name || 'Sin nombre',
        plan: orgData.plan || orgData.plan_name || 'free',
        plan_name: orgData.plan_name || orgData.plan || 'free',
        seats_total: orgData.seats_total || 1,
        seats_used: orgData.seats_used || 1,
      };

      setOrganization(org);
      setOrgName(org.name);
      setOrgPlan(org.plan_name || org.plan);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError('Error inesperado al cargar la información de la organización.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!organization || !orgName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgName.trim() })
        .eq('id', organization.id);

      if (error) throw error;

      toast.success('Nombre de la organización actualizado correctamente');
      setOrganization({ ...organization, name: orgName.trim() });
    } catch (err) {
      console.error('Error saving organization:', err);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Cargando organización...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchOrganization} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            No se encontró la organización. Verifica que tienes acceso activo.
          </AlertDescription>
        </Alert>
        <Button onClick={fetchOrganization} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building className="h-8 w-8 text-green-500" />
          Organización
        </h1>
        <p className="text-gray-600 mt-2">
          Configura el nombre y detalles de tu organización.
        </p>
      </div>

      {/* Organization Name */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            El nombre de tu organización se muestra en toda la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre de la Organización</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Nombre de tu empresa"
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || orgName === organization.name}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
          <CardDescription>
            Información sobre tu plan de suscripción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {PLAN_LABELS[orgPlan] || orgPlan || 'Gratuito'}
                </p>
                <p className="text-sm text-gray-500">
                  Plan actual de tu organización
                </p>
              </div>
              <Button variant="outline" disabled>
                Cambiar Plan
              </Button>
            </div>

            {/* Seats Info */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Usuarios</p>
                  <p className="text-sm text-gray-500">
                    {organization.seats_used || 0} de {organization.seats_total === -1 ? 'ilimitados' : organization.seats_total} usuarios usados
                  </p>
                </div>
                <div className="w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ 
                        width: organization.seats_total === -1 
                          ? '0%' 
                          : `${Math.min(100, (organization.seats_used / organization.seats_total) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
