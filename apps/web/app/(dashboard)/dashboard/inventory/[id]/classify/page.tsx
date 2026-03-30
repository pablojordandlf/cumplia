'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
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
  ChevronLeft,
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
import { supabase } from '@/lib/supabase';
import { AIClassificationAssistant } from '@/components/ai-classification-assistant';

// ── Schema ───────────────────────────────────────────────────────────────────

const classificationSchema = z.object({
  systemType: z.enum(['gpai_model', 'gpai_sr', 'gpai_system', 'specific_purpose']),
  isSubliminal: z.enum(['yes', 'no']),
  isSocialScoring: z.enum(['yes', 'no']),
  isRealTimeBiometric: z.enum(['yes', 'no']),
  exploitsVulnerabilities: z.enum(['yes', 'no']),
  isBiometricIdentification: z.enum(['yes', 'no']),
  isCriticalInfrastructure: z.enum(['yes', 'no']),
  isEducationVocational: z.enum(['yes', 'no']),
  isEmployment: z.enum(['yes', 'no']),
  isAccessToServices: z.enum(['yes', 'no']),
  isLawEnforcement: z.enum(['yes', 'no']),
  isMigrationAsylum: z.enum(['yes', 'no']),
  isJusticeDemocratic: z.enum(['yes', 'no']),
  isSafetyComponent: z.enum(['yes', 'no']),
  interactsWithHumans: z.enum(['yes', 'no']),
  isEmotionRecognition: z.enum(['yes', 'no']),
  isBiometricCategorization: z.enum(['yes', 'no']),
  generatesDeepfakes: z.enum(['yes', 'no']),
});

type FormValues = z.infer<typeof classificationSchema>;

// ── Constants ────────────────────────────────────────────────────────────────

const riskLevels = {
  prohibited: { label: 'Prohibido', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, description: 'Este sistema de IA está prohibido por el Artículo 5 del AI Act y no puede desplegarse en la UE.' },
  high_risk: { label: 'Alto Riesgo', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, description: 'Sistema de alto riesgo sujeto a obligaciones estrictas de cumplimiento (Arts. 6-51).' },
  limited_risk: { label: 'Riesgo Limitado', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Shield, description: 'Sujeto a obligaciones de transparencia (Art. 50).' },
  minimal_risk: { label: 'Riesgo Mínimo', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, description: 'Libre uso con recomendación de códigos de conducta voluntarios.' },
};

const systemTypes = [
  { value: 'gpai_model' as const, label: 'Modelo de IA de Propósito General (GPAI Model)', description: 'El activo es únicamente un modelo base (no incluye interfaz ni pipeline completo). Es capaz de realizar una amplia variedad de tareas y puede integrarse en otros sistemas o aplicaciones.', examples: 'Ejemplos: GPT-4, Llama, Gemini en su forma base.', icon: Brain },
  { value: 'gpai_sr' as const, label: 'Modelo GPAI con Riesgo Sistémico (GPAI-SR)', description: 'Igual que el tipo A, pero supera los 10²⁵ FLOP de entrenamiento o la Comisión Europea lo ha designado expresamente como tal por sus capacidades de gran impacto.', examples: 'Requiere evaluación de riesgos sistémicos y medidas de mitigación.', icon: Sparkles },
  { value: 'gpai_system' as const, label: 'Sistema de IA de Propósito General (GPAI System)', description: 'El activo es un sistema completo (con interfaz, pipeline u otros componentes) construido sobre un modelo GPAI y sin una finalidad de uso única y específica.', examples: 'Ejemplos: ChatGPT como producto, Copilot Studio sin configuración de dominio.', icon: Bot },
  { value: 'specific_purpose' as const, label: 'Sistema de IA de Finalidad Específica', description: 'El activo es un sistema con un sistema de IA concreto y definido. Esta es la categoría donde aplican los niveles de riesgo (prohibido, alto, limitado, mínimo).', examples: 'Ejemplos: modelo de scoring de crédito, chatbot de atención, sistema de detección de fraude.', icon: Cpu },
];

