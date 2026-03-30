'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Shield, CheckCircle2, Clock, RefreshCw, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';

interface SystemRiskData {
  id: string;
  name: string;
  ai_act_level: string;
  risk_analysis_completed: boolean;
  total_risks: number;
  assessed_risks: number;
  mitigated_risks: number;
  critical_open: number;
  completion_percentage: number;
}

const LEVEL_CONFIG: Record<string, { label: string; badge: string; icon: string; border: string; bg: string }> = {
  prohibited:   { label: 'Prohibido',       badge: 'bg-red-100 text-red-700 border-red-200',      icon: '🔴', border: 'border-red-200',    bg: 'bg-red-50'    },
  high_risk:    { label: 'Alto Riesgo',     badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🟠', border: 'border-orange-200', bg: 'bg-orange-50' },
  limited_risk: { label: 'Riesgo Limitado', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡', border: 'border-yellow-200', bg: 'bg-yellow-50' },
  minimal_risk: { label: 'Riesgo Mínimo',   badge: 'bg-green-100 text-green-700 border-green-200',   icon: '🟢', border: 'border-green-200',  bg: 'bg-green-50'  },
  unclassified: { label: 'Sin clasificar',  badge: 'bg-gray-100 text-gray-600 border-gray-200',      icon: '⚪', border: 'border-gray-200',   bg: 'bg-gray-50'   },
};

const PRIORITY_ORDER: Record<string, number> = {
  prohibited: 0, high_risk: 1, limited_risk: 2, minimal_risk: 3, unclassified: 4,
};

export default function RiskPage() {
  const [systems, setSystems] = useState<SystemRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      let q = supabase
        .from('use_cases')
        .select('id, name, ai_act_level, risk_analysis_completed')
        .is('deleted_at', null);

      if (membership?.organization_id) {
        q = q.or(`organization_id.eq.${membership.organization_id},user_id.eq.${session.user.id}`);
      } else {
        q = q.eq('user_id', session.user.id);
      }

      const { data: useCases } = await q.order('created_at', { ascending: false });
      if (!useCases?.length) { setSystems([]); setLoading(false); return; }

      const enriched: SystemRiskData[] = await Promise.all(
        useCases.map(async (uc) => {
          const { data: risks } = await supabase
            .from('ai_system_risks')
            .select('status, probability, impact')
            .eq('ai_system_id', uc.id);

          const total = risks?.length ?? 0;
          const assessed = risks?.filter(r => ['assessed', 'mitigated', 'accepted'].includes(r.status)).length ?? 0;
          const mitigated = risks?.filter(r => ['mitigated', 'accepted'].includes(r.status)).length ?? 0;
          const critical_open = risks?.filter(r =>
            r.probability === 'critical' && !['mitigated', 'accepted'].includes(r.status)
          ).length ?? 0;
          const pct = total > 0 ? Math.round((mitigated / total) * 100) : 0;

          return {
            id: uc.id,
            name: uc.name,
            ai_act_level: uc.ai_act_level || 'unclassified',
            risk_analysis_completed: uc.risk_analysis_completed ?? false,
            total_risks: total,
            assessed_risks: assessed,
            mitigated_risks: mitigated,
            critical_open,
            completion_percentage: pct,
          };
        })
      );

      enriched.sort((a, b) => (PRIORITY_ORDER[a.ai_act_level] ?? 99) - (PRIORITY_ORDER[b.ai_act_level] ?? 99));
      setSystems(enriched);
    } finally {
      setLoading(false);
    }
  }

  const available = [...new Set(systems.map(s => s.ai_act_level))];
  const filtered = filterLevel ? systems.filter(s => s.ai_act_level === filterLevel) : systems;

  const totalSystems = systems.length;
  const completedSystems = systems.filter(s => s.risk_analysis_completed).length;
  const systemsWithRisks = systems.filter(s => s.total_risks > 0).length;
  const criticalTotal = systems.reduce((acc, s) => acc + s.critical_open, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3E4E]">Gestión de Riesgos</h1>
          <p className="text-sm text-[#7a8a92] mt-1">Estado del análisis de riesgos AI Act para todos tus sistemas</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E8ECEB] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#E09E50]" />
            <span className="text-xs font-medium text-[#7a8a92] uppercase tracking-wide">Sistemas</span>
          </div>
          <p className="text-2xl font-bold text-[#2D3E4E]">{totalSystems}</p>
          <p className="text-xs text-[#7a8a92] mt-1">{systemsWithRisks} con riesgos registrados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8ECEB] p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-[#7a8a92] uppercase tracking-wide">Completados</span>
          </div>
          <p className="text-2xl font-bold text-[#2D3E4E]">{completedSystems}</p>
          <p className="text-xs text-[#7a8a92] mt-1">de {totalSystems} sistemas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8ECEB] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-[#7a8a92] uppercase tracking-wide">Progreso</span>
          </div>
          <p className="text-2xl font-bold text-[#2D3E4E]">
            {totalSystems > 0 ? Math.round((completedSystems / totalSystems) * 100) : 0}%
          </p>
          <p className="text-xs text-[#7a8a92] mt-1">análisis completado</p>
        </div>
        <div className={`bg-white rounded-xl border p-4 ${criticalTotal > 0 ? 'border-red-200' : 'border-[#E8ECEB]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${criticalTotal > 0 ? 'text-red-500' : 'text-[#7a8a92]'}`} />
            <span className="text-xs font-medium text-[#7a8a92] uppercase tracking-wide">Críticos abiertos</span>
          </div>
          <p className={`text-2xl font-bold ${criticalTotal > 0 ? 'text-red-600' : 'text-[#2D3E4E]'}`}>{criticalTotal}</p>
          <p className="text-xs text-[#7a8a92] mt-1">riesgos sin mitigar</p>
        </div>
      </div>

      {/* Filter pills */}
      {available.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterLevel(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterLevel ? 'bg-[#2D3E4E] text-white border-[#2D3E4E]' : 'border-[#E8ECEB] text-[#7a8a92] hover:border-[#2D3E4E]'}`}
          >
            Todos ({systems.length})
          </button>
          {available.map(level => {
            const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.unclassified;
            const count = systems.filter(s => s.ai_act_level === level).length;
            return (
              <button
                key={level}
                onClick={() => setFilterLevel(level === filterLevel ? null : level)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterLevel === level ? 'bg-[#2D3E4E] text-white border-[#2D3E4E]' : 'border-[#E8ECEB] text-[#7a8a92] hover:border-[#2D3E4E]'}`}
              >
                {cfg.icon} {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Systems list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#E8ECEB] p-4 animate-pulse">
              <div className="h-5 w-48 bg-gray-100 rounded mb-3" />
              <div className="h-2 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8ECEB] p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#7a8a92] font-medium">No hay sistemas en esta categoría</p>
          <p className="text-sm text-gray-400 mt-1">
            <Link href="/dashboard/inventory/new" className="text-[#E09E50] hover:underline">Añade un sistema de IA</Link> para comenzar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(system => {
            const cfg = LEVEL_CONFIG[system.ai_act_level] ?? LEVEL_CONFIG.unclassified;
            return (
              <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                <div className="bg-white rounded-xl border border-[#E8ECEB] p-4 hover:border-[#E09E50]/40 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{cfg.icon}</span>
                        <h3 className="font-semibold text-[#2D3E4E] group-hover:text-[#E09E50] transition-colors truncate">
                          {system.name}
                        </h3>
                        <Badge className={`text-xs border ${cfg.badge} ml-1`}>{cfg.label}</Badge>
                      </div>

                      {system.total_risks === 0 ? (
                        <p className="text-xs text-[#7a8a92] mt-2">
                          Sin análisis de riesgos iniciado —{' '}
                          <span className="text-[#E09E50]">abrir para iniciar</span>
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#7a8a92]">
                              {system.mitigated_risks} mitigados · {system.assessed_risks} evaluados · {system.total_risks} total
                            </span>
                            <span className="font-medium text-[#2D3E4E]">{system.completion_percentage}%</span>
                          </div>
                          <Progress value={system.completion_percentage} className="h-1.5" />
                        </div>
                      )}

                      {system.critical_open > 0 && (
                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {system.critical_open} riesgo(s) crítico(s) pendiente(s)
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {system.risk_analysis_completed ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs border">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
                        </Badge>
                      ) : system.total_risks > 0 ? (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs border">
                          <Clock className="w-3 h-3 mr-1" /> En progreso
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs border">
                          Pendiente
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E09E50] transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
