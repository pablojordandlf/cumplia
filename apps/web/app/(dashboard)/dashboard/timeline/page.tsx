'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertTriangle,
  Shield,
  Cpu,
} from 'lucide-react';

// ── AI Act milestones ─────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  date: string; // ISO date
  label: string;
  title: string;
  description: string;
  articles: string[];
  affectedLevels: ('prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'gpai')[];
  urgency: 'past' | 'imminent' | 'upcoming' | 'future';
}

const MILESTONES: Milestone[] = [
  {
    id: 'feb-2025',
    date: '2025-02-02',
    label: 'Feb 2025',
    title: 'Prohibiciones en vigor',
    description: 'Entran en vigor las prácticas de IA prohibidas (Art. 5) y las obligaciones de alfabetización en IA (Art. 4).',
    articles: ['Art. 5', 'Art. 4'],
    affectedLevels: ['prohibited'],
    urgency: 'past',
  },
  {
    id: 'aug-2025',
    date: '2025-08-02',
    label: 'Ago 2025',
    title: 'Obligaciones GPAI',
    description: 'Entran en vigor las obligaciones para modelos de IA de uso general (GPAI), incluyendo documentación técnica y política de derechos de autor.',
    articles: ['Arts. 51-55', 'Art. 53', 'Art. 55'],
    affectedLevels: ['gpai'],
    urgency: 'past',
  },
  {
    id: 'aug-2026',
    date: '2026-08-02',
    label: 'Ago 2026',
    title: 'Sistemas de alto riesgo (Anexo III)',
    description: 'Entran en vigor los requisitos para sistemas de alto riesgo del Anexo III: biometría, infraestructura crítica, educación, empleo, servicios esenciales, aplicación de ley, migración, justicia.',
    articles: ['Art. 6', 'Anexo III', 'Arts. 9-15', 'Art. 50'],
    affectedLevels: ['high_risk', 'limited_risk'],
    urgency: 'imminent',
  },
  {
    id: 'aug-2027',
    date: '2027-08-02',
    label: 'Ago 2027',
    title: 'Sistemas de alto riesgo (Anexo I)',
    description: 'Entran en vigor los requisitos para sistemas de alto riesgo del Anexo I: productos regulados por legislación sectorial (maquinaria, dispositivos médicos, vehículos, etc.).',
    articles: ['Art. 6(1)', 'Anexo I', 'Arts. 9-15'],
    affectedLevels: ['high_risk'],
    urgency: 'future',
  },
];

// ── Requirement cards per milestone ──────────────────────────────────────────

