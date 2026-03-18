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
import { MoreHorizontal, Mail, UserX, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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

export default function MembersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Obtener organización del usuario
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberError || !memberData) {
        setLoading(false);
        return;
      }

      setOrganizationId(memberData.organization_id);
      setCurrentUserRole(memberData.role);

      // Obtener miembros de la organización
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', memberData.organization_id);

      if (membersError) {
        toast.error('Error al cargar miembros');
      } else {
        setMembers(membersData || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingInvites = members.filter((m) => m.status === 'pending');

  const can = (permission: string): boolean => {
    if (!currentUserRole) return false;
    const rolePerms: Record<MemberRole, string[]> = {
      owner: ['invite:member', 'update:member:role', 'remove:member'],
      admin: ['invite:member', 'update:member:role', 'remove:member'],
      editor: ['invite:member'],
      viewer: [],
    };
    return rolePerms[currentUserRole]?.includes(permission) || false;
  };

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    if (!organizationId) return;
    
    try {
      const response = await fetch(
        `/api/v1/organizations/${organizationId}/members/${memberId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar rol');

      toast.success('Rol actualizado correctamente');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar rol');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!organizationId) return;
    if (!confirm('¿Estás seguro de que deseas eliminar a este miembro?')) return;

    try {
      const response = await fetch(
        `/api/v1/organizations/${organizationId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Error al eliminar miembro');

      toast.success('Miembro eliminado correctamente');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar miembro');
    }
  };

  const handleResendInvite = async (memberId: string) => {
    if (!organizationId) return;
    
    try {
      const response = await fetch(
        `/api/v1/organizations/${organizationId}/invites/resend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId }),
        }
      );

      if (!response.ok) throw new Error('Error al reenviar invitación');

      toast.success('Invitación reenviada');
    } catch (error) {
      toast.error('Error al reenviar invitación');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Miembros del Equipo</h1>
          <p className="text-gray-600 mt-1">
            Gestiona quién tiene acceso a la organización
          </p>
        </div>
        <div className="flex items-center gap-4">
          <UsageIndicator />
          {can('invite:member') && (
            <Button onClick={() => setInviteOpen(true)}>
              <Mail className="w-4 h-4 mr-2" />
              Invitar Miembro
            </Button>
          )}
        </div>
      </div>

      {/* Active Members */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Miembros Activos ({activeMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {member.name?.charAt(0) || member.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name || 'Sin nombre'}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={ROLE_COLORS[member.role]}
                    >
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Activo
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {can('update:member:role') && member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'admin')}
                          >
                            Cambiar a Administrador
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'editor')}
                          >
                            Cambiar a Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'viewer')}
                          >
                            Cambiar a Visualizador
                          </DropdownMenuItem>
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
              {activeMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No hay miembros activos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invitaciones Pendientes ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-100">
                            <Mail className="h-4 w-4 text-gray-500" />
                          </AvatarFallback>
                        </Avatar>
                        <div>{invite.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ROLE_COLORS[invite.role]}
                      >
                        {ROLE_LABELS[invite.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invite.inviteExpiresAt
                        ? new Date(invite.inviteExpiresAt).toLocaleDateString()
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

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={fetchData} />
    </div>
  );
}
