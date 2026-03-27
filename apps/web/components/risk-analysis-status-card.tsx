'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskAnalysisStats {
  highRiskTotal: number;
  highRiskWithAnalysis: number;
  systemsWithoutAnalysis: number;
  analysisPercentage: number;
}

export function RiskAnalysisStatusCard() {
  const [stats, setStats] = useState<RiskAnalysisStats>({
    highRiskTotal: 0,
    highRiskWithAnalysis: 0,
    systemsWithoutAnalysis: 0,
    analysisPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRiskAnalysisStats();
  }, []);

  async function fetchRiskAnalysisStats() {
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

      // Fetch all systems
      let systemsQuery = supabase
        .from('use_cases')
        .select('id, ai_act_level, risk_analysis_completed')
        .is('deleted_at', null);

      if (organizationId) {
        systemsQuery = systemsQuery.or(`organization_id.eq.${organizationId},user_id.eq.${session.user.id}`);
      } else {
        systemsQuery = systemsQuery.eq('user_id', session.user.id);
      }

      const { data: systems, error } = await systemsQuery;

      if (error) {
        console.error('Error fetching systems:', error);
        setLoading(false);
        return;
      }

      // Calculate stats
      const allSystems = systems || [];
      const highRiskSystems = allSystems.filter(s => s.ai_act_level === 'high_risk');
      const highRiskWithAnalysis = highRiskSystems.filter(s => s.risk_analysis_completed).length;
      const systemsWithoutAnalysis = allSystems.filter(
        s => s.ai_act_level && s.ai_act_level !== 'unclassified' && !s.risk_analysis_completed
      ).length;

      const analysisPercentage = highRiskSystems.length > 0
        ? Math.round((highRiskWithAnalysis / highRiskSystems.length) * 100)
        : 0;

      setStats({
        highRiskTotal: highRiskSystems.length,
        highRiskWithAnalysis,
        systemsWithoutAnalysis,
        analysisPercentage,
      });
    } catch (error) {
      console.error('Error in fetchRiskAnalysisStats:', error);
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 + i * 0.05 },
    }),
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-48 rounded-xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 animate-pulse"
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border-white/10 hover:border-blue-500/50 transition-all duration-300">
        <CardHeader className="pb-3">
          <motion.div
            custom={0}
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de Riesgos
              </CardTitle>
              <CardDescription className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                Estado de completitud de análisis
              </CardDescription>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </motion.div>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* High Risk Systems Analysis */}
          <motion.div
            custom={1}
            variants={itemVariants}
            className="space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sistemas Alto Riesgo con Análisis
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.highRiskWithAnalysis}/{stats.highRiskTotal}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={stats.analysisPercentage}
                className="flex-1 h-2"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-10">
                {stats.analysisPercentage}%
              </span>
            </div>
          </motion.div>

          {/* Warning: Systems without analysis */}
          {stats.systemsWithoutAnalysis > 0 && (
            <motion.div
              custom={2}
              variants={itemVariants}
              className="p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  {stats.systemsWithoutAnalysis} sistema{stats.systemsWithoutAnalysis !== 1 ? 's' : ''} sin análisis de riesgos
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                  Completa los análisis pendientes en tu inventario
                </p>
              </div>
            </motion.div>
          )}

          {/* CTA Link */}
          <motion.div
            custom={3}
            variants={itemVariants}
          >
            <Link
              href="/dashboard/inventory"
              className="group inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Ir al Inventario
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
