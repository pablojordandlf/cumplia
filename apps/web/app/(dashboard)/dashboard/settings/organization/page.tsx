'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  plan: string;
}

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  async function fetchOrganization() {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!memberData) {
        setIsLoading(false);
        return;
      }

      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, name, plan')
        .eq('id', memberData.organization_id)
        .single();

      if (orgData) {
        setOrganization(orgData);
        setOrgName(orgData.name);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast.error('Error al cargar la organización');
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

      toast.success('Nombre de la organización actualizado');
      setOrganization({ ...organization, name: orgName.trim() });
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded mt-8"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <p className="text-gray-600">No se encontró la organización.</p>
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
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 capitalize">{organization.plan}</p>
              <p className="text-sm text-gray-500">
                Plan actual de tu organización
              </p>
            </div>
            <Button variant="outline" disabled>
              Cambiar Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
