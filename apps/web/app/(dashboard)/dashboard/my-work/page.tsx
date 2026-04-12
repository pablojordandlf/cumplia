'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Inbox,
  User,
} from 'lucide-react';

interface PendingObligation {
  id: string;
  obligation_title: string;
  obligation_key: string;
  is_completed: boolean;
  use_case_id: string;
  system_name: string;
  system_level: string;
}

interface PendingRisk {
  id: string;
  use_case_id: string;
  system_name: string;
  system_level: string;
  risk_name: string;
  status: string;
  probability: number | null;
  impact: number | null;
  due_date: string | null;
  responsible_person: string | null;
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  prohibited: { label: 'Prohibido', color: 'bg-red-100 text-red-700 border-red-200' },
  high_risk: { label: 'Alto Riesgo', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  limited_risk: { label: 'Riesgo Limitado', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  minimal_risk: { label: 'Riesgo Mínimo', color: 'bg-green-100 text-green-700 border-green-200' },
};

const RISK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  not_assessed: { label: 'Sin evaluar', color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  mitigated: { label: 'Mitigado', color: 'bg-green-100 text-green-700' },
  accepted: { label: 'Aceptado', color: 'bg-purple-100 text-purple-700' },
  transferred: { label: 'Transferido', color: 'bg-indigo-100 text-indigo-700' },
};

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function MyWorkPage() {
  const [obligations, setObligations] = useState<PendingObligation[]>([]);
  const [risks, setRisks] = useState<PendingRisk[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email ?? '');

    // Fetch all systems in org
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const orgId = membership?.organization_id;
    if (!orgId) { setLoading(false); return; }

    const { data: systems } = await supabase
      .from('use_cases')
      .select('id, name, ai_act_level')
      .eq('organization_id', orgId)
      .is('deleted_at', null);

    const systemIds = systems?.map(s => s.id) ?? [];
    const systemMap = Object.fromEntries((systems ?? []).map(s => [s.id, s]));

    if (systemIds.length === 0) { setLoading(false); return; }

    // Fetch my obligations (created by me or all pending)
    const { data: obls } = await supabase
      .from('use_case_obligations')
      .select('id, obligation_title, obligation_key, is_completed, use_case_id')
      .in('use_case_id', systemIds)
      .eq('is_completed', false);

    const mappedObls: PendingObligation[] = (obls ?? []).map(o => ({
      ...o,
      system_name: systemMap[o.use_case_id]?.name ?? '',
      system_level: systemMap[o.use_case_id]?.ai_act_level ?? '',
    }));

    // Fetch risks assigned to me
    const { data: riskData } = await supabase
      .from('use_case_risks')
      .select(`
        id, use_case_id, status, probability, impact, due_date, responsible_person,
        catalog_risk:risk_catalog(name)
      `)
      .in('use_case_id', systemIds)
      .neq('status', 'mitigated');

    const myRisks = (riskData ?? [])
      .filter(r => {
        if (!r.responsible_person) return false;
        const rp = r.responsible_person.toLowerCase();
        return rp === user.email?.toLowerCase() || rp === user.id;
      })
      .map(r => ({
        id: r.id,
        use_case_id: r.use_case_id,
        system_name: systemMap[r.use_case_id]?.name ?? '',
        system_level: systemMap[r.use_case_id]?.ai_act_level ?? '',
        risk_name: (Array.isArray(r.catalog_risk) ? r.catalog_risk[0] : r.catalog_risk)?.name ?? 'Riesgo sin nombre',
        status: r.status ?? 'not_assessed',
        probability: r.probability,
        impact: r.impact,
        due_date: r.due_date,
        responsible_person: r.responsible_person,
      }));

    setObligations(mappedObls);
    setRisks(myRisks);
    setLoading(false);
  }

  const completedObligations = obligations.filter(o => o.is_completed).length;
  const totalObligations = obligations.length;
  const overdueRisks = risks.filter(r => isOverdue(r.due_date));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi trabajo</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{totalObligations}</p>
          <p className="text-xs text-gray-500 mt-1">Obligaciones pendientes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{risks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Riesgos asignados</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${overdueRisks.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-3xl font-bold ${overdueRisks.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{overdueRisks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Riesgos vencidos</p>
        </div>
      </div>

      <Tabs defaultValue="obligations">
        <TabsList className="mb-4">
          <TabsTrigger value="obligations">
            Obligaciones ({totalObligations})
          </TabsTrigger>
          <TabsTrigger value="risks">
            Riesgos ({risks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obligations">
          {obligations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Sin obligaciones pendientes</p>
              <p className="text-xs text-gray-400 mt-1">¡Todo al día!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {obligations.map(obl => {
                const levelCfg = LEVEL_LABELS[obl.system_level] ?? { label: obl.system_level, color: 'bg-gray-100 text-gray-600' };
                return (
                  <Link key={obl.id} href={`/dashboard/inventory/${obl.use_case_id}`}>
                    <div className="card-interactive flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 group">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-blue-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{obl.obligation_title}</p>
                        <p className="text-xs text-gray-500 truncate">{obl.system_name}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${levelCfg.color}`}>
                        {levelCfg.label}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="risks">
          {risks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No tienes riesgos asignados</p>
              <p className="text-xs text-gray-400 mt-1">Los riesgos se asignan desde cada sistema de IA</p>
            </div>
          ) : (
            <div className="space-y-2">
              {risks.map(risk => {
                const statusCfg = RISK_STATUS_CONFIG[risk.status] ?? { label: risk.status, color: 'bg-gray-100 text-gray-600' };
                const overdue = isOverdue(risk.due_date);
                const daysUntil = risk.due_date ? getDaysUntil(risk.due_date) : null;
                return (
                  <Link key={risk.id} href={`/dashboard/inventory/${risk.use_case_id}`}>
                    <div className={`card-interactive flex items-center gap-3 p-3.5 border rounded-xl hover:bg-blue-50/30 group ${overdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <AlertTriangle className={`w-4 h-4 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{risk.risk_name}</p>
                        <p className="text-xs text-gray-500 truncate">{risk.system_name}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {risk.due_date && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${overdue ? 'bg-red-100 text-red-700 font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                            {overdue ? `Vencido hace ${Math.abs(daysUntil!)}d` : `${daysUntil}d`}
                          </span>
                        )}
                        <Badge variant="outline" className={`text-xs ${statusCfg.color}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
