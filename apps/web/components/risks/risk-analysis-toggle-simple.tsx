'use client';

import { useState } from 'react';
import { useRiskAnalysis } from '@/hooks/use-risk-analysis';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface RiskAnalysisToggleSimpleProps {
  systemId: string;
  systemName: string;
  aiActLevel: string;
  hasApplicableFactors: boolean;
  isCompleted: boolean;
  onCompletionChange: (completed: boolean) => void;
}

export function RiskAnalysisToggleSimple({
  systemId,
  systemName,
  aiActLevel,
  hasApplicableFactors,
  isCompleted,
  onCompletionChange
}: RiskAnalysisToggleSimpleProps) {
  const [loading, setLoading] = useState(false);
  const { markRiskAnalysisAsCompleted, markRiskAnalysisAsIncomplete } = useRiskAnalysis();
  const { toast } = useToast();

  const isHighRisk = aiActLevel === 'high_risk';
  const isDisabled = !hasApplicableFactors;

  const handleToggle = async (checked: boolean) => {
    if (isDisabled) return;

    setLoading(true);
    try {
      if (checked) {
        await markRiskAnalysisAsCompleted(systemId);
        onCompletionChange(true);
        toast({
          title: 'Análisis completado',
          description: `Análisis de riesgos marcado como completado para ${systemName}`
        });
      } else {
        await markRiskAnalysisAsIncomplete(systemId);
        onCompletionChange(false);
        toast({
          title: 'Análisis reabierto',
          description: `Análisis de riesgos marcado como incompleto para ${systemName}`
        });
      }
    } catch (error) {
      console.error('Error toggling analysis completion:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del análisis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex items-center gap-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggle}
              disabled={isDisabled || loading}
              className="h-5 w-5"
            />
            <span>Análisis de Riesgos Completado</span>
            {isCompleted && (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </label>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {isDisabled
            ? '⚠️ Requiere plantilla aplicada y ≥1 factor marcado como aplicable'
            : isHighRisk
              ? '🔴 Obligatorio para sistemas de Riesgo Alto'
              : '📝 Marca como completado cuando hayas terminado el análisis'}
        </p>
      </div>
    </div>
  );
}
