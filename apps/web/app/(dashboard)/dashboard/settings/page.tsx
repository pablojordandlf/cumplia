'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
  Palette
} from 'lucide-react';
import { useOrganization } from '@/hooks/use-organization';

const settingsSections = [
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
  },
  {
    title: 'Organización',
    description: 'Configura el nombre, logo y detalles de tu organización.',
    icon: Building,
    href: '#',
    color: 'bg-green-500',
    comingSoon: true,
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

export default function SettingsPage() {
  const { organization, isLoading } = useOrganization();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
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
                  Plan: <span className="capitalize font-medium">{organization.plan}</span>
                </p>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
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
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
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
              <Button variant="outline" size="sm">
                Documentación
              </Button>
              <Button size="sm">
                Contactar Soporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
