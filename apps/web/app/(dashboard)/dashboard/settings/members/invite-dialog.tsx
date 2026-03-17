'use client';

import { useState } from 'react';
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
import { useOrganization } from '@/hooks/use-organization';
import { usePermissions } from '@/hooks/use-permissions';
import { MemberRole } from '@/types/organization';
import { toast } from 'sonner';
import { Mail, UserPlus, Loader2 } from 'lucide-react';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteDialog({ open, onClose, onSuccess }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [loading, setLoading] = useState(false);
  const { organization, limits, usage } = useOrganization();
  const { can } = usePermissions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !organization) return;

    // Check if at limit
    if (limits?.maxUsers && usage?.users && usage.users >= limits.maxUsers) {
      toast.error('Has alcanzado el límite de usuarios para tu plan');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/organizations/${organization.id}/members/invite`, {
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
    const userRole = organization?.currentUserRole;
    if (!userRole) return false;
    return roleHierarchy[userRole] > roleHierarchy[roleToAssign];
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

          {limits?.maxUsers && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              💡 Tu plan permite hasta {limits.maxUsers} usuarios.
              {usage?.users && usage.users >= limits.maxUsers && (
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
