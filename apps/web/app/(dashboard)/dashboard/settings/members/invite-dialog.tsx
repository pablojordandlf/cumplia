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

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string | null;
  currentUserRole: MemberRole | null;
}

export function InviteDialog({ open, onClose, onSuccess, organizationId, currentUserRole }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [maxSeats, setMaxSeats] = useState<number | null>(null);
  const [currentMembers, setCurrentMembers] = useState<number>(0);
  const [pendingInvitations, setPendingInvitations] = useState<number>(0);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    if (open && organizationId) {
      fetchUsageData();
    }
  }, [open, organizationId]);

  async function fetchUsageData() {
    if (!organizationId) return;
    
    try {
      setUsageLoading(true);
      
      // Fetch organization limits
      const orgRes = await fetch(`/api/v1/organizations/${organizationId}`);
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setMaxSeats(orgData.data?.seatsTotal || 1);
      }

      // Count current active members
      const membersRes = await fetch(`/api/v1/organizations/${organizationId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const activeCount = membersData.data?.filter((m: any) => m.type === 'member').length || 0;
        const pendingCount = membersData.data?.filter((m: any) => m.type === 'invitation').length || 0;
        setCurrentMembers(activeCount);
        setPendingInvitations(pendingCount);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setUsageLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !organizationId) return;

    const totalOccupied = currentMembers + pendingInvitations;

    // Check if at limit
    if (maxSeats && totalOccupied >= maxSeats && maxSeats !== -1) {
      toast.error(`Has alcanzado el límite de ${maxSeats} usuarios. Cancela invitaciones pendientes o actualiza tu plan.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar invitación');
      }

      toast.success('Invitación enviada correctamente');
      setEmail('');
      setName('');
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
    return roleHierarchy[currentUserRole] >= roleHierarchy[roleToAssign];
  };

  const totalOccupied = currentMembers + pendingInvitations;
  const isAtLimit = maxSeats !== null && maxSeats !== -1 && totalOccupied >= maxSeats;

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
              placeholder="juan@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre (opcional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                {canAssignRole('editor') && (
                  <SelectItem value="editor">Editor</SelectItem>
                )}
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {role === 'admin' && 'Puede gestionar miembros y configuración de la organización'}
              {role === 'editor' && 'Puede crear y editar sistemas de IA'}
              {role === 'viewer' && 'Solo puede ver información, no editar ni crear'}
            </p>
          </div>

          {!usageLoading && maxSeats !== null && (
            <div className={`p-3 rounded-lg text-sm ${
              isAtLimit
                ? 'bg-red-50 text-red-700' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{isAtLimit ? '⚠️' : '💡'}</span>
                <span>
                  {maxSeats === -1 
                    ? `Miembros: ${currentMembers} / Ilimitado`
                    : `Miembros: ${totalOccupied} / ${maxSeats}`
                  }
                  {pendingInvitations > 0 && ` (${pendingInvitations} invitaciones pendientes)`}
                </span>
              </div>
              {isAtLimit && (
                <span className="block mt-1 font-medium">
                  Has alcanzado el límite de usuarios.
                </span>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !email || isAtLimit}
            >
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
