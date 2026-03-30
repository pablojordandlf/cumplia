'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, RefreshCw, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemForReport {
  id: string;
  name: string;
  ai_act_level: string;
  status: string;
  created_at: string;
  obligations_total: number;
  obligations_completed: number;
  risks_total: number;
  risks_mitigated: number;
}

const LEVEL_CONFIG: Record<string, { label: string; icon: string; badge: string }> = {
  prohibited:   { label: 'Prohibido',       icon: '🔴', badge: 'bg-red-100 text-red-700 border-red-200'         },
  high_risk:    { label: 'Alto Riesgo',     icon: '🟠', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  limited_risk: { label: 'Riesgo Limitado', icon: '🟡', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  minimal_risk: { label: 'Riesgo Mínimo',   icon: '🟢', badge: 'bg-green-100 text-green-700 border-green-200'    },
  unclassified: { label: 'Sin clasificar',  icon: '⚪', badge: 'bg-gray-100 text-gray-600 border-gray-200'       },
};

export default function ReportsPage() {
  const [systems, setSystems] = useState<SystemForReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

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
        .select('id, name, ai_act_level, status, created_at')
        .is('deleted_at', null);

      if (membership?.organization_id) {
        q = q.or(`organization_id.eq.${membership.organization_id},user_id.eq.${session.user.id}`);
      } else {
        q = q.eq('user_id', session.user.id);
      }

      const { data: useCases } = await q.order('created_at', { ascending: false });
      if (!useCases?.length) { setSystems([]); setLoading(false); return; }

      const enriched: SystemForReport[] = await Promise.all(
        useCases.map(async (uc) => {
          const [{ data: obligations }, { data: risks }] = await Promise.all([
            supabase.from('use_case_obligations').select('status').eq('use_case_id', uc.id),
            supabase.from('ai_system_risks').select('status').eq('ai_system_id', uc.id),
          ]);

          return {
            id: uc.id,
            name: uc.name,
            ai_act_level: uc.ai_act_level || 'unclassified',
            status: uc.status || 'draft',
            created_at: uc.created_at,
            obligations_total: obligations?.length ?? 0,
            obligations_completed: obligations?.filter(o => o.status === 'completed').length ?? 0,
            risks_total: risks?.length ?? 0,
            risks_mitigated: risks?.filter(r => ['mitigated', 'accepted'].includes(r.status)).length ?? 0,
          };
        })
      );

      setSystems(enriched);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(system: SystemForReport) {
    setGenerating(system.id);
    try {
      const response = await fetch(`/api/v1/ai-systems/${system.id}/report`);
      if (!response.ok) {
        throw new Error('No se pudo generar el informe');
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe-cumplimiento-${system.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Informe generado', description: `Informe de "${system.name}" descargado correctamente.` });
      } else {
        const data = await response.json();
        toast({ title: 'Informe disponible', description: data.message ?? 'Informe generado.' });
      }
    } catch (err) {
      toast({
        title: 'Error al generar informe',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3E4E]">Reportes</h1>
          <p className="text-sm text-[#7a8a92] mt-1">Genera informes de cumplimiento AI Act en PDF para cada sistema</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-[#F5DFB3]/30 border border-[#E09E50]/30 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-[#E09E50] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#2D3E4E]">Informes de cumplimiento AI Act</p>
          <p className="text-xs text-[#7a8a92] mt-0.5">
            Cada informe incluye la ficha técnica del sistema, obligaciones por artículo, evaluación de riesgos
            y estado general de conformidad según el Reglamento de IA de la UE.
          </p>
        </div>
      </div>

      {/* Systems list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#E8ECEB] p-4 animate-pulse">
              <div className="h-5 w-48 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : systems.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8ECEB] p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#7a8a92] font-medium">No hay sistemas registrados</p>
          <p className="text-sm text-gray-400 mt-1">Añade sistemas de IA para poder generar informes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {systems.map(system => {
            const cfg = LEVEL_CONFIG[system.ai_act_level] ?? LEVEL_CONFIG.unclassified;
            const oblPct = system.obligations_total > 0
              ? Math.round((system.obligations_completed / system.obligations_total) * 100)
              : 0;
            const riskPct = system.risks_total > 0
              ? Math.round((system.risks_mitigated / system.risks_total) * 100)
              : 0;

            return (
              <div
                key={system.id}
                className="bg-white rounded-xl border border-[#E8ECEB] p-4 hover:border-[#E09E50]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{cfg.icon}</span>
                      <h3 className="font-semibold text-[#2D3E4E] truncate">{system.name}</h3>
                      <Badge className={`text-xs border ${cfg.badge}`}>{cfg.label}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-[#7a8a92]">
                      <span>
                        <span className="font-medium text-[#2D3E4E]">{system.obligations_completed}/{system.obligations_total}</span>
                        {' '}obligaciones ({oblPct}%)
                      </span>
                      <span>
                        <span className="font-medium text-[#2D3E4E]">{system.risks_mitigated}/{system.risks_total}</span>
                        {' '}riesgos mitigados ({riskPct}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(system.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => generateReport(system)}
                    disabled={generating === system.id}
                    className="flex-shrink-0 bg-[#E09E50] hover:bg-[#D9885F] text-white"
                  >
                    {generating === system.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1.5" />
                        Descargar PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
