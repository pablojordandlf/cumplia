'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { toast } from 'sonner';

interface SystemObligationStatus {
  system_id: string;
  system_name: string;
  ai_act_level: string;
  total_obligations: number;
  completed_obligations: number;
  progress_percentage: number;
}

const OBLIGATIONS_BY_LEVEL: Record<string, number> = {
  prohibited: 2,
  high_risk: 8,
  limited_risk: 4,
  minimal_risk: 2,
  gpai_sr: 7,
  gpai_model: 3,
  gpai_system: 3,
  unclassified: 1,
};

const PRIORITY_ORDER: Record<string, number> = {
  prohibited: 1,
  high_risk: 2,
  limited_risk: 3,
  minimal_risk: 4,
};

const LEVEL_COLORS: Record<string, { badge: string; icon: string; text: string; bg: string; color: string; bgLight: string; hex: string }> = {
  prohibited: {
    badge: 'bg-[#F4E4D7] text-[#C92A2A] border border-[#C92A2A]/20',
    icon: '🔴',
    text: 'Prohibido',
    bg: 'bg-[#C92A2A]',
    color: 'text-[#C92A2A]',
    bgLight: 'bg-[#F4E4D7]',
    hex: '#C92A2A',
  },
  high_risk: {
    badge: 'bg-[#FFE8D1] text-[#D97706] border border-[#D97706]/20',
    icon: '🟠',
    text: 'Alto Riesgo',
    bg: 'bg-[#D97706]',
    color: 'text-[#D97706]',
    bgLight: 'bg-[#FFE8D1]',
    hex: '#D97706',
  },
  limited_risk: {
    badge: 'bg-[#FFF8DC] text-[#B8860B] border border-[#B8860B]/20',
    icon: '🟡',
    text: 'Limitado',
    bg: 'bg-[#B8860B]',
    color: 'text-[#B8860B]',
    bgLight: 'bg-[#FFF8DC]',
    hex: '#B8860B',
  },
  minimal_risk: {
    badge: 'bg-[#E8F5E3] text-[#27A844] border border-[#27A844]/20',
    icon: '🟢',
    text: 'Mínimo',
    bg: 'bg-[#27A844]',
    color: 'text-[#27A844]',
    bgLight: 'bg-[#E8F5E3]',
    hex: '#27A844',
  },
  unclassified: {
    badge: 'bg-[#E3DFD5] text-[#707070] border border-[#707070]/20',
    icon: '⚪',
    text: 'Sin clasificar',
    bg: 'bg-[#707070]',
    color: 'text-[#707070]',
    bgLight: 'bg-[#E3DFD5]',
    hex: '#707070',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function PendingObligationsWidget() {
  const [systems, setSystems] = useState<SystemObligationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchObligations();
  }, []);

  async function fetchObligations() {
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
        .select('id, name, ai_act_level')
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

      const { data: completedRows } = await supabase
        .from('use_case_obligations')
        .select('use_case_id')
        .in('use_case_id', useCaseIds)
        .eq('is_completed', true);

      const completedBySystem: Record<string, number> = {};
      completedRows?.forEach((row) => {
        completedBySystem[row.use_case_id] = (completedBySystem[row.use_case_id] ?? 0) + 1;
      });

      const result: SystemObligationStatus[] = useCases.map((uc) => {
        const level = uc.ai_act_level || 'unclassified';
        const total = OBLIGATIONS_BY_LEVEL[level] ?? 0;
        const completed = completedBySystem[uc.id] ?? 0;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          system_id: uc.id,
          system_name: uc.name,
          ai_act_level: level,
          total_obligations: total,
          completed_obligations: completed,
          progress_percentage: pct,
        };
      });

      result.sort(
        (a, b) => (PRIORITY_ORDER[a.ai_act_level] ?? 99) - (PRIORITY_ORDER[b.ai_act_level] ?? 99)
      );

      setSystems(result);
    } catch (error) {
      console.error('Error fetching obligations:', error);
      toast.error('Error', { description: 'No se pudieron cargar las obligaciones' });
    } finally {
      setLoading(false);
    }
  }

  const filteredSystems = filterLevel
    ? systems.filter((s) => s.ai_act_level === filterLevel)
    : systems;

  const completedCount = systems.filter(
    (s) => s.completed_obligations === s.total_obligations && s.total_obligations > 0
  ).length;

  const levelKeys = Object.keys(LEVEL_COLORS).filter((level) =>
    systems.some((s) => s.ai_act_level === level)
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E3DFD5] bg-white p-5" style={{ height: '520px' }}>
        <div className="space-y-3">
          <div className="h-5 w-44 animate-pulse rounded-md bg-[#F0EDE8]" />
          <div className="h-px bg-[#E3DFD5]" />
          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[58px] animate-pulse rounded-lg bg-[#F0EDE8]" />
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
      className="rounded-xl border border-[#E3DFD5] bg-white p-5 flex flex-col"
      style={{ height: '520px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-[#0B1C3D]" />
          <h3 className="text-sm font-semibold text-[#0B1C3D]">Obligaciones Pendientes</h3>
        </div>
        <span className="text-xs text-[#8B9BB4] tabular-nums">{filteredSystems.length} sistemas</span>
      </div>

      {/* Divider */}
      <div className="border-b border-[#E3DFD5] mb-3 shrink-0" />

      {/* Spacer row — keeps vertical rhythm aligned with risk widget's legend row */}
      <div className="mb-3 flex items-center shrink-0 h-[18px]">
        {systems.length > 0 && (
          <span className="text-[10px] text-[#8B9BB4]">
            Progreso de cumplimiento por sistema AI Act
          </span>
        )}
      </div>

      {/* Level filters */}
      {levelKeys.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 shrink-0">
          <motion.button
            onClick={() => setFilterLevel(null)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              filterLevel === null
                ? 'bg-[#0B1C3D] text-white'
                : 'bg-[#F0EDE8] text-[#8B9BB4] hover:bg-[#E3DFD5]'
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
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

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
        {filteredSystems.length > 0 ? (
          <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
            {filteredSystems.map((system) => {
              const colors = LEVEL_COLORS[system.ai_act_level] ?? LEVEL_COLORS.unclassified;
              const isCompleted =
                system.completed_obligations === system.total_obligations &&
                system.total_obligations > 0;

              return (
                <motion.div
                  key={system.system_id}
                  variants={itemVariants}
                  className="group rounded-lg border border-[#E3DFD5] bg-[#F8FAFB] px-3 py-2.5 transition-all hover:border-[#0B1C3D]/10 hover:bg-white hover:shadow-sm"
                >
                  <Link href={`/dashboard/inventory/${system.system_id}`}>
                    <div className="cursor-pointer">
                      {/* Row 1: name + badge + status */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-sm leading-none shrink-0">{colors.icon}</span>
                          <h4 className="text-xs font-medium text-[#0B1C3D] group-hover:text-[#122850] transition-colors truncate">
                            {system.system_name}
                          </h4>
                          <Badge className={`text-[10px] px-1.5 py-0 leading-4 shrink-0 ${colors.badge}`}>
                            {colors.text}
                          </Badge>
                        </div>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#27A844] shrink-0" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                        )}
                      </div>

                      {/* Row 2: progress bar */}
                      <div className="h-1.5 w-full rounded-full bg-[#E3DFD5] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${system.progress_percentage}%`,
                            backgroundColor: colors.hex,
                          }}
                        />
                      </div>

                      {/* Row 3: counts */}
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] tabular-nums flex-wrap">
                        <span className="font-medium text-[#0B1C3D]">
                          {system.completed_obligations}/{system.total_obligations} obligaciones
                        </span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span style={{ color: colors.hex }}>{system.progress_percentage}% completado</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-[#8B9BB4]">
            <p className="text-xs">No hay sistemas en esta categoría</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {completedCount > 0 && (
        <p className="mt-2 shrink-0 text-[10px] text-[#8B9BB4]">
          {completedCount} sistema{completedCount !== 1 ? 's' : ''} con obligaciones completadas
        </p>
      )}
    </motion.div>
  );
}
