'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingObligation {
  system_id: string;
  system_name: string;
  ai_act_level: string;
  pending_obligations: {
    key: string;
    title: string;
  }[];
  total_obligations: number;
  completed_obligations: number;
  risk_management_progress: number;
}

const PRIORITY_ORDER: Record<string, number> = {
  prohibited: 1,
  high_risk: 2,
  limited_risk: 3,
  minimal_risk: 4,
};

const RISK_COLORS: Record<string, { badge: string; icon: string; text: string }> = {
  prohibited: { badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '🔴', text: 'Prohibido' },
  high_risk: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🟠', text: 'Alto Riesgo' },
  limited_risk: { badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '🟡', text: 'Limitado' },
  minimal_risk: { badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🟢', text: 'Mínimo' },
  unclassified: { badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: '⚪', text: 'Sin clasificar' },
};

export function PendingObligationsWidget() {
  const [obligations, setObligations] = useState<PendingObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingObligations();
  }, []);

  async function fetchPendingObligations() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const organizationId = membership?.organization_id;

      // Fetch systems
      let systemsQuery = supabase
        .from('use_cases')
        .select('id, name, ai_act_level')
        .is('deleted_at', null);

      if (organizationId) {
        systemsQuery = systemsQuery.or(`organization_id.eq.${organizationId},user_id.eq.${session.user.id}`);
      } else {
        systemsQuery = systemsQuery.eq('user_id', session.user.id);
      }

      const { data: systems } = await systemsQuery.order('created_at', { ascending: false });

      if (!systems || systems.length === 0) {
        setObligations([]);
        setLoading(false);
        return;
      }

      // For each system, fetch its obligations
      const pendingList: PendingObligation[] = [];

      for (const system of systems) {
        const { data: obligationsData } = await supabase
          .from('use_case_obligations')
          .select('obligation_key, obligation_title, is_completed')
          .eq('use_case_id', system.id);

        const total = getObligationsCountForLevel(system.ai_act_level);
        const completed = obligationsData?.filter(o => o.is_completed).length || 0;
        const pending = obligationsData?.filter(o => !o.is_completed) || [];

        // Show ALL systems with their obligation status (both pending and completed)
        // This way users can see progress even if all obligations are completed
        pendingList.push({
          system_id: system.id,
          system_name: system.name,
          ai_act_level: system.ai_act_level || 'unclassified',
          pending_obligations: pending.map(p => ({
            key: p.obligation_key,
            title: p.obligation_title,
          })),
          total_obligations: total,
          completed_obligations: completed,
          risk_management_progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }

      // Sort by priority (prohibited first, then high_risk, etc.)
      pendingList.sort((a, b) => {
        const priorityA = PRIORITY_ORDER[a.ai_act_level] || 999;
        const priorityB = PRIORITY_ORDER[b.ai_act_level] || 999;
        return priorityA - priorityB;
      });

      setObligations(pendingList);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las obligaciones pendientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function getObligationsCountForLevel(level: string): number {
    const counts: Record<string, number> = {
      prohibited: 2,
      high_risk: 8,
      limited_risk: 4,
      minimal_risk: 2,
      unclassified: 1,
    };
    return counts[level] || 1;
  }

  const filteredObligations = filterRisk
    ? obligations.filter(o => o.ai_act_level === filterRisk)
    : obligations;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="glass rounded-2xl border border-[#E8ECEB]/30 bg-white/10 backdrop-blur-xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#2D3E4E] flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-[#E09E50]" />
              Obligaciones Pendientes
            </h2>
            <p className="text-sm text-[#7a8a92] mt-1">
              Acciones requeridas para mantener el cumplimiento normativo
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E09E50]/20 border border-[#E09E50]/50 text-[#E09E50] text-sm font-semibold">
            {filteredObligations.length} sistema{filteredObligations.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-600">Cargando...</span>
            </div>
          ) : filteredObligations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-3 opacity-70" />
              <p className="text-gray-900 font-bold">
                {filterRisk ? `No hay sistemas con nivel ${filterRisk}` : 'No hay sistemas registrados'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Crea tu primer sistema de IA para comenzar a rastrear obligaciones
              </p>
            </div>
          ) : (
            <>
              {/* Quick filter by risk level */}
              <div className="flex gap-2 pb-4 border-b border-white/10 overflow-x-auto">
                <button
                  onClick={() => setFilterRisk(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    filterRisk === null
                      ? 'bg-[#E09E50] text-white shadow-lg'
                      : 'bg-[#E8ECEB]/40 text-[#2D3E4E]/70 hover:bg-[#E8ECEB]/60 hover:text-[#2D3E4E]'
                  }`}
                >
                  Todos ({obligations.length})
                </button>
                {['prohibited', 'high_risk', 'limited_risk', 'minimal_risk'].map(level => {
                  const count = obligations.filter(o => o.ai_act_level === level).length;
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={level}
                      onClick={() => setFilterRisk(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        filterRisk === level
                          ? `bg-gradient-to-r ${level === 'prohibited' ? 'from-[#C92A2A] to-[#B52525]' : level === 'high_risk' ? 'from-[#D97706] to-[#C86200]' : level === 'limited_risk' ? 'from-[#B8860B] to-[#A87A00]' : 'from-[#27A844] to-[#219639]'} text-white shadow-lg`
                          : 'bg-[#E8ECEB]/40 text-[#2D3E4E]/70 hover:bg-[#E8ECEB]/60 hover:text-[#2D3E4E]'
                      }`}
                    >
                      {RISK_COLORS[level].icon} {count}
                    </button>
                  );
                })}
              </div>

              {/* Show message if filter returns no results */}
              {filterRisk && filteredObligations.length === 0 && (
                <div className="text-center py-8 mb-6">
                  <p className="text-white/70 text-sm mb-2">
                    No hay sistemas con nivel de riesgo "{RISK_COLORS[filterRisk].text}"
                  </p>
                  <button
                    onClick={() => setFilterRisk(null)}
                    className="text-blue-300 text-sm font-semibold hover:text-blue-200 transition-colors"
                  >
                    Ver todos los sistemas
                  </button>
                </div>
              )}

              {/* List of pending obligations */}
              <motion.div
                className="space-y-3 max-h-96 overflow-y-auto pr-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredObligations.length > 0 ? filteredObligations.map((item) => (
                  <motion.div key={item.system_id} variants={itemVariants}>
                    <Link href={`/dashboard/inventory/${item.system_id}`}>
                      <div className="p-4 rounded-xl border border-gray-300/80 hover:border-blue-500/90 hover:bg-blue-50/80 transition-all cursor-pointer group bg-white/85 backdrop-blur-md shadow-sm hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.system_name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.completed_obligations} de {item.total_obligations} obligaciones completadas
                            </p>
                          </div>
                          <Badge className={`${
                            item.ai_act_level === 'prohibited' ? 'bg-red-100 text-red-800 border border-red-300/60' :
                            item.ai_act_level === 'high_risk' ? 'bg-orange-100 text-orange-800 border border-orange-300/60' :
                            item.ai_act_level === 'limited_risk' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300/60' :
                            item.ai_act_level === 'minimal_risk' ? 'bg-green-100 text-green-800 border border-green-300/60' :
                            'bg-gray-200 text-gray-800 border border-gray-400/60'
                          }`}>
                            {RISK_COLORS[item.ai_act_level].text}
                          </Badge>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-gray-300/40 rounded-full overflow-hidden mb-3 border border-gray-400/40">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.risk_management_progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        {/* Pending obligations list or completion status */}
                        <div className="space-y-1">
                          {item.pending_obligations.length > 0 ? (
                            <>
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Tareas pendientes ({item.pending_obligations.length}):
                              </p>
                              <div className="space-y-1">
                                {item.pending_obligations.slice(0, 3).map(obl => (
                                  <div key={obl.key} className="flex items-start gap-2 text-xs text-gray-600">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <span>{obl.title}</span>
                                  </div>
                                ))}
                                {item.pending_obligations.length > 3 && (
                                  <p className="text-xs text-blue-600 font-semibold mt-2">
                                    +{item.pending_obligations.length - 3} más...
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <p className="text-xs font-semibold text-green-700">
                                ✓ Todas las obligaciones completadas
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <ListTodo className="w-8 h-8 text-gray-400 mb-2 opacity-60 mx-auto" />
                    <p className="text-gray-600 text-sm">No hay sistemas para mostrar</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
