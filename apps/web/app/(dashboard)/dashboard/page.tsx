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
  LayoutDashboard,
  BookOpen,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Info,
  Zap,
  Brain,
  Bot,
  Sparkles as SparklesIcon,
  Ban,
  MinusCircle,
  Settings2,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskSummaryCard } from '@/components/risk-summary-card';
import { UpcomingActionsWidget } from '@/components/upcoming-actions-widget';

interface DashboardStats {
  totalSystems: number;
  highRiskCount: number;
  limitedRiskCount: number;
  minimalRiskCount: number;
  prohibitedCount: number;
  unclassifiedCount: number;
  gpaiModelCount: number;
  gpaiSystemCount: number;
  gpaiSrCount: number;
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

const RISK_LEVELS = [
  {
    key: 'prohibited',
    name: 'Prohibido',
    description: 'Sistemas que manipulan conscientemente, explotan vulnerabilidades o realizan evaluación social',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: Ban,
    obligations: 2,
    examples: 'Sistemas de puntuación social, manipulación subliminal',
  },
  {
    key: 'high_risk',
    name: 'Alto Riesgo',
    description: 'Sistemas que afectan seguridad, derechos fundamentales o áreas críticas',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Shield,
    obligations: 8,
    examples: 'Salud, educación, seguridad, justicia, acceso a servicios',
  },
  {
    key: 'limited_risk',
    name: 'Riesgo Limitado',
    description: 'Sistemas con obligaciones de transparencia según Art. 50',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Info,
    obligations: 4,
    examples: 'Chatbots, generación de contenido, reconocimiento emocional',
  },
  {
    key: 'minimal_risk',
    name: 'Riesgo Mínimo',
    description: 'Sistemas con cumplimiento voluntario mediante códigos de conducta',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
    obligations: 2,
    examples: 'Recomendadores, filtros de spam, videojuegos',
  },
  {
    key: 'gpai_model',
    name: 'GPAI Model',
    description: 'Modelo de IA de Propósito General',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Brain,
    obligations: 3,
    examples: 'GPT-4, Llama, Gemini base',
  },
  {
    key: 'gpai_system',
    name: 'GPAI System',
    description: 'Sistema de IA de Propósito General',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: Bot,
    obligations: 3,
    examples: 'ChatGPT, Copilot Studio',
  },
  {
    key: 'gpai_sr',
    name: 'GPAI-SR',
    description: 'Modelo GPAI con Riesgo Sistémico',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: SparklesIcon,
    obligations: 7,
    examples: 'Modelos >10²⁵ FLOP con evaluación de riesgos sistémicos',
  },
  {
    key: 'unclassified',
    name: 'Por Clasificar',
    description: 'Sistemas pendientes de clasificación según el AI Act',
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Clock,
    obligations: 1,
    examples: 'Sistemas nuevos o en revisión',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSystems: 0,
    highRiskCount: 0,
    limitedRiskCount: 0,
    minimalRiskCount: 0,
    prohibitedCount: 0,
    unclassifiedCount: 0,
    gpaiModelCount: 0,
    gpaiSystemCount: 0,
    gpaiSrCount: 0,
    completedObligations: 0,
    totalApplicableObligations: 0,
    recentSystems: [],
  });
  const [loading, setLoading] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get user's organization for B2B filtering
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const organizationId = membership?.organization_id;

      // Build filter: show use cases where user_id matches OR organization_id matches
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
      const gpaiModelCount = systems?.filter(s => s.ai_act_level === 'gpai_model').length || 0;
      const gpaiSystemCount = systems?.filter(s => s.ai_act_level === 'gpai_system').length || 0;
      const gpaiSrCount = systems?.filter(s => s.ai_act_level === 'gpai_sr').length || 0;

      // Fetch all obligations for the organization
      const { data: obligations } = await supabase
        .from('use_case_obligations')
        .select('is_completed, use_case_id')
        .in('use_case_id', systems?.map(s => s.id) || []);

      const completedObligations = obligations?.filter(o => o.is_completed).length || 0;

      // Calculate total applicable obligations based on each system's risk level
      let totalApplicableObligations = 0;
      systems?.forEach(system => {
        totalApplicableObligations += getObligationsCountForLevel(system.ai_act_level);
      });

      // Fetch recent systems with obligation counts (excluding deleted)
      // Apply same user_id OR organization_id filter
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
        gpaiModelCount,
        gpaiSystemCount,
        gpaiSrCount,
        completedObligations,
        totalApplicableObligations,
        recentSystems,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      gpai_model: 3,
      gpai_system: 3,
      gpai_sr: 7,
    };
    return counts[level] || 1;
  }

  function getRiskLevelInfo(level: string) {
    return RISK_LEVELS.find(r => r.key === level) || RISK_LEVELS.find(r => r.key === 'unclassified')!;
  }

  const completionRate = stats.totalApplicableObligations > 0 
    ? Math.round((stats.completedObligations / stats.totalApplicableObligations) * 100) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HEADER - Minimal, focused */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Visión general de tu cumplimiento del AI Act</p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Sistema IA
          </Button>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PRIMARY GRID - Only 3 main elements (calm design) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Upcoming Actions + Resources */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Actions Widget - NEW, max 3 items */}
          <UpcomingActionsWidget 
            actions={stats.recentSystems} 
            isLoading={loading}
          />

          {/* Guía AI Act */}
          <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}>
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <Link href="/dashboard/guia">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Guía AI Act</h3>
                      <p className="text-sm text-gray-500">
                        Niveles de riesgo, clasificación de sistemas y obligaciones regulatorias
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>

          {/* Templates */}
          <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}>
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <Link href="/dashboard/admin">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Settings2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                      <p className="text-sm text-gray-500">
                        Plantillas de riesgos predefinidas y personalizables para tu evaluación de IA
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT: Risk Summary Card (NEW, simplified to 1 KPI) */}
        <div className="space-y-6">
          <RiskSummaryCard
            completionRate={completionRate}
            completedObligations={stats.completedObligations}
            totalApplicableObligations={stats.totalApplicableObligations}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ADVANCED SECTION - Collapsible, hidden by default */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: advancedExpanded ? 1 : 0,
          height: advancedExpanded ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {advancedExpanded && (
          <div className="space-y-6 pt-4">
            {/* All 6 Risk Level Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Estadísticas Detalladas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Sistemas Totales */}
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600">Sistemas Totales</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalSystems}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prohibido */}
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-red-600">Prohibido</p>
                        <p className="text-2xl font-bold text-red-900">{stats.prohibitedCount}</p>
                      </div>
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Ban className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alto Riesgo */}
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-600">Alto Riesgo</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.highRiskCount}</p>
                      </div>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Riesgo Limitado */}
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-yellow-600">Riesgo Limitado</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.limitedRiskCount}</p>
                      </div>
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Info className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Riesgo Mínimo */}
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-600">Riesgo Mínimo</p>
                        <p className="text-2xl font-bold text-green-900">{stats.minimalRiskCount}</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MinusCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Por Clasificar */}
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Por Clasificar</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.unclassifiedCount}</p>
                      </div>
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Advanced Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="gap-2"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              advancedExpanded ? 'rotate-180' : ''
            }`}
          />
          {advancedExpanded ? 'Ocultar' : 'Mostrar'} Estadísticas Detalladas
        </Button>
      </div>
    </div>
  );
}
