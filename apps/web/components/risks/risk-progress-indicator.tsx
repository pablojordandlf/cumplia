// components/risks/risk-progress-indicator.tsx
'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  Target,
  CheckCheck,
  Lock
} from 'lucide-react';
import { useRiskAnalysis } from '@/hooks/use-risk-analysis';
import { toast } from 'sonner'

interface RiskProgressIndicatorProps {
  total: number;
  assessed: number;
  mitigated: number;
  completionPercentage: number;
  systemId?: string;
  systemName?: string;
  aiActLevel?: string;
  hasApplicableFactors?: boolean;
  isCompleted?: boolean;
  onCompletionChange?: (completed: boolean) => void;
  isReadOnly?: boolean;
}

export function RiskProgressIndicator({ 
  total, 
  assessed, 
  mitigated, 
  completionPercentage,
  systemId,
  systemName,
  aiActLevel,
  hasApplicableFactors = true,
  isCompleted = false,
  onCompletionChange,
  isReadOnly = false
}: RiskProgressIndicatorProps) {
  const identified = total - assessed;
  const inProgress = assessed - mitigated;
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { markRiskAnalysisAsCompleted, markRiskAnalysisAsIncomplete } = useRiskAnalysis();

  const isDisabled = !hasApplicableFactors || isReadOnly;
  const isHighRisk = aiActLevel === 'high_risk';

  const handleToggleCompletion = async () => {
    if (!systemId || isDisabled || loading) return;

    setLoading(true);
    try {
      const newState = !localCompleted;
      if (newState) {
        await markRiskAnalysisAsCompleted(systemId);
        setLocalCompleted(true);
        onCompletionChange?.(true);
        toast.success('✅ Análisis Completado', { description: `Análisis de riesgos marcado como completado para ${systemName}` });
      } else {
        await markRiskAnalysisAsIncomplete(systemId);
        setLocalCompleted(false);
        onCompletionChange?.(false);
        toast.success('🔄 Análisis Reabierto', { description: `Análisis de riesgos marcado como incompleto para ${systemName}` });
      }
    } catch (error) {
      console.error('Error toggling analysis completion:', error);
      toast.error('Error', { description: 'No se pudo actualizar el estado del análisis' });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#E3DFD5]">
              <AlertCircle className="h-4 w-4 text-[#8B9BB4]" />
              <div>
                <p className="text-xs text-muted-foreground">Identificados</p>
                <p className="text-lg font-semibold text-gray-700">{identified}</p>
              </div>
            </div>

            {/* Assessed */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFE8D1]">
              <ShieldAlert className="h-4 w-4 text-[#E8FF47]" />
              <div>
                <p className="text-xs text-muted-foreground">Evaluados</p>
                <p className="text-lg font-semibold text-[#D9885F]">{assessed}</p>
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

          {/* Completion Selector - only show if systemId provided */}
          {systemId && (
            <>
              <div className="border-t pt-4 mt-4" />
              
              {/* Toggle Button - Similar to Applicable toggle in risk analysis */}
              <button
                onClick={handleToggleCompletion}
                disabled={isDisabled || loading}
                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                  localCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
              >
                <div className="flex items-center gap-3">
                  {localCompleted ? (
                    <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {localCompleted ? '✅ Análisis de Riesgos Completado' : '📝 Marcar Análisis como Completado'}
                    </p>
                    <p className="text-xs text-[#8B9BB4] dark:text-[#8B9BB4]">
                      {isHighRisk
                        ? '🔴 Obligatorio para sistemas de Riesgo Alto'
                        : '✓ Análisis completado cuando termines la evaluación'}
                    </p>
                  </div>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E8FF47] border-t-transparent" />
                )}
              </button>

              {/* Status Messages */}
              {!hasApplicableFactors && (
                <Alert variant="destructive" className="mt-3">
                  <Lock className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Requiere plantilla aplicada y ≥1 factor marcado como aplicable
                  </AlertDescription>
                </Alert>
              )}

              {isHighRisk && !localCompleted && (
                <Alert className="mt-3 border-orange-300 bg-orange-50 dark:bg-orange-900/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
                    ⚠️ Análisis obligatorio. No puedes desplegar este sistema sin completar el análisis de riesgos.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
