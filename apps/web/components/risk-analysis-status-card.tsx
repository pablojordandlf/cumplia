'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SystemRiskProgress {
  system_id: string;
  system_name: string;
  ai_act_level: string;
  risk_analysis_completed: boolean;
  total: number;
  mitigated: number;
  accepted: number;
  assessed: number;
  identified: number;
}

const PRIORITY_ORDER: Record<string, number> = {
  prohibited: 1,
  high_risk: 2,
  limited_risk: 3,
  minimal_risk: 4,
};

const LEVEL_COLORS: Record<string, { badge: string; icon: string; text: string; bg: string; color: string; bgLight: string }> = {
  prohibited: {
    badge: 'bg-[#F4E4D7] text-[#C92A2A] border border-[#C92A2A]/20',
    icon: '🔴',
    text: 'Prohibido',
    bg: 'bg-[#C92A2A]',
    color: 'text-[#C92A2A]',
    bgLight: 'bg-[#F4E4D7]',
  },
  high_risk: {
    badge: 'bg-[#FFE8D1] text-[#D97706] border border-[#D97706]/20',
    icon: '🟠',
    text: 'Alto Riesgo',
    bg: 'bg-[#D97706]',
    color: 'text-[#D97706]',
    bgLight: 'bg-[#FFE8D1]',
  },
  limited_risk: {
    badge: 'bg-[#FFF8DC] text-[#B8860B] border border-[#B8860B]/20',
    icon: '🟡',
    text: 'Limitado',
    bg: 'bg-[#B8860B]',
    color: 'text-[#B8860B]',
    bgLight: 'bg-[#FFF8DC]',
  },
  minimal_risk: {
    badge: 'bg-[#E8F5E3] text-[#27A844] border border-[#27A844]/20',
    icon: '🟢',
    text: 'Mínimo',
    bg: 'bg-[#27A844]',
    color: 'text-[#27A844]',
    bgLight: 'bg-[#E8F5E3]',
  },
  unclassified: {
    badge: 'bg-[#E3DFD5] text-[#707070] border border-[#707070]/20',
    icon: '⚪',
    text: 'Sin clasificar',
    bg: 'bg-[#707070]',
    color: 'text-[#707070]',
    bgLight: 'bg-[#E3DFD5]',
  },
};

