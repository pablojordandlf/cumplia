'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, CheckCircle2, Clock, AlertCircle, RefreshCw, ChevronRight, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';

interface SystemAssessment {
  id: string;
  name: string;
  ai_act_level: string;
  status: string;
  total_obligations: number;
  completed_obligations: number;
  in_progress_obligations: number;
  completion_percentage: number;
}

const LEVEL_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  prohibited:   { label: 'Prohibido',       icon: '🔴', color: 'text-red-600'    },
  high_risk:    { label: 'Alto Riesgo',     icon: '🟠', color: 'text-orange-600' },
  limited_risk: { label: 'Riesgo Limitado', icon: '🟡', color: 'text-yellow-600' },
  minimal_risk: { label: 'Riesgo Mínimo',   icon: '🟢', color: 'text-green-600'  },
  unclassified: { label: 'Sin clasificar',  icon: '⚪', color: 'text-gray-500'   },
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  in_review: 'En revisión',
  approved: 'Aprobado',
  active: 'Activo',
  archived: 'Archivado',
};

export default function AssessmentsPage() {
  const [systems, setSystems] = useState<SystemAssessment[]>([]);
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
        .select('id, name, ai_act_level, status')
        .is('deleted_at', null);

      if (membership?.organization_id) {
        q = q.or(`organization_id.eq.${membership.organization_id},user_id.eq.${session.user.id}`);
      } else {
        q = q.eq('user_id', session.user.id);
      }

      const { data: useCases } = await q.order('created_at', { ascending: false });
      if (!useCases?.length) { setSystems([]); setLoading(false); return; }

      const enriched: SystemAssessment[] = await Promise.all(
        useCases.map(async (uc) => {
          const { data: obligations } = await supabase
            .from('use_case_obligations')
            .select('status')
            .eq('use_case_id', uc.id);

          const total = obligations?.length ?? 0;
          const completed = obligations?.filter(o => o.status === 'completed').length ?? 0;
          const in_progress = obligations?.filter(o => o.status === 'in_progress').length ?? 0;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            id: uc.id,
            name: uc.name,
            ai_act_level: uc.ai_act_level || 'unclassified',
            status: uc.status || 'draft',
            total_obligations: total,
            completed_obligations: completed,
            in_progress_obligations: in_progress,
            completion_percentage: pct,
          };
        })
      );

      setSystems(enriched);
    } finally {
      setLoading(false);
    }
  }

  const available = [...new Set(systems.map(s => s.ai_act_level))];
  const filtered = filterLevel ? systems.filter(s => s.ai_act_level === filterLevel) : systems;

  const totalSystems = systems.length;
  const fullyCompleted = systems.filter(s => s.completion_percentage === 100 && s.total_obligations > 0).length;
  const inProgress = systems.filter(s => s.completion_percentage > 0 && s.completion_percentage < 100).length;
  const notStarted = systems.filter(s => s.total_obligations === 0).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C3D]">Evaluaciones</h1>
          <p className="text-sm text-[#8B9BB4] mt-1">Progreso de cumplimiento de obligaciones AI Act por sistema</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#0B1C3D]" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">Total sistemas</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{totalSystems}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">sistemas registrados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">Completados</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{fullyCompleted}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">100% obligaciones cumplidas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#0B1C3D]" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">En progreso</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{inProgress}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">parcialmente completados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">Sin iniciar</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{notStarted}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">sin obligaciones asignadas</p>
        </div>
      </div>

      {/* Filters */}
      {available.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterLevel(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterLevel ? 'bg-[#0B1C3D] text-white border-[#0B1C3D]' : 'border-[#E3DFD5] text-[#8B9BB4] hover:border-[#0B1C3D]'}`}
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
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterLevel === level ? 'bg-[#0B1C3D] text-white border-[#0B1C3D]' : 'border-[#E3DFD5] text-[#8B9BB4] hover:border-[#0B1C3D]'}`}
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
            <div key={i} className="bg-white rounded-xl border border-[#E3DFD5] p-4 animate-pulse">
              <div className="h-5 w-48 bg-gray-100 rounded mb-3" />
              <div className="h-2 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#8B9BB4] font-medium">No hay sistemas registrados</p>
          <p className="text-sm text-gray-400 mt-1">
            <Link href="/dashboard/inventory/new" className="text-[#0B1C3D] hover:underline font-medium">
              Añade un sistema de IA
            </Link>{' '}para empezar a evaluar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(system => {
            const cfg = LEVEL_CONFIG[system.ai_act_level] ?? LEVEL_CONFIG.unclassified;
            return (
              <Link key={system.id} href={`/dashboard/inventory/${system.id}`}>
                <div className="bg-white rounded-xl border border-[#E3DFD5] p-4 hover:border-[#E8FF47]/40 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cfg.icon}</span>
                        <h3 className="font-semibold text-[#0B1C3D] group-hover:text-[#E8FF47] transition-colors truncate">
                          {system.name}
                        </h3>
                        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>

                      {system.total_obligations === 0 ? (
                        <p className="text-xs text-[#8B9BB4] mt-2">Sin obligaciones asignadas</p>
                      ) : (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8B9BB4]">
                              {system.completed_obligations} completadas · {system.in_progress_obligations} en progreso · {system.total_obligations} total
                            </span>
                            <span className="font-medium text-[#0B1C3D]">{system.completion_percentage}%</span>
                          </div>
                          <Progress value={system.completion_percentage} className="h-1.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {system.total_obligations === 0 ? (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs border">Sin iniciar</Badge>
                      ) : system.completion_percentage === 100 ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs border">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs border">
                          <Clock className="w-3 h-3 mr-1" /> En progreso
                        </Badge>
                      )}
                      <span className="text-xs text-[#8B9BB4] hidden sm:block">
                        {STATUS_LABELS[system.status] ?? system.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E8FF47] transition-colors" />
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
