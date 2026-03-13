'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import RiskBadge from '@/components/risk-badge';
import { supabase } from '@/lib/supabase';

// Define UseCase interface locally
interface UseCase {
  id: string;
  name: string;
  description: string | null;
  sector: string;
  status: string;
  ai_act_level: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Mapear valores del API al formato del componente RiskBadge
type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';

function mapApiRiskLevel(apiLevel: string): RiskLevel {
  const mapping: Record<string, RiskLevel> = {
    'prohibited': 'prohibited',
    'high_risk': 'high',
    'limited_risk': 'limited',
    'minimal_risk': 'minimal',
    'unclassified': 'unclassified',
  };
  return mapping[apiLevel] || 'unclassified';
}

interface DashboardStats {
  total: number;
  classified: number;
  pending: number;
  byRiskLevel: {
    prohibited: number;
    high: number;
    limited: number;
    minimal: number;
    unclassified: number;
  };
  recentUseCases: UseCase[];
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    classified: 0,
    pending: 0,
    byRiskLevel: {
      prohibited: 0,
      high: 0,
      limited: 0,
      minimal: 0,
      unclassified: 0,
    },
    recentUseCases: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Fetch use cases directly from Supabase
      const { data: useCases, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const useCasesList = useCases || [];
      
      const classified = useCasesList.filter(uc => 
        uc.status === 'classified' || uc.status === 'compliant'
      ).length;
      
      const byRiskLevel = {
        prohibited: useCasesList.filter(uc => uc.ai_act_level === 'prohibited').length,
        high: useCasesList.filter(uc => uc.ai_act_level === 'high_risk').length,
        limited: useCasesList.filter(uc => uc.ai_act_level === 'limited_risk').length,
        minimal: useCasesList.filter(uc => uc.ai_act_level === 'minimal_risk').length,
        unclassified: useCasesList.filter(uc => uc.ai_act_level === 'unclassified').length,
      };

      setStats({
        total: useCasesList.length,
        classified,
        pending: useCasesList.length - classified,
        byRiskLevel,
        recentUseCases: useCasesList.slice(0, 5),
      });
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getComplianceRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.classified / stats.total) * 100);
  };

  const getRiskDistribution = () => {
    const total = stats.total || 1;
    return [
      { label: 'Prohibido', value: stats.byRiskLevel.prohibited, color: 'bg-red-500', key: 'prohibited' },
      { label: 'Alto riesgo', value: stats.byRiskLevel.high, color: 'bg-orange-500', key: 'high' },
      { label: 'Riesgo limitado', value: stats.byRiskLevel.limited, color: 'bg-yellow-500', key: 'limited' },
      { label: 'Riesgo mínimo', value: stats.byRiskLevel.minimal, color: 'bg-green-500', key: 'minimal' },
      { label: 'Sin clasificar', value: stats.byRiskLevel.unclassified, color: 'bg-gray-400', key: 'unclassified' },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CumplIA</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="sm">
                <ClipboardList className="w-4 h-4 mr-2" />
                Inventario
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
          <p className="text-gray-600 mt-1">
            Gestiona el cumplimiento del AI Act para tus sistemas de IA
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/inventory/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nuevo Caso de Uso</h3>
                    <p className="text-sm text-gray-500">Registrar sistema de IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ver Inventario</h3>
                    <p className="text-sm text-gray-500">{stats.total} casos registrados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Estado General</h3>
                  <p className="text-sm text-gray-500">
                    {getComplianceRate()}% clasificado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Casos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? '-' : stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clasificados</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {loading ? '-' : stats.classified}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">
                    {loading ? '-' : stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Alto Riesgo</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {loading ? '-' : stats.byRiskLevel.high + stats.byRiskLevel.prohibited}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Distribución por Riesgo
              </CardTitle>
              <CardDescription>
                Clasificación según EU AI Act
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.total === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay casos registrados</p>
                  <Link href="/dashboard/inventory/new">
                    <Button variant="link" className="mt-2">
                      Crear primer caso
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRiskDistribution().map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ 
                            width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Progress */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progreso de Cumplimiento
              </CardTitle>
              <CardDescription>
                Porcentaje de casos clasificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.total === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">
                      {getComplianceRate()}%
                    </div>
                    <p className="text-gray-500 mt-2">
                      {stats.classified} de {stats.total} casos clasificados
                    </p>
                  </div>
                  <Progress value={getComplianceRate()} className="h-3" />
                  <div className="text-sm text-gray-600">
                    {stats.pending > 0 ? (
                      <p>
                        <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
                        Tienes {stats.pending} caso{stats.pending !== 1 ? 's' : ''} pendiente{stats.pending !== 1 ? 's' : ''} de clasificar
                      </p>
                    ) : stats.total > 0 ? (
                      <p className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        ¡Todos los casos están clasificados!
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Use Cases */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Casos Recientes
                </CardTitle>
                <CardDescription>
                  Últimos registrados
                </CardDescription>
              </div>
              <Link href="/dashboard/inventory">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentUseCases.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay casos registrados aún</p>
                  <Link href="/dashboard/inventory/new">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-1" />
                      Crear caso
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentUseCases.map((useCase) => (
                    <Link 
                      key={useCase.id} 
                      href={`/dashboard/inventory/${useCase.id}/classify`}
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {useCase.name}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {useCase.sector}
                          </p>
                        </div>
                        <RiskBadge level={mapApiRiskLevel(useCase.ai_act_level)} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Empty State CTA */}
        {stats.total === 0 && !loading && (
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Comienza tu evaluación de cumplimiento
              </h3>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                Registra tus primeros casos de uso de IA y obtén una clasificación
                automatizada según el Reglamento Europeo de IA.
              </p>
              <Link href="/dashboard/inventory/new">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Plus className="w-5 h-5 mr-2" />
                  Crear mi primer caso de uso
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