export function RiskAnalysisStatusCard() {
  const [systems, setSystems] = useState<SystemRiskProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const organizationId = membership?.organization_id;

      let useCasesQuery = supabase
        .from('use_cases')
        .select('id, name, ai_act_level, risk_analysis_completed')
        .is('deleted_at', null);

      if (organizationId) {
        useCasesQuery = useCasesQuery.or(
          `organization_id.eq.${organizationId},user_id.eq.${session.user.id}`
        );
      } else {
        useCasesQuery = useCasesQuery.eq('user_id', session.user.id);
      }

      const { data: useCases } = await useCasesQuery.order('created_at', { ascending: false });

      if (!useCases?.length) {
        setSystems([]);
        return;
      }

      const useCaseIds = useCases.map((uc) => uc.id);

      const { data: risks } = await supabase
        .from('use_case_risks')
        .select('use_case_id, status')
        .in('use_case_id', useCaseIds)
        .eq('applicable', true);

      const risksBySystem: Record<string, { status: string }[]> = {};
      risks?.forEach((r) => {
        if (!risksBySystem[r.use_case_id]) risksBySystem[r.use_case_id] = [];
        risksBySystem[r.use_case_id].push({ status: r.status });
      });

      const result: SystemRiskProgress[] = useCases.map((uc) => {
        const sr = risksBySystem[uc.id] ?? [];
        const total = sr.length;
        const mitigated = sr.filter((r) => r.status === 'mitigated').length;
        const accepted = sr.filter((r) => r.status === 'accepted').length;
        const assessed = sr.filter((r) => r.status === 'assessed').length;
        const identified = total - mitigated - accepted - assessed;
        return {
          system_id: uc.id,
          system_name: uc.name,
          ai_act_level: uc.ai_act_level || 'unclassified',
          risk_analysis_completed: uc.risk_analysis_completed ?? false,
          total,
          mitigated,
          accepted,
          assessed,
          identified,
        };
      });

      result.sort(
        (a, b) => (PRIORITY_ORDER[a.ai_act_level] ?? 99) - (PRIORITY_ORDER[b.ai_act_level] ?? 99)
      );

      setSystems(result);
    } catch (error) {
      console.error('Error fetching risk progress:', error);
      toast.error('Error', { description: 'No se pudieron cargar los datos de riesgos' });
    } finally {
      setLoading(false);
    }
  }

  const filteredSystems = filterLevel
    ? systems.filter((s) => s.ai_act_level === filterLevel)
    : systems;

  const noAnalysisCount = systems.filter((s) => s.total === 0).length;

  const levelKeys = Object.keys(LEVEL_COLORS).filter((level) =>
    systems.some((s) => s.ai_act_level === level)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#E3DFD5] bg-white p-6">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="rounded-lg border border-[#E3DFD5] bg-white p-6 flex flex-col" style={{ maxHeight: '520px' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0B1C3D]" />
            <h3 className="text-sm font-semibold text-[#0B1C3D]">Gestión de Riesgos</h3>
          </div>
          <span className="text-xs text-[#8B9BB4]">{filteredSystems.length} sistemas</span>
        </div>

        {/* Legend */}
        {systems.length > 0 && (
          <div className="mb-3 flex items-center gap-3 text-xs text-[#8B9BB4] shrink-0 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-[#27A844]" />
              Mitigados
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-[#0D9488]" />
              Admitidos
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-[#3B82F6]" />
              Evaluados
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-[#CBD5E1]" />
              Identificados
            </span>
          </div>
        )}

        {/* Level filter */}
        {levelKeys.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5 shrink-0">
            <button
              onClick={() => setFilterLevel(null)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                filterLevel === null
                  ? 'bg-[#0B1C3D] text-white'
                  : 'bg-[#E3DFD5] text-[#8B9BB4] hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {levelKeys.map((level) => {
              const colors = LEVEL_COLORS[level];
              return (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                    filterLevel === level
                      ? `${colors.bg} text-white`
                      : `${colors.bgLight} ${colors.color} hover:opacity-80`
                  }`}
                >
                  {colors.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable systems list */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2">
          {filteredSystems.length > 0 ? (
            <motion.div
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredSystems.map((system) => {
                const colors = LEVEL_COLORS[system.ai_act_level] ?? LEVEL_COLORS.unclassified;
                const mitigatedPct = system.total > 0 ? (system.mitigated / system.total) * 100 : 0;
                const acceptedPct  = system.total > 0 ? (system.accepted  / system.total) * 100 : 0;
                const assessedPct  = system.total > 0 ? (system.assessed  / system.total) * 100 : 0;

                return (
                  <motion.div
                    key={system.system_id}
                    variants={itemVariants}
                    className="group rounded-lg border border-[#E3DFD5] bg-[#F8FAFB] px-3 py-2.5 transition-all hover:border-[#E8FF47]/40 hover:bg-white"
                  >
                    <Link href={`/dashboard/inventory/${system.system_id}`}>
                      <div className="cursor-pointer">
                        {/* Top row: name + badge + status icon */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-sm">{colors.icon}</span>
                            <h4 className="text-xs font-medium text-[#0B1C3D] group-hover:text-[#122850] transition-colors truncate">
                              {system.system_name}
                            </h4>
                            <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${colors.badge}`}>
                              {colors.text}
                            </Badge>
                          </div>
                          {system.risk_analysis_completed ? (
                            <CheckCircle2 className="h-4 w-4 text-[#27A844] shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-[#D97706] shrink-0" />
                          )}
                        </div>

                        {system.total === 0 ? (
                          <p className="text-xs text-[#8B9BB4]">Sin análisis iniciado</p>
                        ) : (
                          <>
                            {/* Segmented bar */}
                            <div className="h-2 w-full rounded-full bg-[#CBD5E1] overflow-hidden flex">
                              <div
                                className="h-full bg-[#27A844] shrink-0 transition-all duration-500"
                                style={{ width: `${mitigatedPct}%` }}
                              />
                              <div
                                className="h-full bg-[#0D9488] shrink-0 transition-all duration-500"
                                style={{ width: `${acceptedPct}%` }}
                              />
                              <div
                                className="h-full bg-[#3B82F6] shrink-0 transition-all duration-500"
                                style={{ width: `${assessedPct}%` }}
                              />
                            </div>
                            {/* Counts */}
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-[#8B9BB4] tabular-nums flex-wrap">
                              <span className="font-medium text-[#0B1C3D]">{system.total} total</span>
                              <span>·</span>
                              <span className="text-[#27A844]">{system.mitigated} mit</span>
                              <span>·</span>
                              <span className="text-[#0D9488]">{system.accepted} adm</span>
                              <span>·</span>
                              <span className="text-[#3B82F6]">{system.assessed} eval</span>
                              <span>·</span>
                              <span>{system.identified} id</span>
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-8 text-[#8B9BB4]">
              <p className="text-sm">No hay sistemas en esta categoría</p>
            </div>
          )}
        </div>

        {/* Footer note */}
        {noAnalysisCount > 0 && (
          <p className="mt-3 shrink-0 text-xs text-[#8B9BB4]">
            {noAnalysisCount} sistema{noAnalysisCount !== 1 ? 's' : ''} sin análisis iniciado
          </p>
        )}
      </div>
    </motion.div>
  );
}
