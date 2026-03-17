'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Settings2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch all systems for the user (excluding deleted)
      const { data: systems } = await supabase
        .from('use_cases')
        .select('ai_act_level, id')
        .eq('user_id', session.user.id)
        .is('deleted_at', null);

      const highRiskCount = systems?.filter(s => s.ai_act_level === 'high_risk').length || 0;
      const limitedRiskCount = systems?.filter(s => s.ai_act_level === 'limited_risk').length || 0;
      const minimalRiskCount = systems?.filter(s => s.ai_act_level === 'minimal_risk').length || 0;
      const prohibitedCount = systems?.filter(s => s.ai_act_level === 'prohibited').length || 0;
      const unclassifiedCount = systems?.filter(s => !s.ai_act_level || s.ai_act_level === 'unclassified').length || 0;
      const gpaiModelCount = systems?.filter(s => s.ai_act_level === 'gpai_model').length || 0;
      const gpaiSystemCount = systems?.filter(s => s.ai_act_level === 'gpai_system').length || 0;
      const gpaiSrCount = systems?.filter(s => s.ai_act_level === 'gpai_sr').length || 0;

      // Fetch all obligations with their completion status
      const { data: obligations } = await supabase
        .from('use_case_obligations')
        .select('is_completed, use_case_id')
        .eq('user_id', session.user.id);

      const completedObligations = obligations?.filter(o => o.is_completed).length || 0;

      // Calculate total applicable obligations based on each system's risk level
      let totalApplicableObligations = 0;
      systems?.forEach(system => {
        totalApplicableObligations += getObligationsCountForLevel(system.ai_act_level);
      });

      // Fetch recent systems with obligation counts (excluding deleted)
      const { data: recentSystemsData } = await supabase
        .from('use_cases')
        .select('id, name, ai_act_level, created_at')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentSystems: RecentSystem[] = await Promise.all(
        (recentSystemsData || []).map(async (system) => {
          const { data: sysObligations } = await supabase
            .from('use_case_obligations')
            .select('*')
            .eq('use_case_id', system.id)
            .eq('user_id', session.user.id);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Visión general de tu cumplimiento del AI Act</p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Sistema IA
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Sistemas Totales</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalSystems}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-full">
                <BarChart3 className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">Prohibido</p>
                <p className="text-2xl font-bold text-red-900">{stats.prohibitedCount}</p>
              </div>
              <div className="p-2 bg-red-200 rounded-full">
                <Ban className="w-5 h-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Alto Riesgo</p>
                <p className="text-2xl font-bold text-orange-900">{stats.highRiskCount}</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-full">
                <AlertTriangle className="w-5 h-5 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600">Riesgo Limitado</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.limitedRiskCount}</p>
              </div>
              <div className="p-2 bg-yellow-200 rounded-full">
                <Info className="w-5 h-5 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Riesgo Mínimo</p>
                <p className="text-2xl font-bold text-green-900">{stats.minimalRiskCount}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-full">
                <MinusCircle className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Por Clasificar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unclassifiedCount}</p>
              </div>
              <div className="p-2 bg-gray-200 rounded-full">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Systems */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Sistemas Recientes
                  </CardTitle>
                  <CardDescription>Tus últimos sistemas de IA añadidos</CardDescription>
                </div>
                <Link href="/dashboard/inventory">
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentSystems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No tienes sistemas registrados</p>
                  <Link href="/dashboard/inventory/new">
                    <Button variant="outline" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir primer sistema
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSystems.map((system) => {
                    const riskInfo = getRiskLevelInfo(system.ai_act_level);
                    const Icon = riskInfo.icon;
                    const progress = system.total_obligations > 0 
                      ? Math.round((system.completed_obligations / system.total_obligations) * 100)
                      : 0;

                    return (
                      <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer group">
                          <div className={`p-2 rounded-lg ${riskInfo.bgColor} self-start sm:self-auto`}>
                            <Icon className={`w-5 h-5 ${riskInfo.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {system.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className={`${riskInfo.bgColor} ${riskInfo.textColor} border-0 text-xs`}>
                                {riskInfo.name}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(system.created_at).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                {system.completed_obligations}/{system.total_obligations}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div className="w-20 sm:w-24 h-1.5 bg-gray-200 rounded-full mt-0 sm:mt-1">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guía AI Act */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/guia">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Guía AI Act</h3>
                    <p className="text-sm text-gray-500">
                      Niveles de riesgo, clasificación de sistemas y obligaciones regulatorias
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Administración */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/admin">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Administración</h3>
                    <p className="text-sm text-gray-500">
                      Gestiona plantillas de riesgos, campos personalizados y configuraciones
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" />
                Estado de Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold">{completionRate}%</div>
                <p className="text-blue-100 mt-2">Progreso general</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Obligaciones cumplidas</span>
                  <span className="font-semibold">{stats.completedObligations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Obligaciones aplicables</span>
                  <span className="font-semibold">{stats.totalApplicableObligations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Obligaciones pendientes</span>
                  <span className="font-semibold">{stats.totalApplicableObligations - stats.completedObligations}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-500">
                <Link href="/dashboard/inventory">
                  <Button variant="secondary" className="w-full">
                    Ver inventario
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
