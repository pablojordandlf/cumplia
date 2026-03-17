// components/risks/risk-progress-indicator.tsx
'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  Target 
} from 'lucide-react';

interface RiskProgressIndicatorProps {
  total: number;
  assessed: number;
  mitigated: number;
  completionPercentage: number;
}

export function RiskProgressIndicator({ 
  total, 
  assessed, 
  mitigated, 
  completionPercentage 
}: RiskProgressIndicatorProps) {
  const identified = total - assessed;
  const inProgress = assessed - mitigated;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-yellow-600';
    if (percentage >= 20) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Progreso de Gestión de Riesgos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getStatusColor(completionPercentage)}`}>
                {completionPercentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                ({mitigated}/{total})
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className={`h-full transition-all duration-500 ${getStatusBg(completionPercentage)}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Identified */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-muted-foreground">Identificados</p>
                <p className="text-lg font-semibold text-gray-700">{identified}</p>
              </div>
            </div>

            {/* Assessed */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Evaluados</p>
                <p className="text-lg font-semibold text-blue-700">{assessed}</p>
              </div>
            </div>

            {/* Mitigated */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Mitigados</p>
                <p className="text-lg font-semibold text-green-700">{mitigated}</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50">
              <Target className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">En Progreso</p>
                <p className="text-lg font-semibold text-yellow-700">{inProgress}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
