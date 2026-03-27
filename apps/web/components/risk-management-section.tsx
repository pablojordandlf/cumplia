'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  Brain,
  Flame,
  Shield,
  Activity,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemRiskData {
  id: string;
  name: string;
  ai_act_level: string;
  completed_obligations: number;
  total_obligations: number;
  has_risk_template: boolean;
  created_at: string;
}

interface RiskMetrics {
  totalSystems: number;
  systemsClassified: number;
  systemsUnclassified: number;
  classificationRate: number;
  
  // Obligation metrics
  totalObligations: number;
  completedObligations: number;
  completionRate: number;
  obligationsAtRisk: number;
  
  // Risk distribution
  prohibitedCount: number;
  highRiskCount: number;
  limitedRiskCount: number;
  minimalRiskCount: number;
  
  // Insights
  avgCompliancePerSystem: number;
  systemsNeedingAttention: number;
  healthScore: number; // 0-100
}

const OBLIGATIONS_PER_LEVEL: Record<string, number> = {
  prohibited: 2,
  high_risk: 8,
  limited_risk: 4,
  minimal_risk: 2,
  unclassified: 1,
};

const RISK_COLORS: Record<string, { color: string; icon: any; text: string }> = {
  prohibited: { color: '#dc2626', icon: AlertTriangle, text: 'Prohibido' },
  high_risk: { color: '#ea580c', icon: Flame, text: 'Alto Riesgo' },
  limited_risk: { color: '#ca8a04', icon: AlertCircle, text: 'Limitado' },
  minimal_risk: { color: '#16a34a', icon: CheckCircle2, text: 'Mínimo' },
};

