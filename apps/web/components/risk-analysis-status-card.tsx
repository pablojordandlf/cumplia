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
        const systemRisks = risksBySystem[uc.id] ?? [];
        const total = systemRisks.length;
        const mitigated = systemRisks.filter((r) => r.status === 'mitigated').length;
        const assessed = systemRisks.filter((r) => r.status === 'assessed').length;
        const identified = total - mitigated - assessed;
        return {
          system_id: uc.id,
          system_name: uc.name,
          ai_act_level: uc.ai_act_level || 'unclassified',
          risk_analysis_completed: uc.risk_analysis_completed ?? false,
          total,
          mitigated,
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

  const completedCount = systems.filter((s) => s.risk_analysis_completed).length;
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
              <div key={i} className="h-6 animate-pulse rounded bg-gray-100" />
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
      className="space-y-4"
    >
      <div className="rounded-lg border border-[#E3DFD5] bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0B1C3D]" />
            <h3 className="text-sm font-semibold text-[#0B1C3D]">Gestión de Riesgos</h3>
          </div>
          <span className="text-xs text-[#8B9BB4]">{filteredSystems.length} sistemas</span>
        </div>

        {/* Summary stat */}
        <div className="mb-4 rounded-lg bg-[#F8FAFB] border border-[#E3DFD5] px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[#8B9BB4]">Análisis completados</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#27A844]" />
            <span className="text-sm font-semibold text-[#0B1C3D]">
              {completedCount} / {systems.length}
            </span>
          </div>
        </div>

        {/* Legend */}
        {systems.length > 0 && (
          <div className="mb-4 flex items-center gap-4 text-xs text-[#8B9BB4]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#27A844]" />
              Mitigados
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6]" />
              Evaluados
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#CBD5E1]" />
              Identificados
            </span>
          </div>
        )}

        {/* Level filter */}
        {levelKeys.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <motion.button
              onClick={() => setFilterLevel(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                filterLevel === null
                  ? 'bg-[#0B1C3D] text-white'
                  : 'bg-[#E3DFD5] text-[#8B9BB4] hover:bg-gray-200'
              }`}
            >
              Todos
            </motion.button>
            {levelKeys.map((level) => {
              const colors = LEVEL_COLORS[level];
              return (
                <motion.button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    filterLevel === level
                      ? `${colors.bg} text-white`
                      : `${colors.bgLight} ${colors.color} hover:opacity-80`
                  }`}
                >
                  {colors.text}
                </motion.button>
              );
            })}
          </div>
        )}

        {filteredSystems.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSystems.map((system) => {
              const colors = LEVEL_COLORS[system.ai_act_level] ?? LEVEL_COLORS.unclassified;
              const mitigatedPct = system.total > 0 ? (system.mitigated / system.total) * 100 : 0;
              const assessedPct = system.total > 0 ? (system.assessed / system.total) * 100 : 0;

              return (
                <motion.div
                  key={system.system_id}
                  variants={itemVariants}
                  className="group rounded-lg border border-[#E3DFD5] bg-[#F8FAFB] p-4 transition-all hover:border-[#E8FF47]/40 hover:bg-white"
                >
                  <Link href={`/dashboard/inventory/${system.system_id}`}>
                    <div className="space-y-3 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span>{colors.icon}</span>
                            <h4 className="font-medium text-[#0B1C3D] group-hover:text-[#122850] transition-colors truncate">
                              {system.system_name}
                            </h4>
                          </div>
                          <Badge className={`mt-2 ${colors.badge}`}>{colors.text}</Badge>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          {system.risk_analysis_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-[#27A844]" />
                          ) : (
                            <Clock className="h-5 w-5 text-[#D97706]" />
                          )}
                        </div>
                      </div>

                      {system.total === 0 ? (
                        <p className="text-xs text-[#8B9BB4]">Sin análisis iniciado</p>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8B9BB4]">Progreso de riesgos</span>
                            <span className="font-medium text-[#0B1C3D] tabular-nums">
                              {system.mitigated + system.assessed}/{system.total}
                            </span>
                          </div>
                          {/* Segmented bar */}
                          <div className="h-2 w-full rounded-full bg-[#CBD5E1] overflow-hidden flex">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${mitigatedPct}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-[#27A844] shrink-0"
                            />
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${assessedPct}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className="h-full bg-[#3B82F6] shrink-0"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-[#8B9BB4]">
                            <span>{system.mitigated} mit · {system.assessed} eval · {system.identified} id</span>
                            <span>{Math.round(mitigatedPct)}% mitigado</span>
                          </div>
                        </div>
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

        {noAnalysisCount > 0 && (
          <p className="mt-4 text-xs text-[#8B9BB4]">
            {noAnalysisCount} sistema{noAnalysisCount !== 1 ? 's' : ''} sin análisis iniciado
          </p>
        )}
      </div>
    </motion.div>
  );
}
