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
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight,
  BarChart3,
  TrendingUp,
  Ban,
  Info,
  Brain,
  Bot,
  Zap,
  Sparkles,
  Flame,
  Target,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpcomingActionsWidget } from '@/components/upcoming-actions-widget';

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

const RISK_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  prohibited: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: Ban },
  high_risk: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
  limited_risk: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Info },
  minimal_risk: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
};

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
  const supabase = createClient();
  const { toast } = useToast();

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
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        variant: 'destructive',
      });
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
      className="min-h-screen pt-20 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 space-y-8 max-w-7xl">
        {/* Header with enhanced typography */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8"
          variants={itemVariants}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Cumplimiento del AI Act en tiempo real • Última actualización: hace 2 min</p>
          </div>
          <Link href="/dashboard/inventory/new">
            <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all text-lg py-6">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Sistema
            </Button>
          </Link>
        </motion.div>

        {/* THREE METRIC CARDS - TOP ROW */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Total Systems */}
          <Link href="/dashboard/inventory">
            <motion.div
              whileHover={{ translateY: -4 }}
              className="glass rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all border border-white/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total de Sistemas</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalSystems}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">+2 esta semana</p>
            </motion.div>
          </Link>

          {/* Compliance Rate */}
          <motion.div
            whileHover={{ translateY: -4 }}
            className="glass rounded-2xl p-6 group hover:shadow-xl transition-all border border-white/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <Flame className="w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Cumplimiento</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              <span className="text-sm text-green-600 dark:text-green-400">↑ 12%</span>
            </div>
            <Progress value={completionRate} className="mt-3 h-2" />
          </motion.div>

          {/* High Risk Alert */}
          <motion.div
            whileHover={{ translateY: -4 }}
            className="glass rounded-2xl p-6 group hover:shadow-xl transition-all border border-white/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 group-hover:from-red-500/30 group-hover:to-rose-500/30 transition-all">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <Eye className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Riesgo Alto</h3>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.highRiskCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Requieren atención</p>
          </motion.div>
        </motion.div>

        {/* MAIN CONTENT - Risk Classification + Recent Systems */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Risk Breakdown (2/3 width) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="glass rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Clasificación de Riesgo
                </h2>
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  5 categorías
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Prohibited */}
                <Link href="/dashboard/inventory?risk=prohibited">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <Ban className="w-6 h-6 text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.prohibitedCount}</p>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-1">Prohibido</p>
                  </motion.div>
                </Link>

                {/* High Risk */}
                <Link href="/dashboard/inventory?risk=high_risk">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border border-orange-200 dark:border-orange-800 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.highRiskCount}</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 font-medium mt-1">Alto Riesgo</p>
                  </motion.div>
                </Link>

                {/* Limited Risk */}
                <Link href="/dashboard/inventory?risk=limited_risk">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.limitedRiskCount}</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mt-1">Limitado</p>
                  </motion.div>
                </Link>

                {/* Minimal Risk */}
                <Link href="/dashboard/inventory?risk=minimal_risk">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.minimalRiskCount}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium mt-1">Mínimo</p>
                  </motion.div>
                </Link>

                {/* Unclassified */}
                <Link href="/dashboard/inventory?risk=unclassified">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <Shield className="w-6 h-6 text-slate-600 dark:text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">{stats.unclassifiedCount}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">Por Clasificar</p>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Recent Systems (1/3 width) */}
          <motion.div variants={itemVariants}>
            <div className="glass rounded-2xl p-6 border border-white/20 h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimas Novedades</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Últimos sistemas cargados</p>
              
              <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin">
                {stats.recentSystems.length > 0 ? (
                  stats.recentSystems.slice(0, 6).map((system, idx) => (
                    <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {system.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(system.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">No hay sistemas registrados</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM: Upcoming Actions Widget */}
        <motion.div variants={itemVariants}>
          <UpcomingActionsWidget 
            actions={stats.recentSystems}
            isLoading={loading}
          />
        </motion.div>

        {/* Tip Card */}
        <motion.div variants={itemVariants}>
          <div className="glass rounded-2xl p-6 border border-white/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/10 dark:to-cyan-600/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">💡 Consejo de Cumplimiento</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mantén todos tus sistemas clasificados y completa las obligaciones antes de desplegar en producción. CumplIA te alertará sobre cambios en la normativa.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
