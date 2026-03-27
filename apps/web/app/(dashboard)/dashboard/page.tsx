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
      className="container mx-auto p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-2">Cumplimiento del AI Act en tiempo real</p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Sistema
          </Button>
        </Link>
      </motion.div>

      {/* PRIMARY METRICS - Two main blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCK 1: Total Systems & Risk Classification */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all cursor-pointer h-full" onClick={() => window.location.href = '/dashboard/inventory'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Inventario de Sistemas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-blue-600">{stats.totalSystems}</span>
                  <span className="text-sm text-gray-600">sistemas totales</span>
                </div>
              </div>

              {/* Risk Classification Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/inventory?risk=prohibited" onClick={(e) => e.stopPropagation()}>
                  <div className="p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{stats.prohibitedCount}</div>
                    <div className="text-xs text-red-700">Prohibido</div>
                  </div>
                </Link>
                <Link href="/dashboard/inventory?risk=high_risk" onClick={(e) => e.stopPropagation()}>
                  <div className="p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{stats.highRiskCount}</div>
                    <div className="text-xs text-orange-700">Alto Riesgo</div>
                  </div>
                </Link>
                <Link href="/dashboard/inventory?risk=limited_risk" onClick={(e) => e.stopPropagation()}>
                  <div className="p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{stats.limitedRiskCount}</div>
                    <div className="text-xs text-yellow-700">Riesgo Limitado</div>
                  </div>
                </Link>
                <Link href="/dashboard/inventory?risk=minimal_risk" onClick={(e) => e.stopPropagation()}>
                  <div className="p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{stats.minimalRiskCount}</div>
                    <div className="text-xs text-green-700">Riesgo Mínimo</div>
                  </div>
                </Link>
                <Link href="/dashboard/inventory?risk=unclassified" onClick={(e) => e.stopPropagation()} className="col-span-2">
                  <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">{stats.unclassifiedCount}</div>
                    <div className="text-xs text-gray-700">Por Clasificar</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* BLOCK 2: Obligations Status */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-green-200 dark:border-green-800 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Cumplimiento de Obligaciones
              </CardTitle>
              <CardDescription>Progreso general de tu organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Progress */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-green-600">{completionRate}%</span>
                  <span className="text-sm text-gray-600">completado</span>
                </div>
                <Progress value={completionRate} className="h-3" />
                <p className="text-xs text-gray-600 mt-2">
                  {stats.completedObligations} de {stats.totalApplicableObligations} obligaciones finalizadas
                </p>
              </div>

              {/* Systems needing attention */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Sistemas con obligaciones pendientes</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.recentSystems.filter(s => s.completed_obligations < s.total_obligations).length > 0 ? (
                    stats.recentSystems
                      .filter(s => s.completed_obligations < s.total_obligations)
                      .slice(0, 5)
                      .map(system => (
                        <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                          <div className="p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                            <div className="font-medium text-gray-900 truncate">{system.name}</div>
                            <div className="text-xs text-gray-600">
                              {system.completed_obligations}/{system.total_obligations} obligaciones
                            </div>
                          </div>
                        </Link>
                      ))
                  ) : (
                    <p className="text-sm text-gray-600">¡Excelente! Todas las obligaciones están completadas.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>



      {/* TWO-COLUMN LAYOUT - Main content + Upcoming Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Upcoming Actions (2/3 width) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <UpcomingActionsWidget 
            actions={stats.recentSystems}
            isLoading={loading}
          />
        </motion.div>

        {/* RIGHT: Quick Links (1/3 width) - Reduced prominence */}
        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/guia">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Guía AI Act
                </Button>
              </Link>
              <Link href="/dashboard/admin">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/inventory">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ver Inventario
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Legend/Info */}
      <motion.div variants={itemVariants}>
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Consejo:</strong> Mantén todos tus sistemas clasificados y cumple con las obligaciones antes de desplegar en producción.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
