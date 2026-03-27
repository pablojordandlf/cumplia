'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, ArrowRight, Target, AlertCircle } from 'lucide-react';

interface RiskAnalysisStats {
  highRiskTotal: number;
  highRiskWithAnalysis: number;
  limitedRiskTotal: number;
  limitedRiskWithAnalysis: number;
  minimalRiskTotal: number;
  minimalRiskWithAnalysis: number;
  systemsWithoutAnalysis: number;
}

const RISK_CONFIG = {
  high_risk: {
    label: 'Alto Riesgo',
    badge: '🔴',
    color: 'from-red-600 to-red-500',
    barColor: 'bg-red-600',
    required: true,
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    badge: '🟡',
    color: 'from-yellow-600 to-yellow-500',
    barColor: 'bg-yellow-600',
    required: false,
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    badge: '🟢',
    color: 'from-green-600 to-green-500',
    barColor: 'bg-green-600',
    required: false,
  },
};

export function RiskAnalysisStatusCard() {
  const [stats, setStats] = useState<RiskAnalysisStats>({
    highRiskTotal: 0,
    highRiskWithAnalysis: 0,
    limitedRiskTotal: 0,
    limitedRiskWithAnalysis: 0,
    minimalRiskTotal: 0,
    minimalRiskWithAnalysis: 0,
    systemsWithoutAnalysis: 0,
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

      // Calculate stats per risk level
      const allSystems = systems || [];
      
      const highRiskSystems = allSystems.filter(s => s.ai_act_level === 'high_risk');
      const limitedRiskSystems = allSystems.filter(s => s.ai_act_level === 'limited_risk');
      const minimalRiskSystems = allSystems.filter(s => s.ai_act_level === 'minimal_risk');
      
      const highRiskWithAnalysis = highRiskSystems.filter(s => s.risk_analysis_completed).length;
      const limitedRiskWithAnalysis = limitedRiskSystems.filter(s => s.risk_analysis_completed).length;
      const minimalRiskWithAnalysis = minimalRiskSystems.filter(s => s.risk_analysis_completed).length;
      
      const systemsWithoutAnalysis = allSystems.filter(
        s => s.ai_act_level && s.ai_act_level !== 'unclassified' && !s.risk_analysis_completed
      ).length;

      setStats({
        highRiskTotal: highRiskSystems.length,
        highRiskWithAnalysis,
        limitedRiskTotal: limitedRiskSystems.length,
        limitedRiskWithAnalysis,
        minimalRiskTotal: minimalRiskSystems.length,
        minimalRiskWithAnalysis,
        systemsWithoutAnalysis,
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

  const sectionVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 + i * 0.1 },
    }),
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-64 rounded-2xl bg-gray-100/60 backdrop-blur-sm border border-gray-300/60 animate-pulse"
      />
    );
  }

  // Filter sections to show only those with systems
  const sectionsToShow = [
    {
      key: 'high_risk',
      ...RISK_CONFIG.high_risk,
      total: stats.highRiskTotal,
      completed: stats.highRiskWithAnalysis,
    },
    ...(stats.limitedRiskTotal > 0 ? [{
      key: 'limited_risk',
      ...RISK_CONFIG.limited_risk,
      total: stats.limitedRiskTotal,
      completed: stats.limitedRiskWithAnalysis,
    }] : []),
    ...(stats.minimalRiskTotal > 0 ? [{
      key: 'minimal_risk',
      ...RISK_CONFIG.minimal_risk,
      total: stats.minimalRiskTotal,
      completed: stats.minimalRiskWithAnalysis,
    }] : []),
  ];

  const totalSystems = stats.highRiskTotal + stats.limitedRiskTotal + stats.minimalRiskTotal;
  const totalCompleted = stats.highRiskWithAnalysis + stats.limitedRiskWithAnalysis + stats.minimalRiskWithAnalysis;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="glass rounded-2xl bg-white/75 border-gray-300/70 backdrop-blur-md transition-all duration-300 overflow-hidden hover:shadow-lg">
        <CardHeader className="pb-4 border-b border-gray-200/70">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-300/70">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Progreso de Gestión de Riesgos
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-gray-700">
                  Estado de completitud de análisis por nivel de riesgo
                </CardDescription>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300/70 flex-shrink-0"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </motion.div>
          </motion.div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-900">
                Progreso General
              </span>
              <span className="text-sm font-bold text-blue-700">
                {totalCompleted}/{totalSystems} completados
              </span>
            </div>
            <Progress
              value={totalSystems > 0 ? Math.round((totalCompleted / totalSystems) * 100) : 0}
              className="h-2.5"
            />
          </motion.div>

          {/* Risk Level Sections */}
          <div className="space-y-4">
            {sectionsToShow.length > 0 ? (
              sectionsToShow.map((section, idx) => {
                const percentage = section.total > 0 ? Math.round((section.completed / section.total) * 100) : 0;
                
                return (
                  <motion.div
                    key={section.key}
                    custom={idx}
                    variants={sectionVariants}
                    className="p-4 rounded-xl bg-gray-50/80 border border-gray-300/70 hover:border-gray-400/80 transition-all hover:bg-gray-100/80 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg">{section.badge}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {section.label}
                            </span>
                            {section.required && (
                              <Badge variant="destructive" className="text-xs bg-red-600 text-white">
                                Obligatorio
                              </Badge>
                            )}
                            {!section.required && (
                              <Badge variant="outline" className="text-xs bg-gray-100 border-gray-400 text-gray-700">
                                Opcional
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 mt-0.5">
                            {section.completed} de {section.total} sistema{section.total !== 1 ? 's' : ''} completado{section.completed !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-900 min-w-12 text-right">
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress Bar with Color */}
                    <div className="relative h-2.5 rounded-full bg-gray-300/40 border border-gray-400/40 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${section.barColor} transition-all`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Warning if incomplete */}
                    {section.required && percentage < 100 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 p-2 rounded-lg bg-red-50 border border-red-300/60 flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                          Completa los análisis para cumplir normativa
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-lg bg-gray-100/60 border border-gray-300/60">
                <p className="text-sm text-gray-600">
                  Sin sistemas clasificados para mostrar
                </p>
              </div>
            )}
          </div>

          {/* Warning: Systems without analysis */}
          {stats.systemsWithoutAnalysis > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-3 rounded-lg bg-orange-50 border border-orange-300/60 flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-900">
                  {stats.systemsWithoutAnalysis} sistema{stats.systemsWithoutAnalysis !== 1 ? 's' : ''} sin análisis
                </p>
                <p className="text-xs text-orange-800 mt-0.5">
                  Completa los análisis pendientes en tu inventario
                </p>
              </div>
            </motion.div>
          )}

          {/* CTA Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2 flex justify-center"
          >
            <Link
              href="/dashboard/inventory"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-100/60"
            >
              <Target className="w-4 h-4" />
              Ver Inventario y Gestionar Análisis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
