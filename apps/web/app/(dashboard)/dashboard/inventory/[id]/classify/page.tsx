'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  Shield,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Brain,
  Cpu,
  Sparkles,
  Bot,
  MessageSquare,
  X,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { supabase } from '@/lib/supabase';
import { AIClassificationAssistant } from '@/components/ai-classification-assistant';

// ── Schema ───────────────────────────────────────────────────────────────────

const yesNo = z.enum(['yes', 'no']);

const classificationSchema = z.object({
  systemType: z.enum(['gpai_base', 'gpai_systemic', 'specific', 'multipurpose']),
  p2_1: yesNo, p2_2: yesNo, p2_3: yesNo, p2_3a: yesNo,
  p2_4: yesNo, p2_5: yesNo, p2_6: yesNo,
  p3_1: yesNo, p3_2: yesNo, p3_3: yesNo, p3_3a: yesNo,
  p3_4: yesNo, p3_5: yesNo, p3_6: yesNo,
  p3_7: yesNo, p3_8: yesNo, p3_9: yesNo,
  p4_1: yesNo, p4_2: yesNo, p4_3: yesNo, p4_4: yesNo,
});

type FormValues = z.infer<typeof classificationSchema>;

// ── Constants ────────────────────────────────────────────────────────────────

const riskLevels = {
  prohibited: { label: 'Prohibido', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, description: 'Este sistema de IA está prohibido por el Artículo 5 del AI Act y no puede desplegarse en la UE.' },
  high_risk: { label: 'Alto Riesgo', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, description: 'Sistema de alto riesgo sujeto a obligaciones estrictas de cumplimiento (Arts. 9-15).' },
  gpai_regime: { label: 'Régimen GPAI', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Brain, description: 'Modelo de IA de propósito general sujeto a las obligaciones del Artículo 53 del AI Act.' },
  limited_risk: { label: 'Riesgo Limitado', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Shield, description: 'Sujeto a obligaciones de transparencia (Art. 50).' },
  minimal_risk: { label: 'Riesgo Mínimo', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, description: 'Libre uso con recomendación de códigos de conducta voluntarios.' },
};

const systemTypes = [
  {
    value: 'gpai_base' as const,
    label: 'Modelo GPAI',
    description: 'Entreno y distribuyo un modelo base sin interfaz ni caso de uso propio',
    examples: 'LLM propio, modelo de embeddings propietario',
    badge: null as string | null,
    icon: Brain,
    tooltip: 'Un modelo GPAI (General Purpose AI) es un modelo entrenado con grandes cantidades de datos que puede realizar múltiples tipos de tareas. Si eres tú quien lo entrena y lo distribuye —sin definir un caso de uso concreto— selecciona esta opción. Si lo que haces es usar un modelo de otro (OpenAI, Anthropic, etc.) para construir tu aplicación, no eres proveedor de un modelo GPAI.',
  },
  {
    value: 'gpai_systemic' as const,
    label: 'Modelo GPAI de alto impacto',
    description: 'Mi modelo supera 10²⁵ FLOP de entrenamiento o ha sido designado por la Comisión Europea',
    examples: 'Modelos frontier de grandes laboratorios de IA',
    badge: null as string | null,
    icon: Sparkles,
    tooltip: 'El AI Act define un umbral cuantitativo de 10²⁵ FLOP de cómputo de entrenamiento para considerar un modelo GPAI de "riesgo sistémico". También puede ser designado por la Comisión Europea en base a otros criterios como el número de usuarios o capacidades en dominios críticos. Esta categoría aplica a muy pocos actores a nivel mundial.',
  },
  {
    value: 'specific' as const,
    label: 'Sistema con finalidad definida',
    description: 'Aplico IA a un caso de uso concreto, aunque use un modelo de terceros',
    examples: 'Chatbot, detector de fraude, scoring de crédito, generador de contratos',
    badge: '★ más habitual' as string | null,
    icon: Cpu,
    tooltip: 'Es la categoría más frecuente para PYMEs. Si tu sistema tiene un propósito claro y específico —aunque por debajo use GPT-4 u otro modelo— selecciona esta opción. La finalidad concreta es lo que determina el riesgo regulatorio, no el modelo subyacente.',
  },
  {
    value: 'multipurpose' as const,
    label: 'Sistema con múltiples usos',
    description: 'Mi sistema puede aplicarse a distintos casos de uso sin uno único definido',
    examples: 'Plataforma de automatización corporativa, asistente IA multiuso interno',
    badge: null as string | null,
    icon: Bot,
    tooltip: 'Selecciona esta opción si tu sistema está diseñado para que distintos departamentos o clientes lo usen con finalidades diferentes, sin una única función predefinida. En este caso, el AI Act exige evaluar el riesgo por cada caso de uso concreto. CumplIA te mostrará una advertencia para que repitas la evaluación por cada uso previsto.',
  },
];

