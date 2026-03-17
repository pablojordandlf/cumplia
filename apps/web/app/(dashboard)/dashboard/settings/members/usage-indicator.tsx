'use client';

import { useOrganization } from '@/hooks/use-organization';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, AlertCircle } from 'lucide-react';

export function UsageIndicator() {
  const { organization, limits, usage, loading } = useOrganization();

  if (loading || !limits || !usage) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        <span>Cargando...</span>
      </div>
    );
  }

  const used = usage.users || 0;
  const total = limits.maxUsers;
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