export function RiskManagementSection() {
  const [metrics, setMetrics] = useState<RiskMetrics>({
    totalSystems: 0,
    systemsClassified: 0,
    systemsUnclassified: 0,
    classificationRate: 0,
    totalObligations: 0,
    completedObligations: 0,
    completionRate: 0,
    obligationsAtRisk: 0,
    prohibitedCount: 0,
    highRiskCount: 0,
    limitedRiskCount: 0,
    minimalRiskCount: 0,
    avgCompliancePerSystem: 0,
    systemsNeedingAttention: 0,
    healthScore: 0,
  });

  const [systemsData, setSystemsData] = useState<SystemRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchRiskMetrics();
  }, []);

  async function fetchRiskMetrics() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const organizationId = membership?.organization_id;

      // Fetch systems
      let systemsQuery = supabase
        .from('use_cases')
        .select('id, name, ai_act_level, created_at')
        .is('deleted_at', null);

      if (organizationId) {
        systemsQuery = systemsQuery.or(`organization_id.eq.${organizationId},user_id.eq.${session.user.id}`);
      } else {
        systemsQuery = systemsQuery.eq('user_id', session.user.id);
      }

      const { data: systems } = await systemsQuery;

      if (!systems || systems.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch obligations for all systems
      const { data: obligations } = await supabase
        .from('use_case_obligations')
        .select('use_case_id, is_completed')
        .in('use_case_id', systems.map(s => s.id));

      // Build detailed system data
      const systemDetails: SystemRiskData[] = systems.map(system => {
        const systemObs = obligations?.filter(o => o.use_case_id === system.id) || [];
        const totalObs = OBLIGATIONS_PER_LEVEL[system.ai_act_level] || 1;
        const completedObs = systemObs.filter(o => o.is_completed).length;

        return {
          id: system.id,
          name: system.name,
          ai_act_level: system.ai_act_level || 'unclassified',
          completed_obligations: completedObs,
          total_obligations: totalObs,
          has_risk_template: !!system.ai_act_level && system.ai_act_level !== 'unclassified',
          created_at: system.created_at,
        };
      });

      setSystemsData(systemDetails);

      // Calculate all metrics
      const totalSystems = systems.length;
      const classified = systems.filter(s => s.ai_act_level && s.ai_act_level !== 'unclassified').length;
      const unclassified = totalSystems - classified;
      const classificationRate = totalSystems > 0 ? Math.round((classified / totalSystems) * 100) : 0;

      const totalObligations = systemDetails.reduce((acc, s) => acc + s.total_obligations, 0);
      const completedObligations = systemDetails.reduce((acc, s) => acc + s.completed_obligations, 0);
      const completionRate = totalObligations > 0 ? Math.round((completedObligations / totalObligations) * 100) : 0;

      // Count systems by risk level
      const prohibitedCount = systems.filter(s => s.ai_act_level === 'prohibited').length;
      const highRiskCount = systems.filter(s => s.ai_act_level === 'high_risk').length;
      const limitedRiskCount = systems.filter(s => s.ai_act_level === 'limited_risk').length;
      const minimalRiskCount = systems.filter(s => s.ai_act_level === 'minimal_risk').length;

      // Obligations at risk = obligations not completed in HIGH/PROHIBITED systems
      const obligationsAtRisk = systemDetails
        .filter(s => s.ai_act_level === 'prohibited' || s.ai_act_level === 'high_risk')
        .reduce((acc, s) => acc + (s.total_obligations - s.completed_obligations), 0);

      // Calculate health score (0-100)
      // Factors: classification rate (50%), completion rate (40%), risk distribution (10%)
      const riskPenalty = (prohibitedCount * 10 + highRiskCount * 5) / Math.max(totalSystems, 1);
      const healthScore = Math.max(0, Math.min(100, 
        classificationRate * 0.5 + completionRate * 0.4 + (100 - riskPenalty) * 0.1
      ));

      // Systems needing immediate attention: unclassified + high/prohibited without complete obligations
      const systemsNeedingAttention = unclassified + 
        systemDetails.filter(s => 
          (s.ai_act_level === 'prohibited' || s.ai_act_level === 'high_risk') && 
          s.completed_obligations < s.total_obligations
        ).length;

      const avgCompliancePerSystem = totalSystems > 0 
        ? Math.round((completedObligations / totalObligations) * 100) 
        : 0;

      setMetrics({
        totalSystems,
        systemsClassified: classified,
        systemsUnclassified: unclassified,
        classificationRate,
        totalObligations,
        completedObligations,
        completionRate,
        obligationsAtRisk,
        prohibitedCount,
        highRiskCount,
        limitedRiskCount,
        minimalRiskCount,
        avgCompliancePerSystem,
        systemsNeedingAttention,
        healthScore: Math.round(healthScore),
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las métricas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const healthColor = metrics.healthScore >= 75 ? 'text-green-600 dark:text-green-400' 
    : metrics.healthScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' 
    : 'text-red-600 dark:text-red-400';

  const healthBgColor = metrics.healthScore >= 75 ? 'bg-green-50 dark:bg-green-950/20' 
    : metrics.healthScore >= 50 ? 'bg-yellow-50 dark:bg-yellow-950/20' 
    : 'bg-red-50 dark:bg-red-950/20';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="glass rounded-2xl p-8 border border-white/20"
      variants={itemVariants}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Resumen de Gestión de Riesgos
          </h2>
          <Badge className={`${healthBgColor} ${healthColor} border-0 px-3 py-1.5 text-base font-bold`}>
            Salud: {metrics.healthScore}%
          </Badge>
        </div>
        <p className="text-gray-700 dark:text-gray-500 text-sm">
          Vista ejecutiva del estado de cumplimiento y gestión de riesgos
        </p>
      </div>

      {/* Main Metrics Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total Systems */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Sistemas Total</p>
            <Brain className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalSystems}</p>
          <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">IA registrados</p>
        </motion.div>

        {/* Classification Rate */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Clasificados</p>
            <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.classificationRate}%</p>
          <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">
            {metrics.systemsClassified}/{metrics.totalSystems} clasificados
          </p>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Obligaciones</p>
            <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.completionRate}%</p>
          <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">
            {metrics.completedObligations}/{metrics.totalObligations} completadas
          </p>
        </motion.div>

        {/* At Risk */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">En Riesgo</p>
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.obligationsAtRisk}</p>
          <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">
            obligaciones sin completar
          </p>
        </motion.div>
      </motion.div>

      {/* Risk Distribution */}
      <motion.div
        className="mb-8"
        variants={itemVariants}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Distribución por Nivel de Riesgo
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Prohibited */}
          {metrics.prohibitedCount > 0 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
              <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">🔴 Prohibido</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.prohibitedCount}</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">Requiere atención inmediata</p>
            </div>
          )}

          {/* High Risk */}
          {metrics.highRiskCount > 0 && (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">🟠 Alto Riesgo</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.highRiskCount}</p>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">Requiere control</p>
            </div>
          )}

          {/* Limited Risk */}
          {metrics.limitedRiskCount > 0 && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">🟡 Limitado</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.limitedRiskCount}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Bajo supervisión</p>
            </div>
          )}

          {/* Minimal Risk */}
          {metrics.minimalRiskCount > 0 && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">🟢 Mínimo</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.minimalRiskCount}</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">Cumplimiento bien</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Items */}
      {metrics.systemsNeedingAttention > 0 && (
        <motion.div
          className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50"
          variants={itemVariants}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                {metrics.systemsNeedingAttention} sistemas requieren atención
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-400">
                {metrics.systemsUnclassified > 0 && `${metrics.systemsUnclassified} sin clasificar • `}
                {metrics.obligationsAtRisk > 0 && `${metrics.obligationsAtRisk} obligaciones no completadas`}
              </p>
              <Link href="/dashboard/inventory">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline mt-2 flex items-center gap-1"
                >
                  Ver inventario <ArrowRight className="w-3 h-3" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights Footer */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs text-gray-600 dark:text-gray-500">
          <span className="font-medium">💡 Insights:</span> {
            metrics.healthScore >= 75 
              ? 'Excelente gestión de riesgos. Mantén la revisión periódica de obligaciones.'
              : metrics.healthScore >= 50
              ? 'Buen progreso. Enfócate en clasificar sistemas sin riesgo definido y completar obligaciones pendientes.'
              : 'Se necesita acción inmediata. Clasifica todos los sistemas y completa las obligaciones de alto riesgo.'
          }
        </p>
      </div>
    </motion.div>
  );
}
