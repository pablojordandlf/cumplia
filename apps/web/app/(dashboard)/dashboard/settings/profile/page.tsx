'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Edit3, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Crown,
  Users,
  Settings,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  role: MemberRole;
  status: string;
  organizations: {
    name: string;
    plan: string;
  }[];
}

const roleConfig: Record<MemberRole, { 
  label: string; 
  color: string; 
  icon: typeof Shield;
  description: string;
  permissions: string[];
}> = {
  owner: {
    label: 'Propietario',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Crown,
    description: 'Control total de la organización',
    permissions: [
      'Gestionar miembros y roles',
      'Configurar SSO/SAML',
      'Editar datos de la organización',
      'Eliminar sistemas de IA',
      'Acceso a todos los sistemas',
      'Gestionar facturación'
    ]
  },
  admin: {
    label: 'Administrador',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Shield,
    description: 'Gestión completa excepto facturación',
    permissions: [
      'Gestionar miembros (no propietarios)',
      'Configurar SSO/SAML',
      'Editar datos de la organización',
      'Eliminar sistemas de IA',
      'Acceso a todos los sistemas'
    ]
  },
  editor: {
    label: 'Editor',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Edit3,
    description: 'Puede crear y editar contenido',
    permissions: [
      'Crear nuevos sistemas de IA',
      'Editar sistemas existentes',
      'Gestionar riesgos y obligaciones',
      'Ver todos los sistemas de la org'
    ]
  },
  viewer: {
    label: 'Visualizador',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: User,
    description: 'Solo lectura',
    permissions: [
      'Ver sistemas de IA',
      'Ver documentación',
      'No puede editar ni crear'
    ]
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('No se pudo obtener el usuario');
        return;
      }

      // Obtener perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Construir perfil (usar datos de auth si no hay perfil)
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || null,
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
      };

      setProfile(userProfile);
      setFormData({ full_name: userProfile.full_name || '' });

      // Obtener membresía en organización
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('id, organization_id, role, status, organizations(name, plan)')
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error fetching membership:', memberError);
        toast.error('Error al cargar tu rol: ' + memberError.message);
      } else if (memberData) {
        console.log('Membership loaded:', memberData);
        setMembership(memberData as unknown as OrganizationMember);
      } else {
        console.warn('No membership found for user:', user.id);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Actualizar metadata en auth también
      await supabase.auth.updateUser({
        data: { full_name: formData.full_name }
      });

      setProfile(prev => prev ? { ...prev, full_name: formData.full_name } : null);
      setEditMode(false);
      toast.success('Perfil actualizado correctamente');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  function getInitials(name: string | null) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se pudo cargar el perfil</h2>
            <p className="text-gray-600 mb-4">Por favor, intenta recargar la página</p>
            <Button onClick={fetchProfile}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const role = membership?.role || 'viewer';
  console.log('Role from membership:', membership?.role, '| Final role used:', role);
  const roleInfo = roleConfig[role];
  const RoleIcon = roleInfo.icon;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* DEBUG PANEL - Temporal para diagnóstico */}
      <Card className="mb-6 bg-yellow-50 border-yellow-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-800">🔧 Debug Info (temporal)</CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-mono text-yellow-900 space-y-1">
          <p><strong>User ID:</strong> {profile.id}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Membership raw:</strong> {membership ? JSON.stringify(membership) : 'null'}</p>
          <p><strong>Role from DB:</strong> {membership?.role || 'NOT FOUND'}</p>
          <p><strong>Role used:</strong> {role}</p>
          <Button size="sm" variant="outline" onClick={fetchProfile} className="mt-2">Recargar datos</Button>
        </CardContent>
      </Card>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu información personal y permisos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de información personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nombre completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ full_name: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Guardar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                        {getInitials(profile.full_name || profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {profile.full_name || 'Sin nombre'}
                      </h3>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Miembro desde</span>
                      <p className="font-medium">{formatDate(profile.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ID de usuario</span>
                      <p className="font-medium font-mono text-xs">{profile.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar perfil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permisos según rol */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Tus Permisos
              </CardTitle>
              <CardDescription>
                Lo que puedes hacer en la plataforma según tu rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {roleInfo.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{permission}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Rol y org */}
        <div className="space-y-6">
          {/* Tarjeta de rol */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tu Rol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border ${roleInfo.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <RoleIcon className="w-6 h-6" />
                  <span className="font-semibold">{roleInfo.label}</span>
                </div>
                <p className="text-sm opacity-90">{roleInfo.description}</p>
              </div>

              {membership && (
                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">
                      {membership.organizations?.[0]?.name || 'Organización'}
                    </span>
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Plan {membership.organizations?.[0]?.plan || 'starter'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accesos rápidos según rol */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Accesos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {/* Todos los roles ven esto */}
                <Link href="/dashboard/inventory">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Mis Sistemas
                  </Button>
                </Link>

                {/* Solo admins y owners */}
                {(role === 'admin' || role === 'owner') && (
                  <>
                    <Link href="/dashboard/settings/members">
                      <Button variant="ghost" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Gestionar Equipo
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings/organization">
                      <Button variant="ghost" className="w-full justify-start">
                        <Building className="w-4 h-4 mr-2" />
                        Organización
                      </Button>
                    </Link>
                  </>
                )}

                {/* Solo owners */}
                {role === 'owner' && (
                  <Link href="/dashboard/settings/sso">
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Configurar SSO
                    </Button>
                  </Link>
                )}

                <Separator className="my-2" />

                <Link href="/dashboard/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                </Link>
              </nav>
            </CardContent>
          </Card>

          {/* Nota para viewers */}
          {role === 'viewer' && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  <strong>¿Necesitas más permisos?</strong><br />
                  Contacta a un administrador de tu organización para solicitar un rol con más accesos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
