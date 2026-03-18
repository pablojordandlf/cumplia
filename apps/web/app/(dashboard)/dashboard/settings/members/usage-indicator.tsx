'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function UsageIndicator() {
  const [used, setUsed] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(max_users)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberData) {
        setTotal(memberData.organizations?.max_users || null);

        const { count } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', memberData.organization_id)
          .eq('status', 'active');
        
        setUsed(count || 0);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || total === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        <span>Cargando...</span>
      </div>
    );
  }

  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

  const getColor = () => {
    if (percentage >= 100) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${getColor()}`}>
          <Users className="w-4 h-4" />
          <span className="font-medium">
            {used}/{total === -1 ? '∞' : total} usuarios
          </span>
          {percentage >= 100 && <AlertCircle className="w-4 h-4" />}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="w-48">
          <p className="text-sm mb-2">Uso de licencias</p>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {used} de {total === -1 ? 'ilimitados' : total} usuarios utilizados
          </p>
          {percentage >= 100 && (
            <p className="text-xs text-red-500 mt-1">Has alcanzado el límite</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
