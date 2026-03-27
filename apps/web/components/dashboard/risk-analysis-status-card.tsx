'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react';

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
      <div className="glass rounded-2xl border border-[#E8ECEB]/30 bg-white/10 backdrop-blur-xl">
        <div className="p-8">
          <div className="flex items-center justify-center py-8">
            <Clock className="w-5 h-5 text-[#7a8a92] animate-spin" />
            <span className="ml-2 text-[#7a8a92]">Cargando...</span>
          </div>
        </div>
      </div>
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
    <div className="glass rounded-2xl border border-[#E8ECEB]/30 bg-white/10 backdrop-blur-xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#2D3E4E] flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#E09E50]" />
              Progreso de Gestión de Riesgos
            </h2>
            <p className="text-sm text-[#7a8a92] mt-1">
              Estado del análisis de riesgos por categoría
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E09E50]/20 border border-[#E09E50]/50 text-[#E09E50] text-sm font-semibold">
            {stats.completed_high_risk + stats.completed_limited_risk + stats.completed_minimal_risk}/{stats.total_high_risk + stats.total_limited_risk + stats.total_minimal_risk}
          </span>
        </div>

        <div className="space-y-6">
          {/* High Risk Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#C92A2A]" />
                <h3 className="font-semibold text-[#2D3E4E]">
                  Sistemas Prohibidos
                </h3>
                <Badge className="bg-[#F4E4D7] text-[#C92A2A] border border-[#C92A2A]/20">
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
                    Es obligatorio completar el análisis de riesgos para todos los sistemas prohibidos según el AI Act.
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
                No tienes sistemas prohibidos
              </p>
            )}
          </div>

          {/* Limited Risk Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#D97706]" />
                <h3 className="font-semibold text-[#2D3E4E]">
                  Sistemas de Alto Riesgo
                </h3>
                <Badge className="bg-[#FFE8D1] text-[#D97706] border border-[#D97706]/20">
                  Obligatorio
                </Badge>
              </div>
              <span className="text-sm font-medium text-[#2D3E4E]">
                {stats.completed_limited_risk} de {stats.total_limited_risk}
              </span>
            </div>

            {stats.total_limited_risk > 0 && (
              <>
                <Alert className="border-[#D97706]/20 bg-[#FFE8D1]">
                  <AlertCircle className="h-4 w-4 text-[#D97706]" />
                  <AlertDescription className="text-[#D97706] text-sm">
                    Completa el análisis de riesgos para los sistemas de alto riesgo en tu área de influencia.
                  </AlertDescription>
                </Alert>

                <div className="w-full bg-[#E8ECEB] rounded-full h-2">
                  <div
                    className="bg-[#D97706] h-2 rounded-full transition-all"
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
                No tienes sistemas de alto riesgo
              </p>
            )}
          </div>

          {/* Minimal Risk Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#27A844]" />
                <h3 className="font-semibold text-[#2D3E4E]">
                  Sistemas de Riesgo Limitado/Mínimo
                </h3>
                <Badge className="bg-[#E8F5E3] text-[#27A844] border border-[#27A844]/20">
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
                No tienes sistemas de riesgo limitado o mínimo
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-[#E8ECEB]/30">
            <p className="text-xs text-[#7a8a92]">
              Total: {stats.completed_high_risk + stats.completed_limited_risk + stats.completed_minimal_risk} de {stats.total_high_risk + stats.total_limited_risk + stats.total_minimal_risk} sistemas completados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