const MILESTONE_REQUIREMENTS: Record<string, string[]> = {
  'aug-2026': [
    'Sistema de gestión de riesgos (Art. 9)',
    'Gobernanza de datos de entrenamiento (Art. 10)',
    'Documentación técnica (Art. 11 + Anexo IV)',
    'Conservación de registros / logs (Art. 12)',
    'Transparencia e instrucciones de uso (Art. 13)',
    'Supervisión humana efectiva (Art. 14)',
    'Evaluación de conformidad previa al despliegue',
    'Registro en la base de datos de la UE',
  ],
  'aug-2027': [
    'Evaluación de conformidad por tercero certificado',
    'Documentación técnica según Anexo IV',
    'Marcado CE si aplica',
    'Declaración UE de conformidad',
  ],
  'feb-2025': [
    'Cesar uso de cualquier práctica prohibida (Art. 5)',
    'Programa de alfabetización en IA para el personal (Art. 4)',
  ],
  'aug-2025': [
    'Documentación técnica del modelo GPAI (Anexo XI)',
    'Política de respeto a derechos de autor',
    'Resumen del contenido de entrenamiento',
    'Evaluaciones adversariales si >10²⁵ FLOP (Art. 55)',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getUrgencyConfig(urgency: Milestone['urgency']) {
  const configs = {
    past: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
    imminent: { bg: 'bg-orange-50', border: 'border-orange-300', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    upcoming: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
    future: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  };
  return configs[urgency];
}

const LEVEL_CONFIG = {
  prohibited: { label: 'Prohibido', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle },
  high_risk: { label: 'Alto Riesgo', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: AlertTriangle },
  limited_risk: { label: 'Riesgo Limitado', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Shield },
  minimal_risk: { label: 'Riesgo Mínimo', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  gpai: { label: 'GPAI', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Cpu },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface AiSystem {
  id: string;
  name: string;
  ai_act_level: string | null;
  status: string | null;
}

export default function TimelinePage() {
  const [systems, setSystems] = useState<AiSystem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('use_cases')
        .select('id, name, ai_act_level, status')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      setSystems(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function getSystemsForMilestone(milestone: Milestone): AiSystem[] {
    const gpaiKeywords = ['gpai', 'gpai_model', 'gpai_sr', 'gpai_system'];
    return systems.filter(s => {
      const level = s.ai_act_level ?? '';
      return milestone.affectedLevels.some(al =>
        al === 'gpai' ? gpaiKeywords.includes(level) : al === level
      );
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarClock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timeline regulatorio</h1>
            <p className="text-sm text-gray-500">Hoja de ruta del AI Act — qué debes tener listo y cuándo</p>
          </div>
        </div>
      </div>

      {/* Today marker */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-blue-600 text-white rounded-xl">
        <Clock className="w-5 h-5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-sm">Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="text-blue-200 text-xs ml-3">El siguiente hito crítico es agosto 2026 — quedan {getDaysUntil('2026-08-02')} días</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {MILESTONES.map((milestone) => {
            const cfg = getUrgencyConfig(milestone.urgency);
            const affectedSystems = getSystemsForMilestone(milestone);
            const daysUntil = getDaysUntil(milestone.date);
            const requirements = MILESTONE_REQUIREMENTS[milestone.id] ?? [];

            return (
              <div key={milestone.id} className="relative flex gap-4">
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  milestone.urgency === 'past' ? 'bg-gray-100 border-gray-300' : `bg-white border-${cfg.dot.replace('bg-', '')}`
                }`}>
                  {milestone.urgency === 'past' ? (
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 rounded-xl border-2 p-4 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{milestone.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                          {milestone.label}
                        </span>
                        {milestone.urgency === 'past' && (
                          <span className="text-xs text-gray-400">En vigor</span>
                        )}
                        {milestone.urgency === 'imminent' && (
                          <span className="text-xs font-semibold text-orange-600">{daysUntil} días</span>
                        )}
                        {milestone.urgency === 'future' && (
                          <span className="text-xs text-blue-500">{Math.round(daysUntil / 30)} meses</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {milestone.articles.map(art => (
                      <span key={art} className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-600">
                        {art}
                      </span>
                    ))}
                  </div>

                  {/* Requirements */}
                  {requirements.length > 0 && milestone.urgency !== 'past' && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Requisitos</p>
                      <ul className="space-y-1">
                        {requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Affected systems */}
                  {!loading && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {affectedSystems.length > 0
                          ? `${affectedSystems.length} sistema${affectedSystems.length !== 1 ? 's' : ''} afectado${affectedSystems.length !== 1 ? 's' : ''}`
                          : 'Ningún sistema afectado'}
                      </p>
                      {affectedSystems.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {affectedSystems.map(sys => {
                            const level = sys.ai_act_level as keyof typeof LEVEL_CONFIG;
                            const levelCfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG['minimal_risk'];
                            const LevelIcon = levelCfg.icon;
                            return (
                              <Link
                                key={sys.id}
                                href={`/dashboard/inventory/${sys.id}`}
                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium hover:opacity-80 transition-opacity ${levelCfg.color}`}
                              >
                                <LevelIcon className="w-3 h-3" />
                                {sys.name}
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      {affectedSystems.length === 0 && systems.length > 0 && (
                        <p className="text-xs text-gray-400 italic">
                          {milestone.urgency === 'past'
                            ? 'No tienes sistemas en esta categoría.'
                            : 'Clasifica tus sistemas para ver si quedan afectados.'}
                        </p>
                      )}
                      {systems.length === 0 && (
                        <Link href="/dashboard/inventory" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          Registra tus sistemas de IA para ver el impacto
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info card */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-blue-700">
            <strong>Fuente:</strong> Reglamento (UE) 2024/1689, Artículo 113 — Entrada en vigor y aplicación.
            Las fechas exactas pueden variar según actos delegados de la Comisión Europea. Consulta siempre con tu asesor legal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
