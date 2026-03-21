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
import { useAuthReady } from '@/lib/auth-helpers';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string | null;
  currentUserRole: MemberRole | null;
}

export function InviteDialog({ open, onClose, onSuccess, organizationId, currentUserRole }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [maxUsers, setMaxUsers] = useState<number | null>(null);
  const [currentUsers, setCurrentUsers] = useState<number>(0);
  const [currentViewers, setCurrentViewers] = useState<number>(0);
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
      
      // Obtener datos de la organización incluyendo plan y límites
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('seats_total, plan_name, subscriptions(plans:plan_id(max_users, seats_limit))')
        .eq('id', organizationId)
        .single();

      const org = orgData as any;
      
      if (orgError) {
        console.error('Error fetching org data:', orgError);
        // Fallback: buscar max_users en tabla plans
        const planName = org?.plan_name || 'free';
        const { data: planData } = await supabase
          .from('plans')
          .select('limits')
          .eq('name', planName)
          .single();
        
        const limits = planData?.limits as any;
        setMaxUsers(limits?.users || limits?.max_users || org?.seats_total || 1);
      } else {
        // Intentar obtener max_users de varias fuentes
        const limits = org?.subscriptions?.[0]?.plans as any;
        const seatsTotal = org?.seats_total;
        const planLimits = limits?.max_users || limits?.seats_limit;
        
        setMaxUsers(planLimits || seatsTotal || 1);
      }

      // Contar usuarios actuales
      const { count, error: countError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active');
      
      if (!countError) {
        setCurrentUsers(count || 0);
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

    // Check if at limit
    if (maxUsers && currentUsers >= maxUsers && maxUsers !== -1) {
      toast.error(`Has alcanzado el límite de ${maxUsers} usuarios para tu plan. Actualiza tu plan para invitar más miembros.`);
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
    return roleHierarchy[currentUserRole] >= roleHierarchy[roleToAssign];
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
              placeholder="juan@empresa.com"
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
                {currentUserRole === 'owner' && (
                  <SelectItem value="owner">Propietario</SelectItem>
                )}
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
              {role === 'owner' && 'Control total de la organización'}
              {role === 'admin' && 'Puede gestionar miembros y configuración de la organización'}
              {role === 'editor' && 'Puede crear y editar sistemas de IA'}
              {role === 'viewer' && 'Solo puede ver información, no editar'}
            </p>
          </div>

          {!usageLoading && maxUsers !== null && (
            <div className={`p-3 rounded-lg text-sm ${
              currentUsers >= maxUsers && maxUsers !== -1 
                ? 'bg-red-50 text-red-700' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentUsers >= maxUsers && maxUsers !== -1 ? '⚠️' : '💡'}</span>
                <span>
                  {maxUsers === -1 
                    ? `Usuarios: ${currentUsers} / Ilimitado`
                    : `Usuarios: ${currentUsers} / ${maxUsers}`
                  }
                </span>
              </div>
              {currentUsers >= maxUsers && maxUsers !== -1 && (
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
              disabled={loading || !email || (maxUsers !== null && maxUsers !== -1 && currentUsers >= maxUsers)}
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
