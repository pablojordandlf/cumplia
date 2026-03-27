'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  ChevronRight,
  Building,
  Bell,
  Palette,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthReady, fetchUserOrganization } from '@/lib/auth-helpers';

interface Organization {
  id: string;
  name: string;
  plan: string;
  plan_name: string;
}

const settingsSections = [
  {
    title: 'Mi Perfil',
    description: 'Gestiona tu información personal, avatar y preferencias.',
    icon: User,
    href: '/dashboard/settings/profile',
    color: 'bg-indigo-500',
  },
  {
    title: 'Miembros del Equipo',
    description: 'Gestiona quién tiene acceso a tu organización y sus roles.',
    icon: Users,
    href: '/dashboard/settings/members',
    color: 'bg-blue-500',
  },
  {
    title: 'SSO / SAML',
    description: 'Configura autenticación única (SSO) con tu proveedor de identidad.',
    icon: Shield,
    href: '/dashboard/settings/sso',
    color: 'bg-purple-500',
    comingSoon: true,
  },
  {
    title: 'Organización',
    description: 'Configura el nombre, logo y detalles de tu organización.',
    icon: Building,
    href: '/dashboard/settings/organization',
    color: 'bg-green-500',
  },
  {
    title: 'Notificaciones',
    description: 'Personaliza cómo y cuándo recibes alertas y recordatorios.',
    icon: Bell,
    href: '#',
    color: 'bg-orange-500',
    comingSoon: true,
  },
  {
    title: 'Apariencia',
    description: 'Personaliza la apariencia de la aplicación.',
    icon: Palette,
    href: '#',
    color: 'bg-pink-500',
    comingSoon: true,
  },
];

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Professional',
  professional: 'Professional',
  business: 'Business',
  enterprise: 'Enterprise',
};

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Esperar a que la autenticación esté lista antes de hacer peticiones
  const { isReady: isAuthReady, user, error: authError } = useAuthReady();

  useEffect(() => {
    // Solo hacer la petición cuando la autenticación esté lista
    if (!isAuthReady) return;
    
    async function fetchOrganization() {
      try {
        setIsLoading(true);
        setError(null);
        
        if (authError) {
          setError('Debes iniciar sesión para acceder a la configuración.');
          setIsLoading(false);
          return;
        }

        const { data, error: orgError } = await fetchUserOrganization();

        if (orgError || !data) {
          console.error('Error fetching organization:', orgError);
          setError(orgError || 'No se encontró tu membresía en ninguna organización activa.');
          setIsLoading(false);
          return;
        }

        setOrganization({
          id: data.organization.id,
          name: data.organization.name,
          plan: data.organization.plan_name,
          plan_name: data.organization.plan_name,
        });
      } catch (error) {
        console.error('Error fetching organization:', error);
        setError('Error inesperado al cargar la información de la organización.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganization();
  }, [isAuthReady, user?.id, authError]);

  async function handleRetry() {
    setIsLoading(true);
    setError(null);
    
    const { data, error: orgError } = await fetchUserOrganization();
    
    if (orgError || !data) {
      setError(orgError || 'No se pudo cargar la información.');
    } else {
      setOrganization({
        id: data.organization.id,
        name: data.organization.name,
        plan: data.organization.plan_name,
        plan_name: data.organization.plan_name,
      });
      setError(null);
    }
    setIsLoading(false);
  }

  if (!isAuthReady || isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">
            {!isAuthReady ? 'Inicializando sesión...' : 'Cargando configuración...'}
          </span>
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
        <Button onClick={handleRetry} variant="outline">
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
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la configuración de tu organización y preferencias personales.
        </p>
      </div>

      {/* Organization Info Card */}
      {organization && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {organization.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Plan: <span className="capitalize font-medium">
                    {PLAN_LABELS[organization.plan_name] || organization.plan_name || 'Gratuito'}
                  </span>
                </p>
              </div>
              <Link href="/dashboard/settings/organization">
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.title}
              className={`group hover:shadow-md transition-shadow cursor-pointer ${
                section.comingSoon ? 'opacity-75' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${section.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      {section.comingSoon && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          Próximamente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                    {!section.comingSoon && (
                      <Link href={section.href}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-700"
                        >
                          Configurar
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="mt-8 bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">¿Necesitas ayuda?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Consulta nuestra documentación o contacta con soporte.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" disabled>
                Documentación
              </Button>
              <Button size="sm" disabled>
                Contactar Soporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
