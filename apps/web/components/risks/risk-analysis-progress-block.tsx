'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRiskAnalysis } from '@/hooks/use-risk-analysis';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Target,
  Zap,
  Lock,
  CheckCheck
} from 'lucide-react';

interface RiskAnalysisProgressBlockProps {
  systemId: string;
  systemName: string;
  aiActLevel: string;
  hasApplicableFactors: boolean;
  totalRisks: number;
  assessedRisks: number;
  mitigatedRisks: number;
  isCompleted: boolean;
  onCompletionChange: (completed: boolean) => void;
  isReadOnly?: boolean;
}

const RISK_CONFIG = {
  prohibited: {
    label: 'Prohibido',
    badge: '🔴',
    color: 'from-red-600 to-red-500',
    barColor: 'bg-red-600 dark:bg-red-500',
    required: true,
    description: 'Sistema prohibido bajo AI Act',
  },
  high_risk: {
    label: 'Alto Riesgo',
    badge: '🔴',
    color: 'from-red-600 to-red-500',
    barColor: 'bg-red-600 dark:bg-red-500',
    required: true,
    description: 'Análisis obligatorio antes de despliegue',
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    badge: '🟡',
    color: 'from-yellow-600 to-yellow-500',
    barColor: 'bg-yellow-600 dark:bg-yellow-500',
    required: false,
    description: 'Análisis recomendado',
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    badge: '🟢',
    color: 'from-green-600 to-green-500',
    barColor: 'bg-green-600 dark:bg-green-500',
    required: false,
    description: 'Análisis opcional',
  },
  unclassified: {
    label: 'Sin Clasificar',
    badge: '⚪',
    color: 'from-gray-600 to-gray-500',
    barColor: 'bg-gray-600 dark:bg-gray-500',
    required: false,
    description: 'Clasifica el sistema primero',
  },
};

export function RiskAnalysisProgressBlock({
  systemId,
  systemName,
  aiActLevel,
  hasApplicableFactors,
  totalRisks,
  assessedRisks,
  mitigatedRisks,
  isCompleted,
  onCompletionChange,
  isReadOnly = false
}: RiskAnalysisProgressBlockProps) {
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { markRiskAnalysisAsCompleted, markRiskAnalysisAsIncomplete } = useRiskAnalysis();
  const { toast } = useToast();

  const config = RISK_CONFIG[aiActLevel as keyof typeof RISK_CONFIG] || RISK_CONFIG.unclassified;
  const isDisabled = !hasApplicableFactors || isReadOnly;
  const assessmentPercentage = totalRisks > 0 ? Math.round((assessedRisks / totalRisks) * 100) : 0;
  const mitigationPercentage = totalRisks > 0 ? Math.round((mitigatedRisks / totalRisks) * 100) : 0;

  const handleToggle = async () => {
    if (isDisabled) return;

    setLoading(true);
    try {
      const newState = !localCompleted;
      if (newState) {
        await markRiskAnalysisAsCompleted(systemId);
        setLocalCompleted(true);
        onCompletionChange(true);
        toast({
          title: '✅ Análisis Completado',
          description: `Análisis de riesgos marcado como completado para ${systemName}`
        });
      } else {
        await markRiskAnalysisAsIncomplete(systemId);
        setLocalCompleted(false);
        onCompletionChange(false);
        toast({
          title: '🔄 Análisis Reabierto',
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

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 + i * 0.08 },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="glass rounded-2xl bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm border border-white/20 hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Progreso de Gestión de Riesgos
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {systemName}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">{config.badge}</span>
              <Badge 
                variant={config.required ? 'destructive' : 'outline'}
                className={config.required ? '' : 'bg-gray-100/10 border-gray-400/20'}
              >
                {config.required ? 'Obligatorio' : 'Opcional'}
              </Badge>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Risk Assessment Progress */}
          <motion.div
            custom={0}
            variants={itemVariants}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Evaluación de Riesgos
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {assessedRisks}/{totalRisks}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={assessmentPercentage} className="flex-1 h-2" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-12 text-right">
                {assessmentPercentage}%
              </span>
            </div>
          </motion.div>

          {/* Risk Mitigation Progress */}
          <motion.div
            custom={1}
            variants={itemVariants}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Mitigación de Riesgos
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {mitigatedRisks}/{totalRisks}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={mitigationPercentage} className="flex-1 h-2" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-12 text-right">
                {mitigationPercentage}%
              </span>
            </div>
          </motion.div>

          {/* Completion Toggle */}
          <motion.div
            custom={2}
            variants={itemVariants}
            className="pt-4 border-t border-white/10"
          >
            <motion.button
              onClick={handleToggle}
              disabled={isDisabled || loading}
              whileHover={!isDisabled && !loading ? { scale: 1.02 } : {}}
              whileTap={!isDisabled && !loading ? { scale: 0.98 } : {}}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                localCompleted
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 hover:from-green-500/30 hover:to-emerald-500/30'
                  : 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30 hover:from-orange-500/20 hover:to-amber-500/20'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {localCompleted ? (
                    <CheckCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {localCompleted ? '✅ Análisis Completado' : '📝 Marcar como Completado'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                )}
              </div>
            </motion.button>
          </motion.div>

          {/* Status Messages */}
          {!hasApplicableFactors && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Requiere plantilla aplicada y ≥1 factor marcado como aplicable
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {config.required && !localCompleted && assessmentPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  ⚡ Análisis evaluado al 100%. Marca como completado cuando termines la documentación de mitigaciones.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {config.required && !localCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  🔴 {config.label}: El análisis es obligatorio antes de desplegar este sistema.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
