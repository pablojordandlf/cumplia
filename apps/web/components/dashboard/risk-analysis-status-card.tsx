'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RiskAnalysisStats {
  total_high_risk: number;
  completed_high_risk: number;
  total_limited_risk: number;
  completed_limited_risk: number;
  total_minimal_risk: number;
  completed_minimal_risk: number;
}

export function RiskAnalysisStatusCard() {
  const [stats, setStats] = useState<RiskAnalysisStats>({
    total_high_risk: 0,
    completed_high_risk: 0,
    total_limited_risk: 0,
    completed_limited_risk: 0,
    total_minimal_risk: 0,
    completed_minimal_risk: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskAnalysisStats();
  }, []);

  const fetchRiskAnalysisStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/dashboard/risk-analysis-stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch risk analysis stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching risk analysis stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highRiskPercentage = stats.total_high_risk > 0 
    ? Math.round((stats.completed_high_risk / stats.total_high_risk) * 100)
    : 0;

  const limitedRiskPercentage = stats.total_limited_risk > 0
    ? Math.round((stats.completed_limited_risk / stats.total_limited_risk) * 100)
    : 0;

  const minimalRiskPercentage = stats.total_minimal_risk > 0
    ? Math.round((stats.completed_minimal_risk / stats.total_minimal_risk) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Análisis de Riesgos</CardTitle>
            <CardDescription>
              Estado del análisis de riesgos por categoría
            </CardDescription>
          </div>
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">
              Ver Inventario
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* High Risk Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Sistemas de Riesgo Alto
              </h3>
              <Badge variant="destructive" className="bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100">
                Obligatorio
              </Badge>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {stats.completed_high_risk} de {stats.total_high_risk}
            </span>
          </div>

          {stats.total_high_risk > 0 && (
            <>
              <Alert className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                  Es obligatorio completar el análisis de riesgos para todos los sistemas de Riesgo Alto según el AI Act.
                </AlertDescription>
              </Alert>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 dark:bg-red-400 h-2 rounded-full transition-all"
                  style={{ width: `${highRiskPercentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {highRiskPercentage}% completado
              </p>
            </>
          )}

          {stats.total_high_risk === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No tienes sistemas de Riesgo Alto
            </p>
          )}
        </div>

        {/* Limited Risk Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Sistemas de Riesgo Limitado
              </h3>
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100">
                Opcional
              </Badge>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {stats.completed_limited_risk} de {stats.total_limited_risk}
            </span>
          </div>

          {stats.total_limited_risk > 0 && (
            <>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${limitedRiskPercentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {limitedRiskPercentage}% completado
              </p>
            </>
          )}

          {stats.total_limited_risk === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No tienes sistemas de Riesgo Limitado
            </p>
          )}
        </div>

        {/* Minimal Risk Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Sistemas de Riesgo Mínimo
              </h3>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100">
                Opcional
              </Badge>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {stats.completed_minimal_risk} de {stats.total_minimal_risk}
            </span>
          </div>

          {stats.total_minimal_risk > 0 && (
            <>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${minimalRiskPercentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {minimalRiskPercentage}% completado
              </p>
            </>
          )}

          {stats.total_minimal_risk === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No tienes sistemas de Riesgo Mínimo
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total: {stats.completed_high_risk + stats.completed_limited_risk + stats.completed_minimal_risk} de {stats.total_high_risk + stats.total_limited_risk + stats.total_minimal_risk} sistemas completados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
