'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/lib/auth-helpers';

export function UsageIndicator() {
  const [used, setUsed] = useState<number>(0);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Esperar a que la autenticación esté lista
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

      // Obtener organización del usuario con sus datos (con reintentos)
      let memberData = null;
      let memberError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase
          .from('organization_members')
          .select('organization_id, organizations!inner(id, seats_total, plan_name, seats_used)')
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

      if (memberError || !memberData) {
        console.error('Error fetching member data:', memberError);
        setIsLoading(false);
        return;
      }

      const orgId = memberData.organization_id;
      
      // Obtener seats_used directamente de organizations
      const orgArray = memberData.organizations as any[];
      const orgData = orgArray?.[0];
      
      if (orgData) {
        // Primero intentar usar seats_total del registro de organization
        let maxUsers = orgData?.seats_total;
        let currentUsed = orgData?.seats_used || 0;
        
        // Si no hay seats_total, buscar en tabla plans mediante plan_name
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

        // Contar miembros activos
        if (!currentUsed) {
          const { count, error: countError } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('status', 'active');
          
          if (!countError) {
            currentUsed = count || 0;
          }
        }

        setTotal(maxUsers || 1);
        setUsed(currentUsed);
      }
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

  // Calcular porcentaje
  const percentage = Math.min(100, Math.max(0, Math.round((used / total) * 100)));
  
  // Determinar color basado en uso
  let badgeClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  let progressColor = 'bg-blue-500';
  
  if (percentage >= 100) {
    badgeClasses = 'bg-red-50 text-red-700 border-red-200';
    progressColor = 'bg-red-500';
  } else if (percentage >= 80) {
    badgeClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    progressColor = 'bg-yellow-500';
  }

  return (
    <div className={`flex flex-col gap-1 px-3 py-2 rounded-lg border ${badgeClasses}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {used}/{total} usuarios
          </span>
        </div>
        <span className="text-xs font-medium">
          {percentage}%
        </span>
      </div>
      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
