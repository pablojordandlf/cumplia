'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemRiskStatus {
  system_id: string;
  system_name: string;
  ai_act_level: string;
  total_risks: number;
  completed_risks: number;  // accepted + mitigated
  progress_percentage: number;
}

const PRIORITY_ORDER: Record<string, number> = {
  prohibited: 1,
  high_risk: 2,
  limited_risk: 3,
  minimal_risk: 4,
};

const RISK_COLORS: Record<string, { badge: string; icon: string; text: string; bg: string; color: string; bgLight: string }> = {
  prohibited: { 
    badge: 'bg-[#F4E4D7] text-[#C92A2A] border border-[#C92A2A]/20', 
    icon: '🔴', 
    text: 'Prohibido',
    bg: 'bg-[#C92A2A]',
    color: 'text-[#C92A2A]',
    bgLight: 'bg-[#F4E4D7]'
  },
  high_risk: { 
    badge: 'bg-[#FFE8D1] text-[#D97706] border border-[#D97706]/20', 
    icon: '🟠', 
    text: 'Alto Riesgo',
    bg: 'bg-[#D97706]',
    color: 'text-[#D97706]',
    bgLight: 'bg-[#FFE8D1]'
  },
  limited_risk: { 
    badge: 'bg-[#FFF8DC] text-[#B8860B] border border-[#B8860B]/20', 
    icon: '🟡', 
    text: 'Limitado',
    bg: 'bg-[#B8860B]',
    color: 'text-[#B8860B]',
    bgLight: 'bg-[#FFF8DC]'
  },
  minimal_risk: { 
    badge: 'bg-[#E8F5E3] text-[#27A844] border border-[#27A844]/20', 
    icon: '🟢', 
    text: 'Mínimo',
    bg: 'bg-[#27A844]',
    color: 'text-[#27A844]',
    bgLight: 'bg-[#E8F5E3]'
  },
  unclassified: { 
    badge: 'bg-[#E8ECEB] text-[#707070] border border-[#707070]/20', 
    icon: '⚪', 
    text: 'Sin clasificar',
    bg: 'bg-[#707070]',
    color: 'text-[#707070]',
    bgLight: 'bg-[#E8ECEB]'
  },
};

export function PendingObligationsWidget() {
  const [systems, setSystems] = useState<SystemRiskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemRiskStatus();
  }, []);

  async function fetchSystemRiskStatus() {
    try {
      setLoading(true);
      
      // Try API first
      try {
        const response = await fetch('/api/v1/use-cases/stats/risk-progress');
        
        if (response.ok) {
          const data = await response.json();
          
          // Convert API response to our format
          const systemsData: SystemRiskStatus[] = data.map((item: any) => ({
            system_id: item.use_case_id,
            system_name: item.use_case_name,
            ai_act_level: item.ai_act_level,
            total_risks: item.total_risks,
            completed_risks: item.completed_risks,
            progress_percentage: item.progress_percentage,
          }));
          
          // Sort by priority
          systemsData.sort((a, b) => {
            const priorityA = PRIORITY_ORDER[a.ai_act_level] || 999;
            const priorityB = PRIORITY_ORDER[b.ai_act_level] || 999;
            return priorityA - priorityB;
          });
          
          setSystems(systemsData);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, falling back to Supabase:', apiError);
      }
      
      // Fallback: fetch from Supabase
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

      const { data: systemsData } = await systemsQuery.order('created_at', { ascending: false });

      if (!systemsData || systemsData.length === 0) {
        setSystems([]);
        return;
      }

      // For each system, fetch its risk status
      const systemsList: SystemRiskStatus[] = [];

      for (const system of systemsData) {
        const { data: risks } = await supabase
          .from('ai_system_risks')
          .select('status')
          .eq('ai_system_id', system.id)
          .in('status', ['accepted', 'mitigated', 'assessed', 'identified']);

        const totalRisks = risks?.length || 0;
        const completedRisks = risks?.filter(r => r.status === 'accepted' || r.status === 'mitigated').length || 0;
        const progress = totalRisks > 0 ? Math.round((completedRisks / totalRisks) * 100) : 0;

        systemsList.push({
          system_id: system.id,
          system_name: system.name,
          ai_act_level: system.ai_act_level || 'unclassified',
          total_risks: totalRisks,
          completed_risks: completedRisks,
          progress_percentage: progress,
        });
      }

      // Sort by priority
      systemsList.sort((a, b) => {
        const priorityA = PRIORITY_ORDER[a.ai_act_level] || 999;
        const priorityB = PRIORITY_ORDER[b.ai_act_level] || 999;
        return priorityA - priorityB;
      });

      setSystems(systemsList);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estados de riesgos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredSystems = filterRisk
    ? systems.filter(s => s.ai_act_level === filterRisk)
    : systems;

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

  const riskLevels = Object.keys(RISK_COLORS).filter(level => 
    systems.some(s => s.ai_act_level === level)
  );

  if (loading) {
    return (
      <div className="rounded-lg border border-[#E8ECEB] bg-white p-6">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
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
      <div className="rounded-lg border border-[#E8ECEB] bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-[#E09E50]" />
            <h3 className="text-sm font-semibold text-[#2D3E4E]">Obligaciones Pendientes</h3>
          </div>
          <span className="text-xs text-[#7a8a92]">{filteredSystems.length} sistemas</span>
        </div>

        {/* Risk Level Filter */}
        {riskLevels.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <motion.button
              onClick={() => setFilterRisk(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                filterRisk === null
                  ? 'bg-[#2D3E4E] text-white'
                  : 'bg-[#E8ECEB] text-[#7a8a92] hover:bg-gray-200'
              }`}
            >
              Todos
            </motion.button>
            {riskLevels.map(level => {
              const colors = RISK_COLORS[level];
              return (
                <motion.button
                  key={level}
                  onClick={() => setFilterRisk(level)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    filterRisk === level
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

        {/* Systems List */}
        {filteredSystems.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSystems.map(system => {
              const colors = RISK_COLORS[system.ai_act_level];
              const isCompleted = system.completed_risks === system.total_risks;

              return (
                <motion.div
                  key={system.system_id}
                  variants={itemVariants}
                  className="group rounded-lg border border-[#E8ECEB] bg-[#F8FAFB] p-4 transition-all hover:border-[#E09E50]/40 hover:bg-white"
                >
                  <Link href={`/dashboard/inventory/${system.system_id}`}>
                    <div className="space-y-3 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{colors.icon}</span>
                            <h4 className="font-medium text-[#2D3E4E] group-hover:text-[#E09E50] transition-colors truncate">
                              {system.system_name}
                            </h4>
                          </div>
                          <Badge className={`mt-2 ${colors.badge}`}>
                            {colors.text}
                          </Badge>
                        </div>
                        <div className="text-right">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-[#27A844]" />
                          ) : (
                            <Clock className="h-5 w-5 text-[#D97706]" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#7a8a92]">Evaluación de Riesgos</span>
                          <span className={`font-medium ${colors.color}`}>
                            {system.completed_risks}/{system.total_risks}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#E8ECEB] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${system.progress_percentage}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full ${colors.bg} rounded-full`}
                          />
                        </div>
                        <div className="text-right text-xs text-[#7a8a92]">
                          {system.progress_percentage}% completado
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-[#7a8a92]">
            <p className="text-sm">No hay sistemas en esta categoría</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
