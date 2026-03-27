'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Target, TrendingUp, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemWithoutTemplate {
  id: string;
  name: string;
  ai_act_level: string;
}

interface RiskSummary {
  level: string;
  count: number;
  avgObligations: number;
  color: string;
  icon: string;
}

const RISK_COLORS: Record<string, { color: string; icon: string; text: string; bg: string }> = {
  prohibited: { color: '#dc2626', icon: '🔴', text: 'Prohibido', bg: 'bg-red-50 dark:bg-red-950/20' },
  high_risk: { color: '#ea580c', icon: '🟠', text: 'Alto Riesgo', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  limited_risk: { color: '#ca8a04', icon: '🟡', text: 'Limitado', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  minimal_risk: { color: '#16a34a', icon: '🟢', text: 'Mínimo', bg: 'bg-green-50 dark:bg-green-950/20' },
  unclassified: { color: '#6b7280', icon: '⚪', text: 'Sin clasificar', bg: 'bg-gray-50 dark:bg-gray-950/20' },
};

const OBLIGATIONS_PER_LEVEL: Record<string, number> = {
  prohibited: 2,
  high_risk: 8,
  limited_risk: 4,
  minimal_risk: 2,
  unclassified: 1,
};

export function RiskManagementSection() {
  const [systemsWithoutTemplate, setSystemsWithoutTemplate] = useState<SystemWithoutTemplate[]>([]);
  const [riskSummary, setRiskSummary] = useState<RiskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchRiskManagementData();
  }, []);

  async function fetchRiskManagementData() {
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

      // Fetch systems with risk levels
      let systemsQuery = supabase
        .from('use_cases')
        .select('id, name, ai_act_level')
        .is('deleted_at', null);

      if (organizationId) {
        systemsQuery = systemsQuery.or(`organization_id.eq.${organizationId},user_id.eq.${session.user.id}`);
      } else {
        systemsQuery = systemsQuery.eq('user_id', session.user.id);
      }

      const { data: systems } = await systemsQuery.order('created_at', { ascending: false });

      if (!systems || systems.length === 0) {
        setLoading(false);
        return;
      }

      // TODO: In real implementation, check which systems have risk templates applied
      // For now, we'll assume systems without explicit risk_template_status are "without template"
      const withoutTemplate = systems.filter(s => !s.ai_act_level || s.ai_act_level === 'unclassified');
      setSystemsWithoutTemplate(withoutTemplate);

      // Calculate risk summary by grouping systems by level
      const summary: Record<string, RiskSummary> = {};

      systems.forEach(system => {
        const level = system.ai_act_level || 'unclassified';
        const config = RISK_COLORS[level];
        const obligations = OBLIGATIONS_PER_LEVEL[level] || 1;

        if (!summary[level]) {
          summary[level] = {
            level,
            count: 0,
            avgObligations: obligations,
            color: config.color,
            icon: config.icon,
          };
        }
        summary[level].count += 1;
      });

      // Sort by priority
      const priorityOrder = ['prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'unclassified'];
      const sortedSummary = priorityOrder
        .filter(level => summary[level])
        .map(level => summary[level]);

      setRiskSummary(sortedSummary);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de gestión de riesgos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Risk Summary Cards - Horizontal Scroll */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Resumen de Riesgos por Sistema
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Análisis agregado de factores de riesgo aplicables en cada nivel
        </p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
          variants={containerVariants}
        >
          {riskSummary.map((summary, idx) => {
            const config = RISK_COLORS[summary.level];
            return (
              <motion.div
                key={summary.level}
                variants={itemVariants}
                whileHover={{ translateY: -4 }}
                className={`p-4 rounded-xl border-2 border-white/20 ${config.bg} backdrop-blur-sm transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{config.icon}</span>
                  <Badge className="text-xs">{summary.avgObligations} factores</Badge>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {config.text}
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {summary.count} sistema{summary.count !== 1 ? 's' : ''}
                </p>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Systems Without Risk Template - Card with Scrollable List */}
      {systemsWithoutTemplate.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-6 border border-white/20 bg-gradient-to-br from-red-50/50 dark:from-red-950/10 to-transparent"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                Sistemas sin Plantilla de Riesgos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Estos sistemas necesitan clasificación antes de desplegar en producción
              </p>
            </div>
            <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-base px-3 py-1">
              {systemsWithoutTemplate.length}
            </Badge>
          </div>

          {/* Scrollable List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
            {systemsWithoutTemplate.map((system, idx) => (
              <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ translateX: 4 }}
                  className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                        {system.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Click para clasificar
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="ml-2 flex-shrink-0"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
