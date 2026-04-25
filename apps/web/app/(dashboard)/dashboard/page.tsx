'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  List,
  Target,
  Eye,
  Flame,
  Sparkles,
  CalendarClock,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { PendingObligationsWidget } from '@/components/pending-obligations-widget';
import { RiskDistributionChart } from '@/components/risk-distribution-chart';
import { RiskAnalysisStatusCard } from '@/components/risk-analysis-status-card';
import { usePermissions } from '@/hooks/use-permissions';
import { OnboardingWizard } from '@/components/onboarding-wizard';

interface DashboardStats {
  totalSystems: number;
  highRiskCount: number;
  limitedRiskCount: number;
  minimalRiskCount: number;
  prohibitedCount: number;
  unclassifiedCount: number;
  completedObligations: number;
  totalApplicableObligations: number;
  recentSystems: RecentSystem[];
}

interface RecentSystem {
  id: string;
  name: string;
  ai_act_level: string;
  created_at: string;
  completed_obligations: number;
  total_obligations: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSystems: 0,
    highRiskCount: 0,
    limitedRiskCount: 0,
    minimalRiskCount: 0,
    prohibitedCount: 0,
    unclassifiedCount: 0,
    completedObligations: 0,
    totalApplicableObligations: 0,
    recentSystems: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const supabase = createClient();
  const { can } = usePermissions();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
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
        .select('ai_act_level, id')
        .is('deleted_at', null);

      if (organizationId) {
        systemsQuery = systemsQuery.or(`organization_id.eq.${organizationId},user_id.eq.${session.user.id}`);
      } else {
        systemsQuery = systemsQuery.eq('user_id', session.user.id);
      }

      const { data: systems } = await systemsQuery;

      const highRiskCount = systems?.filter(s => s.ai_act_level === 'high_risk').length || 0;
      const limitedRiskCount = systems?.filter(s => s.ai_act_level === 'limited_risk').length || 0;
      const minimalRiskCount = systems?.filter(s => s.ai_act_level === 'minimal_risk').length || 0;
      const prohibitedCount = systems?.filter(s => s.ai_act_level === 'prohibited').length || 0;
      const unclassifiedCount = systems?.filter(s => !s.ai_act_level || s.ai_act_level === 'unclassified').length || 0;

      // Fetch obligations
      const { data: obligations } = await supabase
        .from('use_case_obligations')
        .select('is_completed, use_case_id')
        .in('use_case_id', systems?.map(s => s.id) || []);

      const completedObligations = obligations?.filter(o => o.is_completed).length || 0;

      let totalApplicableObligations = 0;
      systems?.forEach(system => {
        totalApplicableObligations += getObligationsCountForLevel(system.ai_act_level);
      });

      // Fetch recent systems
      let recentQuery = supabase
        .from('use_cases')
        .select('id, name, ai_act_level, created_at')
        .is('deleted_at', null);

      if (organizationId) {
        recentQuery = recentQuery.or(`organization_id.eq.${organizationId},user_id.eq.${session.user.id}`);
      } else {
        recentQuery = recentQuery.eq('user_id', session.user.id);
      }

      const { data: recentSystemsData } = await recentQuery
        .order('created_at', { ascending: false })
        .limit(5);

      const recentSystems: RecentSystem[] = await Promise.all(
        (recentSystemsData || []).map(async (system) => {
          const { data: sysObligations } = await supabase
            .from('use_case_obligations')
            .select('*')
            .eq('use_case_id', system.id);

          const completed = sysObligations?.filter((o: any) => o.is_completed).length || 0;
          const total = getObligationsCountForLevel(system.ai_act_level);

          return {
            ...system,
            completed_obligations: completed,
            total_obligations: total,
          };
        })
      );

      setStats({
        totalSystems: systems?.length || 0,
        highRiskCount,
        limitedRiskCount,
        minimalRiskCount,
        prohibitedCount,
        unclassifiedCount,
        completedObligations,
        totalApplicableObligations,
        recentSystems,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error', { description: 'No se pudieron cargar las estadísticas' });
    } finally {
      setLoading(false);
    }
  }

  function getObligationsCountForLevel(level: string): number {
    const counts: Record<string, number> = {
      prohibited: 2,
      high_risk: 8,
      limited_risk: 4,
      minimal_risk: 2,
      unclassified: 1,
    };
    return counts[level] || 1;
  }

  const completionRate = stats.totalApplicableObligations > 0 
    ? Math.round((stats.completedObligations / stats.totalApplicableObligations) * 100) 
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
      className="min-h-screen pt-6 pb-12 bg-gray-50 dark:bg-slate-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <div className="container mx-auto px-6 space-y-8 max-w-7xl">

        {/* Deadline alert banner */}
        {!loading && stats.highRiskCount > 0 && (
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/timeline">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    {stats.highRiskCount} sistema{stats.highRiskCount !== 1 ? 's' : ''} de alto riesgo {stats.highRiskCount !== 1 ? 'requieren' : 'requiere'} cumplimiento antes del 2 ago 2026
                    <span className="font-normal text-orange-100 ml-2">
                      — quedan {Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días
                    </span>
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        )}
        {!loading && stats.prohibitedCount > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 px-5 py-3.5 bg-red-600 text-white rounded-xl shadow-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold text-sm">
                ⚠ {stats.prohibitedCount} sistema{stats.prohibitedCount !== 1 ? 's' : ''} clasificado{stats.prohibitedCount !== 1 ? 's' : ''} como <strong>PROHIBIDO</strong> — las prácticas prohibidas están en vigor desde febrero 2025
              </span>
            </div>
          </motion.div>
        )}

