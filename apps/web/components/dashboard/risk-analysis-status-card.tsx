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
              <AlertTriangle className="h-5 w-5 text-[#C92A2A]" />
              <h3 className="font-semibold text-[#2D3E4E]">
                Sistemas de Riesgo Alto
              </h3>
              <Badge variant="destructive" className="bg-[#F4E4D7] text-[#C92A2A] border-[#C92A2A]/20">
                Obligatorio
              </Badge>
            </div>
            <span className="text-sm font-medium text-[#2D3E4E]">
              {stats.completed_high_risk} de {stats.total_high_risk}
            </span>
          </div>

          {stats.total_high_risk > 0 && (
            <>
              <Alert className="border-[#C92A2A]/20 bg-[#F4E4D7]">
                <AlertTriangle className="h-4 w-4 text-[#C92A2A]" />
                <AlertDescription className="text-[#C92A2A] text-sm">
                  Es obligatorio completar el análisis de riesgos para todos los sistemas de Riesgo Alto según el AI Act.
                </AlertDescription>
              </Alert>

              <div className="w-full bg-[#E8ECEB] rounded-full h-2">
                <div
                  className="bg-[#C92A2A] h-2 rounded-full transition-all"
                  style={{ width: `${highRiskPercentage}%` }}
                />
              </div>

              <p className="text-xs text-[#7a8a92]">
                {highRiskPercentage}% completado
              </p>
            </>
          )}

          {stats.total_high_risk === 0 && (
            <p className="text-sm text-[#7a8a92]">
              No tienes sistemas de Riesgo Alto
            </p>
          )}
        </div>

        {/* Limited Risk Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#B8860B]" />
              <h3 className="font-semibold text-[#2D3E4E]">
                Sistemas de Riesgo Limitado
              </h3>
              <Badge variant="secondary" className="bg-[#FFF8DC] text-[#B8860B] border-[#B8860B]/20">
                Opcional
              </Badge>
            </div>
            <span className="text-sm font-medium text-[#2D3E4E]">
              {stats.completed_limited_risk} de {stats.total_limited_risk}
            </span>
          </div>

          {stats.total_limited_risk > 0 && (
            <>
              <div className="w-full bg-[#E8ECEB] rounded-full h-2">
                <div
                  className="bg-[#B8860B] h-2 rounded-full transition-all"
                  style={{ width: `${limitedRiskPercentage}%` }}
                />
              </div>

              <p className="text-xs text-[#7a8a92]">
                {limitedRiskPercentage}% completado
              </p>
            </>
          )}

          {stats.total_limited_risk === 0 && (
            <p className="text-sm text-[#7a8a92]">
              No tienes sistemas de Riesgo Limitado
            </p>
          )}
        </div>

        {/* Minimal Risk Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#27A844]" />
              <h3 className="font-semibold text-[#2D3E4E]">
                Sistemas de Riesgo Mínimo
              </h3>
              <Badge variant="secondary" className="bg-[#E8F5E3] text-[#27A844] border-[#27A844]/20">
                Opcional
              </Badge>
            </div>
            <span className="text-sm font-medium text-[#2D3E4E]">
              {stats.completed_minimal_risk} de {stats.total_minimal_risk}
            </span>
          </div>

          {stats.total_minimal_risk > 0 && (
            <>
              <div className="w-full bg-[#E8ECEB] rounded-full h-2">
                <div
                  className="bg-[#27A844] h-2 rounded-full transition-all"
                  style={{ width: `${minimalRiskPercentage}%` }}
                />
              </div>

              <p className="text-xs text-[#7a8a92]">
                {minimalRiskPercentage}% completado
              </p>
            </>
          )}

          {stats.total_minimal_risk === 0 && (
            <p className="text-sm text-[#7a8a92]">
              No tienes sistemas de Riesgo Mínimo
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-[#E8ECEB]">
          <p className="text-xs text-[#7a8a92]">
            Total: {stats.completed_high_risk + stats.completed_limited_risk + stats.completed_minimal_risk} de {stats.total_high_risk + stats.total_limited_risk + stats.total_minimal_risk} sistemas completados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
