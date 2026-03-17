// components/risks/risk-matrix.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AISystemRisk, RiskLevel } from '@/types/risk-management';

interface RiskMatrixProps {
  risks: AISystemRisk[];
}

const PROBABILITY_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
const IMPACT_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
};

export function RiskMatrix({ risks }: RiskMatrixProps) {
  // Filter only assessed risks (those with probability and impact)
  const assessedRisks = risks.filter(r => r.probability && r.impact);

  // Build matrix
  const matrix: Record<string, Record<string, AISystemRisk[]>> = {};
  PROBABILITY_LEVELS.forEach(prob => {
    matrix[prob] = {};
    IMPACT_LEVELS.forEach(imp => {
      matrix[prob][imp] = [];
    });
  });

  // Populate matrix
  assessedRisks.forEach(risk => {
    if (risk.probability && risk.impact) {
      matrix[risk.probability][risk.impact].push(risk);
    }
  });

  const getCellColor = (probability: RiskLevel, impact: RiskLevel): string => {
    const levels: Record<RiskLevel, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    
    const score = levels[probability] * levels[impact];
    
    // Color coding based on risk score
    if (score >= 12) return 'bg-red-600 text-white'; // Critical (16)
    if (score >= 9) return 'bg-orange-500 text-white'; // High (9-12)
    if (score >= 6) return 'bg-yellow-400 text-black'; // Medium (6-8)
    if (score >= 4) return 'bg-yellow-200 text-black'; // Low-Medium (4)
    return 'bg-green-200 text-green-900'; // Low (1-3)
  };

  const getRiskCount = (probability: RiskLevel, impact: RiskLevel): number => {
    return matrix[probability][impact].length;
  };

  const getCriticalityCount = (criticality: string): number => {
    return assessedRisks.filter(r => r.catalog_risk?.criticality === criticality).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Matriz de Riesgos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Header */}
              <div className="grid grid-cols-5 gap-1 mb-1">
                <div className="text-xs text-muted-foreground text-center">
                  Probabilidad ↓ / Impacto →
                </div>
                {IMPACT_LEVELS.map(impact => (
                  <div 
                    key={impact} 
                    className="text-xs font-medium text-center py-1"
                  >
                    {LEVEL_LABELS[impact]}
                  </div>
                ))}
              </div>

              {/* Matrix Rows */}
              <TooltipProvider>
                {PROBABILITY_LEVELS.map(probability => (
                  <div key={probability} className="grid grid-cols-5 gap-1 mb-1">
                    {/* Row Label */}
                    <div className="text-xs font-medium flex items-center justify-center py-2">
                      {LEVEL_LABELS[probability]}
                    </div>
                    
                    {/* Cells */}
                    {IMPACT_LEVELS.map(impact => {
                      const cellRisks = matrix[probability][impact];
                      const count = cellRisks.length;
                      
                      return (
                        <Tooltip key={`${probability}-${impact}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`
                                h-16 rounded-md flex flex-col items-center justify-center cursor-pointer
                                transition-all hover:ring-2 hover:ring-primary
                                ${getCellColor(probability, impact)}
                                ${count === 0 ? 'opacity-30' : ''}
                              `}
                            >
                              <span className="text-lg font-bold">{count}</span>
                              {count > 0 && (
                                <span className="text-xs opacity-80">
                                  riesgo{count > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-medium">
                                Probabilidad: {LEVEL_LABELS[probability]} × 
                                Impacto: {LEVEL_LABELS[impact]}
                              </p>
                              {cellRisks.length > 0 ? (
                                <ul className="text-xs space-y-1">
                                  {cellRisks.slice(0, 5).map(risk => (
                                    <li key={risk.id} className="truncate">
                                      #{risk.catalog_risk?.risk_number} {risk.catalog_risk?.name}
                                    </li>
                                  ))}
                                  {cellRisks.length > 5 && (
                                    <li className="text-muted-foreground">
                                      ...y {cellRisks.length - 5} más
                                    </li>
                                  )}
                                </ul>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Sin riesgos en esta categoría
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 border"></div>
              <span>Bajo (1-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200 border"></div>
              <span>Medio-Bajo (4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400 border"></div>
              <span>Medio (6-8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500 border"></div>
              <span>Alto (9-12)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600 border"></div>
              <span>Crítico (16)</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {getCriticalityCount('critical')}
              </p>
              <p className="text-xs text-muted-foreground">Riesgos Críticos</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {getCriticalityCount('high')}
              </p>
              <p className="text-xs text-muted-foreground">Riesgos Altos</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {getCriticalityCount('medium')}
              </p>
              <p className="text-xs text-muted-foreground">Riesgos Medios</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {getCriticalityCount('low')}
              </p>
              <p className="text-xs text-muted-foreground">Riesgos Bajos</p>
            </div>
          </div>

          {/* Unassessed Risks */}
          {risks.length > assessedRisks.length && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{risks.length - assessedRisks.length}</strong> riesgos pendientes de evaluación 
                (sin probabilidad o impacto asignados)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
