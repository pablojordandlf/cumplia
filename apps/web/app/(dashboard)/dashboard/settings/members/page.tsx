'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InviteDialog } from './invite-dialog';
import { UsageIndicator } from './usage-indicator';
import { Member, MemberRole } from '@/types/organization';
import { MoreHorizontal, Mail, UserX, Shield, User, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthReady } from '@/lib/auth-helpers';

const ROLE_COLORS: Record<MemberRole, string> = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  editor: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: MemberRole;
  status: 'active' | 'pending' | 'invited';
  invited_by: string | null;
  invite_expires_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

export default function MembersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<OrganizationMember[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Esperar a que la autenticación esté lista
  const { isReady: isAuthReady, user } = useAuthReady();

  useEffect(() => {
    if (isAuthReady) {
      fetchData();
    }
  }, [isAuthReady]);

  async function fetchData(retryCount = 0) {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Obtener organización del usuario con plan (con reintentos)
      let memberData = null;
      let memberError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase
          .from('organization_members')
          .select('organization_id, role, organizations!organization_id(id, plan_name, max_users, seats_total)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
        
        memberData = result.data;
        memberError = result.error;
        
        // Si no hay error o es PGRST116 (no rows), no reintentar
        if (!result.error || result.error.code === 'PGRST116') {
          break;
        }
        
        // Esperar antes de reintentar
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
        }
      }

      if (memberError) {
        // PGRST116 = no rows returned, mensaje amigable
        if (memberError.code === 'PGRST116') {
          setError('No se encontró tu membresía en ninguna organización activa. Contacta con soporte si crees que esto es un error.');
        } else {
          console.error('Error getting member data:', memberError);
          setError('No se pudo acceder a la información de tu organización. Verifica que tienes acceso activo.');
        }
        setIsLoading(false);
        return;
      }

      if (!memberData) {
        setError('No se encontró tu membresía en ninguna organización activa.');
        setIsLoading(false);
        return;
      }

      setOrganizationId(memberData.organization_id);
      setCurrentUserRole(memberData.role);

      // Obtener miembros activos con sus perfiles
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          email,
          name,
          role,
          status,
          invited_by,
          invite_expires_at,
          created_at,
          profiles(full_name)
        `)
        .eq('organization_id', memberData.organization_id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (membersError) {
        console.error('Error fetching members:', membersError);
        setError('Error al cargar los miembros del equipo.');
        setIsLoading(false);
        return;
      }

      // Obtener invitaciones pendientes
      const { data: invitesData, error: invitesError } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          email,
          name,
          role,
          status,
          invited_by,
          invite_expires_at,
          created_at
        `)
        .eq('organization_id', memberData.organization_id)
        .eq('status', 'invited')
        .order('created_at', { ascending: false });

      if (invitesError) {
        console.error('Error fetching invites:', invitesError);
      }

      // Transformar datos al formato esperado
      const transformedMembers: Member[] = (membersData || []).map((m: any) => ({
        id: m.id,
        organizationId: m.organization_id,
        userId: m.user_id,
        email: m.email,
        name: m.name || m.profiles?.full_name || m.email.split('@')[0],
        role: m.role as MemberRole,
        status: m.status as 'active' | 'pending' | 'invited',
        invitedBy: m.invited_by,
        inviteExpiresAt: m.invite_expires_at,
        createdAt: m.created_at,
        updatedAt: m.created_at,
      }));

      setMembers(transformedMembers);
      setPendingInvites((invitesData || []) as OrganizationMember[]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error inesperado al cargar los datos del equipo.');
      setIsLoading(false);
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ 
          invite_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq('id', inviteId);

      if (error) throw error;
      
      toast.success('Invitación reenviada');
      fetchData();
    } catch (error) {
      toast.error('Error al reenviar la invitación');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar a este miembro?')) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      toast.success('Miembro eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar el miembro');
    }
  };

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  if (!isAuthReady || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">
            {!isAuthReady ? 'Inicializando sesión...' : 'Cargando equipo...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => { setIsRetrying(true); fetchData(); setIsRetrying(false); }}
          disabled={isRetrying}
          className="mt-4"
        >
          {isRetrying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reintentando...</>
          ) : (
            'Reintentar'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Miembros del Equipo</h1>
          <p className="text-gray-500 mt-1">Gestiona quién tiene acceso a tu organización</p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar Miembro
          </Button>
        )}
      </div>

      {/* Usage Indicator */}
      <div className="mb-6">
        <UsageIndicator />
      </div>

      {/* Active Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Unido</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {member.name?.charAt(0).toUpperCase() || 
                           member.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[member.role]}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? 'Activo' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    {canManageMembers && member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {currentUserRole === 'owner' && (
                            <DropdownMenuItem
                              onClick={() => {
                                // Cambiar rol - implementar según necesidad
                                toast.info('Función de cambio de rol próximamente');
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Cambiar Rol
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No hay miembros activos en tu organización.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Invitaciones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_COLORS[invite.role]}>
                        {ROLE_LABELS[invite.role as MemberRole]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {invite.invite_expires_at 
                        ? new Date(invite.invite_expires_at).toLocaleDateString('es-ES')
                        : 'Sin expiración'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleResendInvite(invite.id)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Reenviar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(invite.id)}
                            className="text-red-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InviteDialog 
        open={inviteOpen} 
        onClose={() => setInviteOpen(false)} 
        onSuccess={fetchData} 
        organizationId={organizationId}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
