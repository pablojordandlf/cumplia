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

        // Only show systems with pending obligations
        if (pending.length > 0) {
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
    <div className="glass rounded-2xl border border-white/20">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Obligaciones Pendientes
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
              Acciones requeridas para mantener el cumplimiento normativo
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
            {filteredObligations.length} sistema{filteredObligations.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-700 dark:text-gray-500">Cargando...</span>
            </div>
          ) : filteredObligations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500 mb-3 opacity-50" />
              <p className="text-gray-900 dark:text-gray-300 font-medium">
                {filterRisk ? `No hay obligaciones pendientes con nivel ${filterRisk}` : '¡Todas las obligaciones completadas!'}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-500 mt-1">
                Buen trabajo manteniendo el cumplimiento
              </p>
            </div>
          ) : (
            <>
              {/* Quick filter by risk level */}
              <div className="flex gap-2 pb-4 border-b border-white/10 overflow-x-auto">
                <button
                  onClick={() => setFilterRisk(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterRisk === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Todos
                </button>
                {['prohibited', 'high_risk', 'limited_risk', 'minimal_risk'].map(level => {
                  const count = obligations.filter(o => o.ai_act_level === level).length;
                  return (
                    <button
                      key={level}
                      onClick={() => setFilterRisk(level)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        filterRisk === level
                          ? `${RISK_COLORS[level].badge} cursor-pointer`
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {RISK_COLORS[level].icon} {count}
                    </button>
                  );
                })}
              </div>

              {/* List of pending obligations */}
              <motion.div
                className="space-y-3 max-h-96 overflow-y-auto pr-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredObligations.map((item) => (
                  <motion.div key={item.system_id} variants={itemVariants}>
                    <Link href={`/dashboard/inventory/${item.system_id}`}>
                      <div className="p-4 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group bg-white/5 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.system_name}
                            </h4>
                            <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">
                              {item.completed_obligations} de {item.total_obligations} obligaciones completadas
                            </p>
                          </div>
                          <Badge className={RISK_COLORS[item.ai_act_level].badge}>
                            {RISK_COLORS[item.ai_act_level].text}
                          </Badge>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.risk_management_progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        {/* Pending obligations list */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-500 mb-2">
                            Tareas pendientes ({item.pending_obligations.length}):
                          </p>
                          <div className="space-y-1">
                            {item.pending_obligations.slice(0, 3).map(obl => (
                              <div key={obl.key} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-400">
                                <span className="text-gray-400 dark:text-gray-600 mt-0.5">•</span>
                                <span>{obl.title}</span>
                              </div>
                            ))}
                            {item.pending_obligations.length > 3 && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
                                +{item.pending_obligations.length - 3} más...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