const YES_NO_FIELDS: (keyof FormValues)[] = [
  'p2_1', 'p2_2', 'p2_3', 'p2_3a', 'p2_4', 'p2_5', 'p2_6',
  'p3_1', 'p3_2', 'p3_3', 'p3_3a', 'p3_4', 'p3_5', 'p3_6', 'p3_7', 'p3_8', 'p3_9',
  'p4_1', 'p4_2', 'p4_3', 'p4_4',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 150 && window.innerHeight - rect.bottom > 150) setPosition('bottom');
      else setPosition('top');
    }
  }, [show]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center ml-2" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
      {show && (
        <div className={`absolute ${position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} left-1/2 -translate-x-1/2 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl z-[9999] w-80 leading-relaxed pointer-events-none`}>
          {text}
          <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent ${position === 'top' ? 'top-full border-t-8 border-t-gray-900' : 'bottom-full border-b-8 border-b-gray-900'}`} />
        </div>
      )}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function YesNoSelector({ value, onChange, label, tooltip, isAiFilling, aiFilled }: {
  value: string;
  onChange: (val: 'yes' | 'no') => void;
  label: string;
  tooltip?: string;
  isAiFilling?: boolean;
  aiFilled?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer
        ${aiFilled ? 'border-blue-300 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'}`}
      onClick={() => onChange(value === 'yes' ? 'no' : 'yes')}
    >
      {/* AI wave animation overlay — overflow-hidden aquí para no clipar el tooltip */}
      {isAiFilling && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="h-full bg-gradient-to-r from-blue-100/0 via-blue-200/60 to-blue-100/0 animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      )}
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-medium text-gray-900 text-sm">{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => onChange('yes')} className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${value === 'yes' ? 'bg-green-500 text-white shadow-md ring-2 ring-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Sí</button>
          <button type="button" onClick={() => onChange('no')} className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${value === 'no' ? 'bg-gray-500 text-white shadow-md ring-2 ring-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>No</button>
        </div>
      </div>
      {aiFilled && (
        <div className="flex items-center gap-1 mt-2 relative z-10">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-blue-600 font-medium">Completado por IA</span>
        </div>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ClassifyUseCasePage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;
  const [useCase, setUseCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{ level: string; transparencyRequired: boolean } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [finalStepReady, setFinalStepReady] = useState(false);

  // AI auto-fill state
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [aiFillProgress, setAiFillProgress] = useState(0);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [unclearQuestions, setUnclearQuestions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(classificationSchema),
    defaultValues: {
      systemType: 'specific',
      p2_1: 'no', p2_2: 'no', p2_3: 'no', p2_3a: 'no', p2_4: 'no', p2_5: 'no', p2_6: 'no',
      p3_1: 'no', p3_2: 'no', p3_3: 'no', p3_3a: 'no', p3_4: 'no', p3_5: 'no', p3_6: 'no',
      p3_7: 'no', p3_8: 'no', p3_9: 'no',
      p4_1: 'no', p4_2: 'no', p4_3: 'no', p4_4: 'no',
    },
  });

  const selectedSystemType = form.watch('systemType');
  const p2_3Value = form.watch('p2_3');
  const p3_3Value = form.watch('p3_3');

  const isGPAI = selectedSystemType === 'gpai_base' || selectedSystemType === 'gpai_systemic';

  useEffect(() => { loadUseCase(); }, [useCaseId]);

  const totalSteps = isGPAI ? 3 : 4;

  useEffect(() => {
    if (currentStep === totalSteps) {
      setFinalStepReady(false);
      const timer = setTimeout(() => setFinalStepReady(true), 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, totalSteps]);

  async function loadUseCase() {
    try {
      const { data, error } = await supabase.from('use_cases').select('*').eq('id', useCaseId).single();
      if (error) throw error;
      setUseCase(data);
      if (data?.classification_data && !data.classification_data.ai_assisted) {
        const prevData = data.classification_data;
        const knownTypes = ['gpai_base', 'gpai_systemic', 'specific', 'multipurpose'];
        if (knownTypes.includes(prevData.systemType) || prevData.p2_1 !== undefined) {
          const convertedData: Partial<FormValues> = { systemType: prevData.systemType || 'specific' };
          YES_NO_FIELDS.forEach(key => {
            if (prevData[key] === 'yes' || prevData[key] === 'no') {
              (convertedData as any)[key] = prevData[key];
            }
          });
          form.reset(convertedData as FormValues);
        }
      }
    } catch (error) {
      console.error('Error loading use case:', error);
      toast.error('Error', { description: 'No se pudo cargar el sistema de IA' });
      router.push('/dashboard/inventory');
    } finally { setLoading(false); }
  }

  // ── AI Auto-fill ──────────────────────────────────────────────────────────

  async function handleAiFill() {
    if (!useCase) return;
    setIsAiFilling(true);
    setAiFillProgress(0);
    setAiFilledFields(new Set());
    setUnclearQuestions([]);

    try {
      const res = await fetch('/api/v1/classify/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'autofill',
          systemName: useCase.name,
          systemDescription: useCase.description,
          sector: useCase.sector,
        }),
      });

      if (!res.ok) throw new Error('Error al analizar el sistema');
      const data = await res.json();

      if (!data.answers) throw new Error('Respuesta inválida');

      // Animate filling each field with a stagger
      const answers = data.answers as Record<string, string>;
      const fieldsToFill = Object.keys(answers).filter(
        k => answers[k] === 'yes' || answers[k] === 'no' || k === 'systemType'
      );

      // Fill systemType immediately
      if (answers.systemType) {
        form.setValue('systemType', answers.systemType as any);
      }

      // Animate yes/no fields
      for (let i = 0; i < fieldsToFill.length; i++) {
        const key = fieldsToFill[i];
        if (key === 'systemType') continue;
        const value = answers[key];
        if (value === 'yes' || value === 'no') {
          await new Promise(r => setTimeout(r, 80)); // stagger delay
          form.setValue(key as any, value as any);
          setAiFilledFields(prev => new Set([...prev, key]));
          setAiFillProgress(Math.round(((i + 1) / fieldsToFill.length) * 100));
        }
      }

      // Handle unclear fields
      const unclear = data.unclear_fields || [];
      const questions = data.unclear_questions || [];
      if (unclear.length > 0 && questions.length > 0) {
        setUnclearQuestions(questions);
        setShowChat(true);
        toast.success('Necesito más información', { description: `La IA necesita aclarar ${unclear.length} preguntas. Se ha abierto el chat.` });
      } else {
        toast.success('Cuestionario completado por IA', { description: `Confianza: ${data.confidence === 'high' ? 'Alta' : data.confidence === 'medium' ? 'Media' : 'Baja'}. Revisa las respuestas antes de finalizar.` });
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message ?? 'No se pudo completar con IA' });
    } finally {
      setIsAiFilling(false);
      setAiFillProgress(100);
    }
  }

  // ── Classification logic ──────────────────────────────────────────────────

  function calculateRiskLevel(values: FormValues): { level: string; transparencyRequired: boolean } {
    const transparencyRequired =
      values.p4_1 === 'yes' || values.p4_2 === 'yes' || values.p4_3 === 'yes' || values.p4_4 === 'yes';

    const isProhibited =
      values.p2_1 === 'yes' || values.p2_2 === 'yes' ||
      (values.p2_3 === 'yes' && values.p2_3a !== 'yes') ||
      values.p2_4 === 'yes' || values.p2_5 === 'yes' || values.p2_6 === 'yes';
    if (isProhibited) return { level: 'prohibited', transparencyRequired };

    if (values.systemType === 'gpai_systemic') return { level: 'high_risk', transparencyRequired };

    const isHighRisk =
      (values.p2_3 === 'yes' && values.p2_3a === 'yes') ||
      values.p3_1 === 'yes' || values.p3_2 === 'yes' ||
      (values.p3_3 === 'yes' && values.p3_3a === 'yes') ||
      values.p3_4 === 'yes' || values.p3_5 === 'yes' || values.p3_6 === 'yes' ||
      values.p3_7 === 'yes' || values.p3_8 === 'yes' || values.p3_9 === 'yes';
    if (isHighRisk) return { level: 'high_risk', transparencyRequired };

    if (values.systemType === 'gpai_base') return { level: 'gpai_regime', transparencyRequired };
    if (values.systemType === 'multipurpose') return { level: 'limited_risk', transparencyRequired };
    if (transparencyRequired) return { level: 'limited_risk', transparencyRequired };
    return { level: 'minimal_risk', transparencyRequired };
  }

  async function onSubmit(values: FormValues) {
    setCalculating(true);
    try {
      const classificationResult = calculateRiskLevel(values);
      const { data: { session } } = await supabase.auth.getSession();

      const classificationData = {
        ...values,
        p2_3a: values.p2_3 === 'yes' ? values.p2_3a : null,
        p3_3a: values.p3_3 === 'yes' ? values.p3_3a : null,
      };

      await supabase.from('use_cases').update({
        ai_act_level: classificationResult.level,
        classification_data: classificationData,
        status: 'classified',
        updated_at: new Date().toISOString(),
      }).eq('id', useCaseId);

      const { data: existingVersions } = await supabase
        .from('use_case_versions')
        .select('id')
        .eq('use_case_id', useCaseId)
        .limit(1);

      if (!existingVersions || existingVersions.length === 0) {
        await supabase.from('use_case_versions').insert({
          use_case_id: useCaseId,
          version_number: 1,
          classification_data: classificationData,
          ai_act_level: classificationResult.level,
          created_by: session?.user?.id,
          notes: 'Versión inicial - Primera clasificación',
        });
      }

      setResult(classificationResult);
      toast.success('Clasificación Completada', {
        description: `El sistema ha sido clasificado como: ${riskLevels[classificationResult.level as keyof typeof riskLevels].label}`,
      });
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'No se pudo guardar' });
    } finally { setCalculating(false); }
  }

  // ── Step navigation ───────────────────────────────────────────────────────

  const progressValue = (currentStep / totalSteps) * 100;

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-48" /><div className="h-64 bg-muted rounded w-96" /></div>
    </div>
  );

  if (result) {
    const riskInfo = riskLevels[result.level as keyof typeof riskLevels];
    const RiskIcon = riskInfo.icon;
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 ${riskInfo.color.split(' ')[0]} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <RiskIcon className={`w-10 h-10 ${riskInfo.color.split(' ')[1]}`} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Clasificación Completada</h1>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge className={`text-lg px-4 py-1 ${riskInfo.color}`}>{riskInfo.label}</Badge>
                {result.transparencyRequired && (
                  <Badge className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                    Transparencia obligatoria (Art. 50)
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-6">{riskInfo.description}</p>
              {result.level === 'limited_risk' && form.getValues('systemType') === 'multipurpose' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    <strong>Aviso:</strong> Este sistema tiene múltiples usos. El AI Act exige evaluar el riesgo por cada caso de uso concreto. Repite esta clasificación para cada finalidad prevista.
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">{useCase?.name}</h3>
                <p className="text-sm text-gray-600">{useCase?.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/inventory"><Button size="lg">Ver en el Inventario</Button></Link>
                <Link href={`/dashboard/inventory/${useCaseId}`}><Button variant="outline" size="lg">Ver Detalles</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Inventario', href: '/dashboard/inventory' },
            { label: useCase?.name || '...', href: `/dashboard/inventory/${useCaseId}` },
            { label: 'Clasificar' },
          ]}
        />
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Clasificar Sistema de IA</h1>
            <p className="text-gray-600">Cuestionario de clasificación AI Act</p>
          </div>
          <Button
            onClick={handleAiFill}
            disabled={isAiFilling}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isAiFilling ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Analizando... {aiFillProgress}%
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Completar con IA
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">Paso {currentStep} de {totalSteps}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Questionnaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Cuestionario de Clasificación AI Act</CardTitle>
            <CardDescription>
              Responde Sí o No a cada pregunta. Puedes usar <span className="font-semibold text-blue-600">"Completar con IA"</span> para rellenar automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Step 1: System Type */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-bold">1</span>
                        Tipo de Sistema de IA
                      </h3>
                      <p className="text-sm text-gray-500 ml-8">Si usas un modelo de terceros vía API (OpenAI, Anthropic, Google…), selecciona según la aplicación que construyes, no según el modelo base.</p>
                    </div>
                    <FormField control={form.control} name="systemType" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-3">
                            {systemTypes.map((type) => {
                              const Icon = type.icon;
                              const isSelected = field.value === type.value;
                              return (
                                <button key={type.value} type="button" onClick={() => field.onChange(type.value)}
                                  className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                  <div className={`p-3 rounded-xl shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-gray-900 text-base">{type.label}</span>
                                      {type.badge && <Badge variant="secondary" className="text-xs">{type.badge}</Badge>}
                                      <InfoTooltip text={type.tooltip} />
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1 leading-relaxed">{type.description}</div>
                                    <div className="text-xs text-blue-600 mt-2 font-medium">{type.examples}</div>
                                  </div>
                                  {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* Step 2: Article 5 — Prohibited */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-red-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm flex items-center justify-center font-bold">2</span>
                          Usos Prohibidos (Art. 5)
                        </h3>
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Cualquier Sí → Prohibido</Badge>
                      </div>
                      <p className="text-sm text-gray-500 ml-8">Si cualquier respuesta es Sí, el sistema está prohibido en la UE. Aplica a todos los tipos de sistema.</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800"><AlertCircle className="w-4 h-4 inline mr-1" /><strong>Atención:</strong> Si alguna de estas prácticas aplica a tu sistema, está prohibido en la UE.</p>
                    </div>
                    <div className="space-y-3">
                      <SectionDivider title="Sección A: Manipulación y explotación" />
                      <FormField control={form.control} name="p2_1" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="2.1 — ¿El sistema intenta influir en el comportamiento de las personas sin que sean conscientes, o aprovecha sus puntos débiles para perjudicarlas?"
                            tooltip="El AI Act prohíbe dos técnicas distintas: (1) técnicas subliminales que operan fuera de la consciencia del usuario; y (2) técnicas que explotan vulnerabilidades específicas —edad, discapacidad, situación económica— para distorsionar la conducta causando daño. Si tu sistema optimiza métricas de engagement sin considerar el impacto en el usuario, puede entrar en esta categoría."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_1')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p2_2" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="2.2 — ¿El sistema puntúa o clasifica a personas por su comportamiento para conceder o denegar beneficios en contextos no relacionados con esa puntuación?"
                            tooltip="La prohibición de 'social scoring' se refiere a usar IA para construir perfiles de comportamiento social que luego se usen en contextos distintos al que generó los datos. No confundir con el scoring crediticio tradicional basado en historial financiero (que es Alto Riesgo, no Prohibido)."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_2')} />
                        </FormControl></FormItem>
                      )} />
                      <SectionDivider title="Sección B: Vigilancia y biometría" />
                      <FormField control={form.control} name="p2_3" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="2.3 — ¿El sistema identifica personas a distancia y en tiempo real en espacios públicos mediante biometría, con fines de vigilancia policial?"
                            tooltip="Se refiere a la identificación biométrica remota en tiempo real: el sistema procesa rasgos físicos de personas en espacios accesibles al público para contrastarlos con bases de datos, mientras ocurre. Esta prohibición tiene tres excepciones muy estrictas — si crees que tu sistema podría acogerse a alguna, responde Sí y se desplegará la subpregunta."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_3')} />
                        </FormControl></FormItem>
                      )} />
                      {p2_3Value === 'yes' && (
                        <div className="ml-6 border-l-2 border-orange-200 pl-4">
                          <FormField control={form.control} name="p2_3a" render={({ field }) => (
                            <FormItem><FormControl>
                              <YesNoSelector value={field.value} onChange={field.onChange}
                                label="2.3a — ¿Opera exclusivamente bajo autorización judicial para búsqueda de víctimas de trata, prevención de ataque terrorista inminente o localización de sospechosos de delitos graves?"
                                tooltip="Las tres únicas excepciones requieren: (1) autorización judicial previa, (2) que el uso sea estrictamente necesario, y (3) que existan las salvaguardas procedimentales exigidas. Si se cumple todo → no es Prohibido, pero sí es Alto Riesgo. Si hay cualquier duda, consulta con asesoría legal."
                                isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_3a')} />
                            </FormControl></FormItem>
                          )} />
                        </div>
                      )}
                      <FormField control={form.control} name="p2_4" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="2.4 — ¿El sistema deduce rasgos sensibles —raza, ideología política, religión u orientación sexual— a partir de datos biométricos?"
                            tooltip="Esta prohibición cubre los sistemas que usan datos biométricos (imagen, voz, movimiento, señales fisiológicas) para inferir atributos especialmente protegidos. No requiere que la inferencia sea correcta — el mero intento de deducir estos atributos es suficiente para la prohibición."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_4')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p2_5" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="2.5 — ¿El sistema recopila imágenes de rostros de forma masiva desde internet o cámaras para crear o ampliar bases de datos de reconocimiento facial?"
                            tooltip="La prohibición cubre tanto el scraping desde fuentes abiertas (redes sociales, webs públicas) como la captura desde sistemas de videovigilancia, siempre que el fin sea construir o ampliar bases de datos de reconocimiento facial. La mera recopilación masiva con esta finalidad está prohibida."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_5')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p2_6" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="2.6 — ¿El sistema detecta o infiere las emociones de empleados o estudiantes en el contexto laboral o educativo?"
                            tooltip="El AI Act prohíbe la inferencia de emociones en el lugar de trabajo y en centros educativos. No aplica si la finalidad es exclusivamente médica o de seguridad y está debidamente documentada. Si hay una relación de dependencia o evaluación, aplica la prohibición."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p2_6')} />
                        </FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Step 3: Annex III — only for non-GPAI */}
                {currentStep === 3 && !isGPAI && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm flex items-center justify-center font-bold">3</span>
                          Sistemas de Alto Riesgo (Art. 6 y Anexo III)
                        </h3>
                        <InfoTooltip text="El Anexo III del AI Act lista nueve categorías de sistemas considerados de alto riesgo. Un Sí en cualquier pregunta activa los requisitos del Capítulo III: gestión de riesgos, calidad de datos, documentación técnica, supervisión humana y registro en la base de datos UE." />
                      </div>
                      <p className="text-sm text-gray-500 ml-8">Si cualquier respuesta es Sí, el sistema se clasifica como Alto Riesgo salvo que se aplique la excepción de la Sección 2 del Art. 6.</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-800"><AlertTriangle className="w-4 h-4 inline mr-1" /><strong>Importante:</strong> Estos sistemas requieren gestión de riesgos, supervisión humana, documentación técnica y registro en la base de datos de la UE.</p>
                    </div>
                    <div className="space-y-3">
                      <SectionDivider title="Biometría" />
                      <FormField control={form.control} name="p3_1" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.1 — ¿El sistema realiza identificación biométrica remota en diferido (no en tiempo real) de personas?"
                            tooltip="La identificación biométrica remota post-facto consiste en cotejar grabaciones o imágenes ya obtenidas contra bases de datos, sin hacerlo en el momento de la captura. Es Alto Riesgo (no Prohibido) cuando no se hace en tiempo real."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_1')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p3_2" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.2 — ¿El sistema categoriza personas por características biométricas para inferir raza, opinión política, sindicación, religión, vida u orientación sexual?"
                            tooltip="La categorización biométrica sensible va más allá de la identificación: infiere atributos especialmente protegidos. No confundir con la prohibición (p2_4): aquí aplica cuando el uso es legítimo pero la materia es sensible, lo que lo convierte en Alto Riesgo."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_2')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p3_3" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.3 — ¿El sistema detecta, reconoce o verifica emociones de personas?"
                            tooltip="La detección de emociones mediante biometría (expresión facial, tono de voz, microgestos) es Alto Riesgo cuando no opera en el ámbito laboral o educativo (donde sería Prohibida). Por ejemplo, en atención al cliente, banca o seguros puede ser Alto Riesgo."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_3')} />
                        </FormControl></FormItem>
                      )} />
                      {p3_3Value === 'yes' && (
                        <div className="ml-6 border-l-2 border-orange-200 pl-4">
                          <FormField control={form.control} name="p3_3a" render={({ field }) => (
                            <FormItem><FormControl>
                              <YesNoSelector value={field.value} onChange={field.onChange}
                                label="3.3a — ¿Se usa exclusivamente con finalidad médica o de seguridad debidamente documentada?"
                                tooltip="Si la detección de emociones tiene una finalidad exclusivamente médica (p.ej., monitorización de pacientes) o de seguridad (p.ej., detección de fatiga en conductores) y está debidamente justificada y documentada, se aplica una excepción que puede reducir su clasificación."
                                isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_3a')} />
                            </FormControl></FormItem>
                          )} />
                        </div>
                      )}
                      <SectionDivider title="Infraestructuras y seguridad" />
                      <FormField control={form.control} name="p3_4" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.4 — ¿El sistema gestiona o controla infraestructura crítica (redes eléctricas, agua, gas, transporte o sistemas financieros)?"
                            tooltip="Infraestructura crítica es aquella cuya interrupción tendría consecuencias graves para la seguridad pública, la economía o servicios esenciales. Si el sistema toma decisiones automatizadas que afectan a estos entornos, se clasifica como Alto Riesgo."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_4')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p3_5" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.5 — ¿El sistema es un componente de seguridad de un producto regulado por legislación sectorial de la UE (Anexo I del AI Act)?"
                            tooltip="El Anexo I del AI Act lista sectores con legislación de armonización preexistente: maquinaria industrial, juguetes, equipos de radio, equipos de presión, vehículos a motor, dispositivos médicos, equipos de protección individual, entre otros. Si tu sistema de IA actúa como componente de seguridad de estos productos, es Alto Riesgo."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_5')} />
                        </FormControl></FormItem>
                      )} />
                      <SectionDivider title="Derechos fundamentales y acceso a servicios" />
                      <FormField control={form.control} name="p3_6" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.6 — ¿El sistema determina el acceso a educación, formación profesional, o evalúa el rendimiento académico?"
                            tooltip="Sistemas que deciden quién accede a instituciones educativas, qué trayectorias formativas se recomiendan, o que evalúan el rendimiento de estudiantes. Incluye plataformas de evaluación adaptativa, sistemas de admisión y herramientas de detección de plagio que determinan sanciones."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_6')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p3_7" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.7 — ¿El sistema interviene en reclutamiento, selección, evaluación o gestión de personas en el empleo?"
                            tooltip="Aplica a la IA que filtra CVs, puntúa candidatos, decide ascensos o despidos, asigna tareas, monitoriza productividad o determina condiciones laborales. La presencia de supervisión humana no excluye la clasificación como Alto Riesgo si la IA condiciona las decisiones finales."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_7')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p3_8" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.8 — ¿El sistema evalúa la elegibilidad para servicios públicos, prestaciones sociales, créditos, seguros u otros servicios esenciales?"
                            tooltip="Scoring crediticio, evaluación de riesgo en seguros, valoración de elegibilidad para ayudas sociales, scoring médico para priorización de atención. La clave es si el sistema condiciona de forma significativa el acceso de personas a recursos o servicios esenciales."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_8')} />
                        </FormControl></FormItem>
                      )} />
                      <SectionDivider title="Orden público y justicia" />
                      <FormField control={form.control} name="p3_9" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="3.9 — ¿El sistema apoya decisiones en las áreas de aplicación de la ley, gestión migratoria, asilo, control de fronteras, administración de justicia o procesos democráticos?"
                            tooltip="Esta categoría agrupa los tres últimos grupos del Anexo III: (6) aplicación de la ley — análisis de riesgo de reincidencia, perfilado, poligrafía; (7) migración y asilo — valoración de solicitudes, detección de documentos fraudulentos; (8) administración de justicia — asistencia a jueces; y (9) procesos democráticos — influencia en elecciones o referéndums."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p3_9')} />
                        </FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Step 3/4: Article 50 Transparency — step 3 for GPAI, step 4 for non-GPAI */}
                {((currentStep === 3 && isGPAI) || (currentStep === 4 && !isGPAI)) && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-yellow-900 flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 text-sm flex items-center justify-center font-bold">{isGPAI ? '3' : '4'}</span>
                        Obligaciones de Transparencia (Art. 50)
                      </h3>
                      <p className="text-sm text-gray-500 ml-8">Un Sí activa la obligación de transparencia pero no cambia el nivel de riesgo principal. Puede coexistir con cualquier clasificación.</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800"><Shield className="w-4 h-4 inline mr-1" /><strong>Transparencia obligatoria:</strong> Estos sistemas deben informar activamente a los usuarios de que interactúan con IA o de que el contenido es sintético.</p>
                    </div>
                    <div className="space-y-3">
                      <FormField control={form.control} name="p4_1" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="4.1 — ¿El sistema interactúa directamente con personas sin que sea evidente que están ante una IA (chatbots, agentes conversacionales)?"
                            tooltip="La obligación aplica cuando un usuario podría creer razonablemente que está interactuando con una persona humana. No aplica si el uso de IA es obvio por el contexto o si el usuario ya fue informado. Incluye chatbots de atención al cliente, asistentes virtuales y agentes autónomos."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p4_1')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p4_2" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="4.2 — ¿El sistema genera contenido sintético de imagen, audio o vídeo que representa personas, lugares o eventos reales (deepfakes)?"
                            tooltip="La obligación de marcar el contenido como generado por IA aplica a los contenidos que podrían inducir a error sobre su autenticidad. Se excluyen los usos artísticos o de entretenimiento que lo anuncien claramente. El foco es en la capacidad de confusión con la realidad."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p4_2')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p4_3" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="4.3 — ¿El sistema genera textos publicados sobre materias de interés público sin revelar que son generados por IA?"
                            tooltip="Aplica a sistemas que producen contenido informativo, periodístico o de análisis de actualidad que podría presentarse al público sin indicar su origen artificial. El objetivo es prevenir la desinformación a escala."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p4_3')} />
                        </FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="p4_4" render={({ field }) => (
                        <FormItem><FormControl>
                          <YesNoSelector value={field.value} onChange={field.onChange}
                            label="4.4 — ¿El sistema detecta o infiere emociones de personas (fuera del ámbito laboral/educativo prohibido)?"
                            tooltip="La detección de emociones en contextos no prohibidos (ver 2.6) activa la obligación de informar al afectado. Por ejemplo, en atención al cliente o en aplicaciones de salud mental. Debe notificarse al usuario antes o en el momento en que se produce la detección."
                            isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('p4_4')} />
                        </FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>Anterior</Button>
                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={handleNextStep}>Siguiente</Button>
                  ) : (
                    <Button type="submit" disabled={calculating || !finalStepReady}>{calculating ? 'Calculando...' : 'Finalizar Clasificación'}</Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Drawer — opens when AI needs clarification */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-[420px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold text-sm">Asistente AI Act</span>
            </div>
            <button onClick={() => setShowChat(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AIClassificationAssistant
              systemName={useCase?.name}
              systemDescription={useCase?.description}
              initialQuestions={unclearQuestions}
              onClassificationSuggested={(classification) => {
                // Apply classification result to form
                toast.success('Clasificación aplicada', { description: `Nivel: ${riskLevels[classification.level as keyof typeof riskLevels]?.label ?? classification.level}` });
                setShowChat(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
