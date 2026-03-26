'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Clock, Plus, ArrowRight, ChevronRight, FileCheck } from 'lucide-react';

interface UpcomingAction {
  id: string;
  name: string;
  ai_act_level: string;
  created_at: string;
  completed_obligations: number;
  total_obligations: number;
}

interface UpcomingActionsWidgetProps {
  actions: UpcomingAction[];
  isLoading?: boolean;
}

interface RiskLevelInfo {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RISK_LEVEL_COLORS: Record<string, RiskLevelInfo> = {
  prohibited: {
    name: 'Prohibido',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    icon: () => null,
  },
  high_risk: {
    name: 'Alto Riesgo',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    icon: () => null,
  },
  limited_risk: {
    name: 'Riesgo Limitado',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    icon: () => null,
  },
  minimal_risk: {
    name: 'Riesgo Mínimo',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    icon: () => null,
  },
  gpai_model: {
    name: 'GPAI Model',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    icon: () => null,
  },
  gpai_system: {
    name: 'GPAI System',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    icon: () => null,
  },
  gpai_sr: {
    name: 'GPAI-SR',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    icon: () => null,
  },
  unclassified: {
    name: 'Por Clasificar',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    icon: () => null,
  },
};

/**
 * Upcoming Actions Widget
 * Shows max 3 items - progressive disclosure pattern
 * Focused on what needs attention next
 */
export function UpcomingActionsWidget({
  actions,
  isLoading = false,
}: UpcomingActionsWidgetProps) {
  // Show only first 3 items (max)
  const displayedActions = actions.slice(0, 3);
  const hasMoreActions = actions.length > 3;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Próximas Acciones
          </CardTitle>
          <CardDescription>Sistemas que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayedActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Próximas Acciones
          </CardTitle>
          <CardDescription>Sistemas que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">No hay sistemas que requieran atención</p>
            <Link href="/dashboard/inventory/new">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Crear nuevo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Próximas Acciones
        </CardTitle>
        <CardDescription>
          {displayedActions.length} de {actions.length} sistema(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedActions.map((action) => {
            const riskInfo = RISK_LEVEL_COLORS[action.ai_act_level] || RISK_LEVEL_COLORS.unclassified;
            const progress =
              action.total_obligations > 0
                ? Math.round((action.completed_obligations / action.total_obligations) * 100)
                : 0;
            const isComplete = progress === 100;

            return (
              <Link key={action.id} href={`/dashboard/inventory/${action.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer group">
                  {/* Risk Badge */}
                  <div className={`px-2 py-1 rounded text-xs font-medium self-start sm:self-auto whitespace-nowrap ${riskInfo.bgColor} ${riskInfo.textColor}`}>
                    {riskInfo.name}
                  </div>

                  {/* System Name and Date */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {action.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(action.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 min-w-[80px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">
                        {progress}%
                      </span>
                      {isComplete && (
                        <FileCheck className="w-4 h-4 text-green-500" />
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <Progress
                      value={progress}
                      indicatorVariant={isComplete ? 'success' : progress >= 50 ? 'gradient' : 'blue'}
                      className="w-16 sm:w-20 h-2"
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Show More Link */}
          {hasMoreActions && (
            <Link href="/dashboard/inventory">
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Ver los {actions.length - 3} restante(s)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
