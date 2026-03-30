'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Save,
  CheckCircle2,
  FileDown,
} from 'lucide-react';

// ── Annex IV sections ─────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  article: string;
  description: string;
  fields: Field[];
}

interface Field {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
  type: 'textarea' | 'input';
}

const SECTIONS: Section[] = [
  {
    id: 'general',
    title: 'Descripción general del sistema',
    article: 'Anexo IV §1',
    description: 'Propósito del sistema, usuarios previstos y contexto de despliegue.',
    fields: [
      {
        key: 'system_purpose',
        label: 'Finalidad y objetivo del sistema',
        placeholder: 'Describe para qué sirve el sistema, qué problema resuelve y qué resultados produce (predicciones, recomendaciones, decisiones...).',
        hint: 'Sé específico: qué hace el sistema y para qué se usa concretamente.',
        type: 'textarea',
      },
      {
        key: 'intended_users',
        label: 'Usuarios y destinatarios previstos',
        placeholder: 'Ej: operadores de call center, médicos, responsables de RRHH, ciudadanos...',
        hint: 'Incluye tanto los usuarios que operan el sistema como las personas afectadas por sus decisiones.',
        type: 'textarea',
      },
      {
        key: 'deployment_context',
        label: 'Contexto de despliegue',
        placeholder: 'Ej: desplegado en producción en España, accesible vía API, integrado en el ERP corporativo...',
        hint: 'Describe el entorno técnico y geográfico donde opera el sistema.',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Arquitectura y desarrollo',
    article: 'Anexo IV §2',
    description: 'Descripción técnica del sistema, datos de entrenamiento y metodología.',
    fields: [
      {
        key: 'architecture_description',
        label: 'Arquitectura del sistema',
        placeholder: 'Ej: modelo de clasificación basado en Random Forest, pipeline de NLP con BERT, red neuronal convolucional...',
        hint: 'Describe los componentes técnicos principales y cómo interactúan.',
        type: 'textarea',
      },
      {
        key: 'training_data_description',
        label: 'Descripción de los datos de entrenamiento',
        placeholder: 'Ej: dataset de 50.000 registros de clientes de 2020-2023, datos anonimizados, procedentes de...',
        hint: 'Incluye origen, volumen, periodo temporal y características de los datos. Menciona si contienen datos personales.',
        type: 'textarea',
      },
      {
        key: 'training_methodology',
        label: 'Metodología de desarrollo y entrenamiento',
        placeholder: 'Ej: entrenamiento supervisado con validación cruzada 80/20, fine-tuning sobre modelo base, evaluación con métricas F1...',
        hint: 'Describe el proceso de desarrollo, validación y pruebas realizadas.',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'performance',
    title: 'Métricas de rendimiento',
    article: 'Anexo IV §3 + Art. 15',
    description: 'Precisión, robustez y limitaciones conocidas del sistema.',
    fields: [
      {
        key: 'accuracy_metrics',
        label: 'Métricas de precisión y rendimiento',
        placeholder: 'Ej: precisión 94%, recall 91%, F1-score 92% en dataset de prueba de 10.000 casos...',
        hint: 'Incluye las métricas relevantes para el tipo de sistema y cómo se midieron.',
        type: 'textarea',
      },
      {
        key: 'robustness_measures',
        label: 'Medidas de robustez y ciberseguridad',
        placeholder: 'Ej: validación de inputs, detección de anomalías, pruebas adversariales, cifrado de datos...',
        hint: 'Describe las medidas implementadas para garantizar el funcionamiento correcto ante errores o ataques.',
        type: 'textarea',
      },
      {
        key: 'known_limitations',
        label: 'Limitaciones conocidas y sesgos',
        placeholder: 'Ej: menor precisión en grupos de edad >75 años, no funciona con inputs en idiomas distintos al español...',
        hint: 'Documenta honestamente las limitaciones, condiciones de fallo y posibles sesgos identificados.',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'risk',
    title: 'Gestión de riesgos',
    article: 'Anexo IV §4 + Art. 9',
    description: 'Resumen del sistema de gestión de riesgos implementado.',
    fields: [
      {
        key: 'risk_management_summary',
        label: 'Resumen del sistema de gestión de riesgos',
        placeholder: 'Ej: se ha realizado análisis FMEA con identificación de 12 riesgos, 8 mitigados, revisión semestral planificada...',
        hint: 'Referencia el análisis de riesgos realizado en la plataforma. Describe el proceso iterativo y las medidas adoptadas.',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'versioning',
    title: 'Versiones y cambios',
    article: 'Anexo IV §5',
    description: 'Control de versiones del sistema y registro de cambios significativos.',
    fields: [
      {
        key: 'version',
        label: 'Versión actual del sistema',
        placeholder: 'Ej: 2.1.0',
        hint: 'Versión del sistema en producción.',
        type: 'input',
      },
      {
        key: 'change_log',
        label: 'Registro de cambios (changelog)',
        placeholder: 'v2.1.0 (mar 2026): mejora de precisión en +3%. v2.0.0 (ene 2026): rediseño del modelo...',
        hint: 'Documenta los cambios significativos en el sistema, especialmente los que afecten al rendimiento o comportamiento.',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'oversight',
    title: 'Supervisión humana',
    article: 'Anexo IV §6 + Art. 14',
    description: 'Medidas de supervisión humana y mecanismos de parada.',
    fields: [
      {
        key: 'human_oversight_measures',
        label: 'Medidas de supervisión humana',
        placeholder: 'Ej: todas las decisiones con puntuación <70% requieren revisión humana, panel de control con alertas en tiempo real...',
        hint: 'Describe cómo se garantiza que el personal pueda entender, supervisar y corregir las salidas del sistema.',
        type: 'textarea',
      },
      {
        key: 'stop_mechanism',
        label: 'Mecanismo de parada / botón de emergencia',
        placeholder: 'Ej: los operadores pueden desactivar el sistema desde el panel de administración; en caso de incidente, el sistema se pausa automáticamente...',
        hint: 'Documenta cómo se puede interrumpir el sistema en caso de comportamiento inesperado (Art. 14 — "botón de parada").',
        type: 'textarea',
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

type DocFields = Record<string, string>;

export default function TechnicalDocsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [systemName, setSystemName] = useState('');
  const [systemLevel, setSystemLevel] = useState('');
  const [doc, setDoc] = useState<DocFields>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data: system } = await supabase
      .from('use_cases')
      .select('name, ai_act_level')
      .eq('id', id)
      .single();

    setSystemName(system?.name ?? '');
    setSystemLevel(system?.ai_act_level ?? '');

    const res = await fetch(`/api/v1/ai-systems/${id}/technical-docs`);
    if (res.ok) {
      const data = await res.json();
      if (data.doc) {
        setDoc(data.doc);
        setCompleteness(data.doc.completeness_score ?? 0);
      }
    }
    setLoading(false);
  }

  function handleChange(key: string, value: string) {
    setDoc(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/ai-systems/${id}/technical-docs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      setCompleteness(data.doc?.completeness_score ?? 0);
      toast({ title: 'Guardado', description: 'Documentación técnica guardada correctamente.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  const section = SECTIONS[currentStep];
  const totalFields = SECTIONS.flatMap(s => s.fields).length;
  const filledFields = SECTIONS.flatMap(s => s.fields).filter(f => doc[f.key]?.trim()).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/inventory/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ChevronLeft className="w-4 h-4" />
          Volver a {systemName}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Documentación técnica</h1>
              <p className="text-sm text-gray-500">Art. 11 + Anexo IV — {systemName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{completeness}%</span>
            <p className="text-xs text-gray-500">completado</p>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={completeness} className="h-2" />
          <p className="text-xs text-gray-400 mt-1">{filledFields} de {totalFields} campos rellenos</p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {SECTIONS.map((s, i) => {
          const sectionFilled = s.fields.every(f => doc[f.key]?.trim());
          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
                i === currentStep
                  ? 'bg-blue-600 text-white border-blue-600'
                  : sectionFilled
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {sectionFilled && i !== currentStep && <CheckCircle2 className="w-3 h-3" />}
              <span>{i + 1}. {s.title.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          );
        })}
      </div>

      {/* Current section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
          <Badge variant="outline" className="text-xs">{section.article}</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-6">{section.description}</p>

        <div className="space-y-6">
          {section.fields.map(field => (
            <div key={field.key}>
              <Label className="font-medium text-gray-900 mb-1.5 block">{field.label}</Label>
              <p className="text-xs text-gray-400 mb-2">{field.hint}</p>
              {field.type === 'textarea' ? (
                <Textarea
                  value={doc[field.key] ?? ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[100px] text-sm"
                />
              ) : (
                <Input
                  value={doc[field.key] ?? ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>

        {currentStep < SECTIONS.length - 1 ? (
          <Button onClick={() => setCurrentStep(s => s + 1)}>
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={async () => { await handleSave(); router.push(`/dashboard/inventory/${id}`); }}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Finalizar
          </Button>
        )}
      </div>

      {systemLevel !== 'high_risk' && (
        <p className="text-xs text-center text-gray-400 mt-4">
          Este documento es obligatorio para sistemas de alto riesgo (Art. 11). Para tu sistema de riesgo {systemLevel === 'limited_risk' ? 'limitado' : systemLevel === 'minimal_risk' ? 'mínimo' : 'desconocido'}, es una buena práctica.
        </p>
      )}
    </div>
  );
}