        {/* Onboarding wizard */}
        <motion.div variants={itemVariants}>
          <OnboardingWizard />
        </motion.div>

        {/* Header - Buttons Row - UNIFORM SIZES */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-end"
          variants={itemVariants}
        >
          <Link href="/dashboard/inventory" className="flex-1 sm:flex-none">
            <Button 
              variant="outline" 
              className="w-full px-6 py-6 text-base border-gray-200 hover:bg-gray-50 text-gray-900 dark:text-gray-100"
            >
              <List className="w-5 h-5 mr-2" />
              Ver Inventario
            </Button>
          </Link>
          {can('ai_systems:create') && (
            <Link href="/dashboard/inventory/new" className="flex-1 sm:flex-none">
              <Button className="w-full px-6 py-6 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Sistema
              </Button>
            </Link>
          )}
        </motion.div>

        {/* THREE METRIC CARDS - HERO ROW */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-4"
        >
          {/* Total Systems */}
          <Link href="/dashboard/inventory">
            <motion.div
              whileHover={{ translateY: -2 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 cursor-pointer group hover:shadow-md transition-all border border-[#E3DFD5] dark:border-slate-700 flex items-center gap-4"
            >
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#8B9BB4] font-medium">Total de Sistemas</p>
                <p className="text-2xl font-bold text-[#0B1C3D] dark:text-gray-100 leading-tight">{stats.totalSystems}</p>
                <p className="text-xs text-[#8B9BB4] truncate">Sistemas IA registrados</p>
              </div>
            </motion.div>
          </Link>

          {/* Compliance Rate */}
          <motion.div
            whileHover={{ translateY: -2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 group hover:shadow-md transition-all border border-[#E3DFD5] dark:border-slate-700 flex items-center gap-4"
          >
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#8B9BB4] font-medium">Cumplimiento</p>
              <p className="text-2xl font-bold text-[#0B1C3D] dark:text-gray-100 leading-tight">{completionRate}%</p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-[#E3DFD5] overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </motion.div>

          {/* High Risk Alert */}
          <motion.div
            whileHover={{ translateY: -2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 group hover:shadow-md transition-all border border-[#E3DFD5] dark:border-slate-700 flex items-center gap-4"
          >
            <div className={`p-2 rounded-lg shrink-0 ${stats.highRiskCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <AlertTriangle className={`w-5 h-5 ${stats.highRiskCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#8B9BB4]'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#8B9BB4] font-medium">Riesgo Alto</p>
              <p className={`text-2xl font-bold leading-tight ${stats.highRiskCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#0B1C3D] dark:text-gray-100'}`}>{stats.highRiskCount}</p>
              <p className="text-xs text-[#8B9BB4] truncate">Requieren revisión</p>
            </div>
          </motion.div>
        </motion.div>

        {/* CLASSIFICATION + RECENT SYSTEMS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Risk Classification (2/3) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Clasificación de Riesgos
                </h2>
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-0">
                  {stats.totalSystems} sistemas
                </Badge>
              </div>

              <RiskDistributionChart
                data={{
                  prohibited: stats.prohibitedCount,
                  high_risk: stats.highRiskCount,
                  limited_risk: stats.limitedRiskCount,
                  minimal_risk: stats.minimalRiskCount,
                  unclassified: stats.unclassifiedCount,
                }}
                selectedRisk={selectedRisk}
                onRiskFilterChange={setSelectedRisk}
              />
            </div>
          </motion.div>

          {/* RIGHT: Recent Systems (1/3) */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Últimas Novedades</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-500 mb-4">Últimos sistemas cargados</p>
              
              <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin mb-4">
                {stats.recentSystems.length > 0 ? (
                  stats.recentSystems.slice(0, 6).map((system, idx) => (
                    <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-gray-100 dark:border-slate-600 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {system.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                              {new Date(system.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0 bg-gray-50 border-gray-200">
                            {system.ai_act_level === 'prohibited' && '🔴'}
                            {system.ai_act_level === 'high_risk' && '🟠'}
                            {system.ai_act_level === 'limited_risk' && '🟡'}
                            {system.ai_act_level === 'minimal_risk' && '🟢'}
                            {!system.ai_act_level && '⚪'}
                          </Badge>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Plus className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2 opacity-50" />
                    <p className="text-sm text-gray-600 dark:text-gray-500">No hay sistemas registrados</p>
                  </div>
                )}
              </div>


            </div>
          </motion.div>
        </div>

        {/* OBLIGATIONS + RISK PROGRESS - SIDE BY SIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Pending Obligations */}
          <motion.div variants={itemVariants}>
            <PendingObligationsWidget />
          </motion.div>

          {/* RIGHT: Risk Progress */}
          <motion.div variants={itemVariants}>
            <RiskAnalysisStatusCard />
          </motion.div>
        </div>

        {/* Compliance Tip Card */}
        <motion.div variants={itemVariants}>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">💡 Consejo de Cumplimiento</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mantén todos tus sistemas clasificados y completa las obligaciones antes de desplegar en producción. CumplIA te alertará automáticamente sobre cambios en la normativa.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}