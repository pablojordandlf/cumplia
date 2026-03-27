// components/risks/risk-analysis-completion-toggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRiskAnalysis } from '@/hooks/use-risk-analysis';

interface RiskAnalysisCompletionToggleProps {
  systemId: string;
  systemName: string;
  aiActLevel: string;
  hasRisksApplied: boolean;
  hasApplicableFactors: boolean;
  isCompleted: boolean;
  onCompletionChange?: (isCompleted: boolean) => void;
}

export function RiskAnalysisCompletionToggle({
  systemId,
  systemName,
  aiActLevel,
  hasRisksApplied,
  hasApplicableFactors,
  isCompleted,
  onCompletionChange,
}: RiskAnalysisCompletionToggleProps) {
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { markRiskAnalysisAsCompleted, markRiskAnalysisAsIncomplete } = useRiskAnalysis();
  const { toast } = useToast();

  const canMarkComplete = hasRisksApplied && hasApplicableFactors;

  const handleToggleCompletion = async () => {
    if (!canMarkComplete && !localCompleted) {
      toast({
        title: 'No se puede completar',
        description: 'Primero debes aplicar una plantilla de riesgos y marcar al menos un factor como aplicable.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const success = localCompleted
      ? await markRiskAnalysisAsIncomplete(systemId)
      : await markRiskAnalysisAsCompleted(systemId);

    if (success) {
      setLocalCompleted(!localCompleted);
      onCompletionChange?.(!localCompleted);
      toast({
        title: 'Éxito',
        description: localCompleted
          ? 'Análisis marcado como pendiente'
          : 'Análisis de riesgos completado',
      });
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del análisis',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-[#E09E50]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {localCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                Estado del Análisis de Riesgos
              </CardTitle>
              <CardDescription className="mt-1">
                {systemName}
              </CardDescription>
            </div>
            <Badge
              variant={localCompleted ? 'default' : 'outline'}
              className={localCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {localCompleted ? '✓ Completado' : 'Pendiente'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Completion Requirements */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Requisitos para marcar como completado:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <Checkbox
                  checked={hasRisksApplied}
                  disabled
                  className="cursor-not-allowed"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Plantilla de riesgos aplicada
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                    {hasRisksApplied
                      ? 'Plantilla aplicada correctamente'
                      : 'Ve a la sección de Riesgos y aplica una plantilla'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <Checkbox
                  checked={hasApplicableFactors}
                  disabled
                  className="cursor-not-allowed"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Al menos un factor marcado como aplicable
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                    {hasApplicableFactors
                      ? 'Tienes factores aplicables registrados'
                      : 'Marca al menos un factor de riesgo como "Aplicable"'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {!canMarkComplete && !localCompleted && (
            <Alert variant="destructive" className="border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-900 dark:text-orange-200">
                Completa los requisitos para marcar el análisis como completado.
              </AlertDescription>
            </Alert>
          )}

          {localCompleted && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-200">
                Análisis de riesgos completado. Este sistema aparecerá en el dashboard como analizado.
              </AlertDescription>
            </Alert>
          )}

          {/* Toggle Button */}
          <Button
            onClick={handleToggleCompletion}
            disabled={loading || (!canMarkComplete && !localCompleted)}
            className="w-full"
            variant={localCompleted ? 'destructive' : 'default'}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                {localCompleted ? '✗ Marcar como incompleto' : '✓ Marcar análisis como completado'}
              </>
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-gray-600 dark:text-gray-500 text-center">
            Este estado se refleja en el dashboard principal en tiempo real.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
