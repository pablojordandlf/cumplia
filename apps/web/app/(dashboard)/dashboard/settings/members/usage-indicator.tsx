'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/lib/auth-helpers';

export function UsageIndicator() {
  const [used, setUsed] = useState<number>(0);
  const [total, setTotal] = useState<number | null>(null);
  const [invitationsUsed, setInvitationsUsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isReady: isAuthReady, user } = useAuthReady();

  useEffect(() => {
    if (isAuthReady) {
      fetchUsage();
    }
  }, [isAuthReady]);

  async function fetchUsage() {
    try {
      setIsLoading(true);
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Obtener membresía del usuario
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberError || !memberData) {
        console.error('Error fetching member data:', memberError);
        setIsLoading(false);
        return;
      }

      const orgId = memberData.organization_id;
      
      // Obtener datos de la organización
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('seats_total, plan_name')
        .eq('id', orgId)
        .single();
      
      if (orgError || !orgData) {
        console.error('Error fetching org data:', orgError);
        setIsLoading(false);
        return;
      }
      
      // Obtener el límite de seats
      let maxUsers = orgData?.seats_total;
        
      // Si no hay seats_total, buscar en tabla plans
      if (!maxUsers) {
        const planName = orgData?.plan_name || 'free';
        const { data: planData } = await supabase
          .from('plans')
          .select('limits')
          .eq('name', planName)
          .single();
        
        if (planData?.limits) {
          const limits = planData.limits as any;
          maxUsers = limits?.users || limits?.max_users || 1;
        }
      }

      maxUsers = maxUsers || 1;

      // Contar miembros activos
      const { count: membersCount, error: membersError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active');
      
      if (membersError) {
        console.error('Error counting members:', membersError);
      }

      // Contar invitaciones pendientes
      const { count: invitesCount, error: invitesError } = await supabase
        .from('pending_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'pending');
      
      if (invitesError) {
        console.error('Error counting invitations:', invitesError);
      }

      const activeMembers = membersCount || 0;
      const pendingInvites = invitesCount || 0;
      const totalUsed = activeMembers + pendingInvites;

      setTotal(maxUsers);
      setUsed(activeMembers);
      setInvitationsUsed(pendingInvites);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full border bg-gray-50 border-gray-200">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Cargando...</span>
      </div>
    );
  }

  // Si no hay límite o es ilimitado, mostrar contador simple
  if (total === null || total === -1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full border bg-blue-50 border-blue-200">
        <Users className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          {used} usuarios
        </span>
      </div>
    );
  }

  // Calcular porcentaje y disponibles
  const totalUsed = used + invitationsUsed;
  const available = Math.max(0, total - totalUsed);
  const percentage = Math.min(100, Math.max(0, Math.round((totalUsed / total) * 100)));
  
  // Determinar color basado en uso
  let badgeClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  let progressColor = 'bg-blue-500';
  
  if (available === 0) {
    badgeClasses = 'bg-red-50 text-red-700 border-red-200';
    progressColor = 'bg-red-500';
  } else if (percentage >= 80) {
    badgeClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    progressColor = 'bg-yellow-500';
  }

  return (
    <div className={`flex flex-col gap-2 px-4 py-3 rounded-lg border ${badgeClasses}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {used} miembro{used !== 1 ? 's' : ''} activo{used !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs font-medium">
          {percentage}%
        </span>
      </div>
      
      {invitationsUsed > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <UserPlus className="h-3 w-3" />
          <span>{invitationsUsed} invitación{invitationsUsed !== 1 ? 'es' : ''} pendiente{invitationsUsed !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          {totalUsed}/{total} usados
        </span>
        {available > 0 ? (
          <span className="text-green-600 font-medium">
            +{available} disponible{available !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-red-600 font-medium">
            Sin disponibilidad
          </span>
        )}
      </div>
    </div>
  );
}
