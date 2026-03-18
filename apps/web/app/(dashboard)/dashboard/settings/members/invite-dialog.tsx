'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberRole } from '@/types/organization';
import { toast } from 'sonner';
import { Mail, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteDialog({ open, onClose, onSuccess }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole | null>(null);
  const [maxUsers, setMaxUsers] = useState<number | null>(null);
  const [currentUsers, setCurrentUsers] = useState<number>(0);

  useEffect(() => {
    if (open) {
      fetchOrgData();
    }
  }, [open]);

  async function fetchOrgData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(max_users)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberData) {
        setOrganizationId(memberData.organization_id);
        setCurrentUserRole(memberData.role);
        setMaxUsers(memberData.organizations?.max_users || null);

        // Contar usuarios actuales
        const { count } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', memberData.organization_id)
          .eq('status', 'active');
        
        setCurrentUsers(count || 0);
      }
    } catch (error) {
      console.error('Error fetching org data:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !organizationId) return;

    // Check if at limit
    if (maxUsers && currentUsers >= maxUsers) {
      toast.error('Has alcanzado el límite de usuarios para tu plan');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar invitación');
      }

      toast.success('Invitación enviada correctamente');
      setEmail('');
      setRole('viewer');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar invitación');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can assign this role
  const canAssignRole = (roleToAssign: MemberRole): boolean => {
    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
    if (!currentUserRole) return false;
    return roleHierarchy[currentUserRole] > roleHierarchy[roleToAssign];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invitar Miembro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MemberRole)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {canAssignRole('admin') && (
                  <SelectItem value="admin">Administrador</SelectItem>
                )}
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {role === 'admin' && 'Puede gestionar miembros y configuración'}
              {role === 'editor' && 'Puede crear y editar sistemas de IA'}
              {role === 'viewer' && 'Solo puede ver información, no editar'}
            </p>
          </div>

          {maxUsers && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              💡 Tu plan permite hasta {maxUsers} usuarios.
              {currentUsers >= maxUsers && (
                <span className="block mt-1 font-medium">Has alcanzado el límite.</span>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !email}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Invitación
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