// All fillable yes/no field keys (excludes systemType)
const YES_NO_FIELDS: (keyof FormValues)[] = [
  'isSubliminal', 'exploitsVulnerabilities', 'isSocialScoring', 'isRealTimeBiometric',
  'isBiometricIdentification', 'isCriticalInfrastructure', 'isEducationVocational',
  'isEmployment', 'isAccessToServices', 'isLawEnforcement', 'isMigrationAsylum',
  'isJusticeDemocratic', 'isSafetyComponent',
  'interactsWithHumans', 'isEmotionRecognition', 'isBiometricCategorization', 'generatesDeepfakes',
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
        <div className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 w-72 leading-relaxed`}>
          {text}
          <div className={`absolute left-1/2 transform -translate-x-1/2 border-8 border-transparent ${position === 'top' ? 'top-full border-t-gray-900' : 'bottom-full border-b-gray-900'}`} />
        </div>
      )}
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
      className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all cursor-pointer
        ${aiFilled ? 'border-blue-300 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'}`}
      onClick={() => onChange(value === 'yes' ? 'no' : 'yes')}
    >
      {/* AI wave animation overlay */}
      {isAiFilling && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-200/60 to-blue-100/0 animate-[shimmer_1.5s_ease-in-out_infinite]" />
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
  const [result, setResult] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // AI auto-fill state
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [aiFillProgress, setAiFillProgress] = useState(0);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [unclearQuestions, setUnclearQuestions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(classificationSchema),
    defaultValues: {
      systemType: 'specific_purpose', isSubliminal: 'no', isSocialScoring: 'no', isRealTimeBiometric: 'no', exploitsVulnerabilities: 'no',
      isBiometricIdentification: 'no', isCriticalInfrastructure: 'no', isEducationVocational: 'no', isEmployment: 'no', isAccessToServices: 'no',
      isLawEnforcement: 'no', isMigrationAsylum: 'no', isJusticeDemocratic: 'no', isSafetyComponent: 'no',
      interactsWithHumans: 'no', isEmotionRecognition: 'no', isBiometricCategorization: 'no', generatesDeepfakes: 'no',
    },
  });

  const selectedSystemType = form.watch('systemType');

  useEffect(() => { loadUseCase(); }, [useCaseId]);

  async function loadUseCase() {
    try {
      const { data, error } = await supabase.from('use_cases').select('*').eq('id', useCaseId).single();
      if (error) throw error;
      setUseCase(data);
      if (data?.classification_data && !data.classification_data.ai_assisted) {
        const prevData = data.classification_data;
        const convertedData: any = { systemType: prevData.systemType || 'specific_purpose' };
        Object.keys(prevData).forEach(key => {
          if (typeof prevData[key] === 'boolean') convertedData[key] = prevData[key] ? 'yes' : 'no';
          else if (prevData[key] === 'yes' || prevData[key] === 'no') convertedData[key] = prevData[key];
        });
        form.reset(convertedData);
      }
    } catch (error) {
      console.error('Error loading use case:', error);
      toast({ title: 'Error', description: 'No se pudo cargar el sistema de IA', variant: 'destructive' });
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
        toast({
          title: 'Necesito más información',
          description: `La IA necesita aclarar ${unclear.length} preguntas. Se ha abierto el chat.`,
        });
      } else {
        toast({
          title: 'Cuestionario completado por IA',
          description: `Confianza: ${data.confidence === 'high' ? 'Alta' : data.confidence === 'medium' ? 'Media' : 'Baja'}. Revisa las respuestas antes de finalizar.`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message ?? 'No se pudo completar con IA', variant: 'destructive' });
    } finally {
      setIsAiFilling(false);
      setAiFillProgress(100);
    }
  }

  // ── Classification logic ──────────────────────────────────────────────────

  function calculateRiskLevel(values: FormValues): string {
    if (values.isSubliminal === 'yes' || values.isSocialScoring === 'yes' || values.isRealTimeBiometric === 'yes' || values.exploitsVulnerabilities === 'yes') return 'prohibited';
    if (values.systemType === 'specific_purpose') {
      if (values.isBiometricIdentification === 'yes' || values.isCriticalInfrastructure === 'yes' || values.isEducationVocational === 'yes' || values.isEmployment === 'yes' || values.isAccessToServices === 'yes' || values.isLawEnforcement === 'yes' || values.isMigrationAsylum === 'yes' || values.isJusticeDemocratic === 'yes' || values.isSafetyComponent === 'yes') return 'high_risk';
    }
    if (values.systemType === 'gpai_sr') return 'high_risk';
    if (values.systemType === 'specific_purpose') {
      if (values.interactsWithHumans === 'yes' || values.isEmotionRecognition === 'yes' || values.isBiometricCategorization === 'yes' || values.generatesDeepfakes === 'yes') return 'limited_risk';
    }
    if (values.systemType === 'gpai_model' || values.systemType === 'gpai_system') return 'limited_risk';
    return 'minimal_risk';
  }

  async function onSubmit(values: FormValues) {
    setCalculating(true);
    try {
      const riskLevel = calculateRiskLevel(values);
      const { data: { session } } = await supabase.auth.getSession();

      await supabase.from('use_cases').update({
        ai_act_level: riskLevel, classification_data: values, status: 'classified',
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
          classification_data: values,
          ai_act_level: riskLevel,
          created_by: session?.user?.id,
          notes: 'Versión inicial - Primera clasificación',
        });
      }

      setResult(riskLevel);
      toast({ title: 'Clasificación Completada', description: `El sistema ha sido clasificado como: ${riskLevels[riskLevel as keyof typeof riskLevels].label}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo guardar', variant: 'destructive' });
    } finally { setCalculating(false); }
  }

  // ── Step navigation ───────────────────────────────────────────────────────

  const totalSteps = selectedSystemType === 'specific_purpose' ? 4 : 2;
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
    const riskInfo = riskLevels[result as keyof typeof riskLevels];
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
              <Badge className={`text-lg px-4 py-1 ${riskInfo.color}`}>{riskInfo.label}</Badge>
              <p className="text-gray-600 mt-4 mb-6">{riskInfo.description}</p>
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/inventory"><Button variant="ghost" size="icon"><ChevronLeft className="w-6 h-6" /></Button></Link>
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-bold">1</span>Tipo de Sistema de IA</h3>
                      <InfoTooltip text="El AI Act clasifica los activos de IA en 4 categorías según su naturaleza. Selecciona la que mejor describa tu activo." />
                    </div>
                    <FormField control={form.control} name="systemType" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-3">
                            {systemTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <button key={type.value} type="button" onClick={() => field.onChange(type.value)} className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${field.value === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                  <div className={`p-3 rounded-xl ${field.value === type.value ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <Icon className={`w-6 h-6 ${field.value === type.value ? 'text-blue-600' : 'text-gray-500'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900 text-base">{type.label}</div>
                                    <div className="text-sm text-gray-600 mt-1 leading-relaxed">{type.description}</div>
                                    <div className="text-xs text-blue-600 mt-2 font-medium">{type.examples}</div>
                                  </div>
                                  {field.value === type.value && <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* Step 2: Article 5 */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-red-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm flex items-center justify-center font-bold">2</span>Artículo 5: Prácticas Prohibidas</h3>
                      <InfoTooltip text="El Artículo 5 del AI Act prohíbe ciertas prácticas consideradas inaceptables para la UE. Si respondes Sí a alguna, el sistema será clasificado como PROHIBIDO." />
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800"><AlertCircle className="w-4 h-4 inline mr-1" /><strong>Atención:</strong> Si alguna de estas prácticas aplica a tu sistema, está prohibido en la UE.</p>
                    </div>
                    <div className="space-y-3">
                      <FormField control={form.control} name="isSubliminal" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Usa técnicas subliminales o manipuladoras que distorsionen el comportamiento causando daño?" tooltip="Técnicas que distorsionan el comportamiento de personas de manera que puedan causar daño psicológico o físico sin que la persona sea consciente." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isSubliminal')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="exploitsVulnerabilities" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Explota vulnerabilidades de grupos específicos (edad, discapacidad, situación social)?" tooltip="Aprovecha debilidades de personas debido a su edad, discapacidad, situación social o económica específica para causar daño." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('exploitsVulnerabilities')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isSocialScoring" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Realiza puntuación social (social scoring) por autoridades públicas?" tooltip="Evaluación o clasificación de personas basada en comportamiento social o personalidad que conduce a tratamiento desfavorable en contextos no relacionados." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isSocialScoring')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isRealTimeBiometric" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Realiza identificación biométrica remota en tiempo real en espacios públicos para fines policiales?" tooltip="Identificación mediante biometría en tiempo real en espacios públicos por autoridades policiales (prohibido salvo excepciones muy limitadas)." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isRealTimeBiometric')} /></FormControl></FormItem>)} />
                    </div>
                  </div>
                )}

                {/* Step 3: Annex III */}
                {currentStep === 3 && selectedSystemType === 'specific_purpose' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-orange-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm flex items-center justify-center font-bold">3</span>Artículo 6: Sistemas de Alto Riesgo (Anexo III)</h3>
                      <InfoTooltip text="El Anexo III lista los sistemas de IA considerados de alto riesgo por su impacto potencial en seguridad, derechos fundamentales o sociedad." />
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-orange-800"><AlertTriangle className="w-4 h-4 inline mr-1" />Estos sistemas requieren gestión de riesgos, datos de calidad, supervisión humana, transparencia y registro UE.</p>
                    </div>
                    <div className="space-y-3">
                      <FormField control={form.control} name="isBiometricIdentification" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Realiza identificación o verificación biométrica de personas?" tooltip="Sistemas de identificación biométrica a distancia o categorización biométrica por características protegidas." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isBiometricIdentification')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isCriticalInfrastructure" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Gestiona infraestructura crítica (tráfico, agua, gas, electricidad)?" tooltip="Sistemas de gestión de infraestructura crítica donde un fallo podría poner en riesgo la vida de personas." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isCriticalInfrastructure')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isEducationVocational" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Se usa en educación o formación profesional para evaluación o acceso?" tooltip="Sistemas que determinan acceso a instituciones educativas, evalúan el aprendizaje o asignan personas." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isEducationVocational')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isEmployment" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Se usa en empleo, gestión de trabajadores o acceso a la autopromoción?" tooltip="Reclutamiento, selección, promoción, terminación, o asignación de tareas basadas en comportamiento o características personales." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isEmployment')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isAccessToServices" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Evalúa acceso a servicios esenciales (crédito, seguros, servicios públicos)?" tooltip="Evaluación de elegibilidad para servicios esenciales como créditos, seguros, servicios públicos, beneficios sociales." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isAccessToServices')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isLawEnforcement" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Se utiliza para aplicación de la ley?" tooltip="Evaluación de riesgos de reincidencia, análisis de evidencia, perfilado de personas en contexto policial." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isLawEnforcement')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isMigrationAsylum" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Se usa para migración, asilo o control de fronteras?" tooltip="Sistemas para evaluar solicitudes de asilo, visados, detección de irregularidades en documentos de viaje." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isMigrationAsylum')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isJusticeDemocratic" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Asiste en la administración de justicia o procesos democráticos?" tooltip="Sistemas que asisten jueces en investigación/interpretación de hechos/ley, o que influyen en elecciones." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isJusticeDemocratic')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isSafetyComponent" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Es un componente de seguridad de productos regulados por legislación sectorial UE (Anexo I)?" tooltip="Maquinaria, juguetes, dispositivos médicos, vehículos, equipos de protección individual regulados por la UE." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isSafetyComponent')} /></FormControl></FormItem>)} />
                    </div>
                  </div>
                )}

                {/* Step 4: Article 50 */}
                {currentStep === 4 && selectedSystemType === 'specific_purpose' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-yellow-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 text-sm flex items-center justify-center font-bold">4</span>Artículo 50: Obligaciones de Transparencia</h3>
                      <InfoTooltip text="El Artículo 50 establece obligaciones de transparencia para ciertos sistemas de IA que interactúan con personas o generan contenido sintético." />
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800"><Shield className="w-4 h-4 inline mr-1" />Estos sistemas deben informar a los usuarios que están interactuando con IA o que el contenido es generado/modificado artificialmente.</p>
                    </div>
                    <div className="space-y-3">
                      <FormField control={form.control} name="interactsWithHumans" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Interactúa directamente con personas (chatbots, sistemas conversacionales)?" tooltip="Chatbots, asistentes virtuales, o cualquier sistema que interactúe con humanos que puedan pensar que están interactuando con una persona." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('interactsWithHumans')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isEmotionRecognition" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Reconoce o interpreta emociones a partir de datos biométricos?" tooltip="Detección de emociones a través de expresiones faciales, tono de voz, gestos u otras características biométricas." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isEmotionRecognition')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="isBiometricCategorization" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Categoriza personas basándose en datos biométricos?" tooltip="Clasificación de personas en categorías basadas en características biométricas como edad, género, origen étnico." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('isBiometricCategorization')} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="generatesDeepfakes" render={({ field }) => (<FormItem><FormControl><YesNoSelector value={field.value} onChange={field.onChange} label="¿Genera o manipula contenido sintético (deepfakes) que emula personas reales?" tooltip="Contenido de audio, imagen o video que parece ser real pero ha sido creado o modificado artificialmente." isAiFilling={isAiFilling} aiFilled={aiFilledFields.has('generatesDeepfakes')} /></FormControl></FormItem>)} />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>Anterior</Button>
                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={handleNextStep}>Siguiente</Button>
                  ) : (
                    <Button type="submit" disabled={calculating}>{calculating ? 'Calculando...' : 'Finalizar Clasificación'}</Button>
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
                toast({ title: 'Clasificación aplicada', description: `Nivel: ${riskLevels[classification.level as keyof typeof riskLevels]?.label ?? classification.level}` });
                setShowChat(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
