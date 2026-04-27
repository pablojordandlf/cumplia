'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sparkles,
  MessageSquare,
  X,
  FileText,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { supabase } from '@/lib/supabase';
import { AIClassificationAssistant } from '@/components/ai-classification-assistant';
import { RiaFormRenderer, getRiaStepCount, getRiaStepTitle } from '@/components/ria-form-renderer';
import { evaluateRiaClassification, evaluateTransparencyRequired } from '@/lib/utils/ria-classification';
import type { RiaFormTemplate, RiaFormAnswers, SystemTypeValue } from '@/types/ria-form-template';

/**
 * Build the complete answers map by defaulting every visible yes/no question
 * to 'no' when the user hasn't explicitly answered it.
 *
 * Only questions that are actually visible at submission time (correct step
 * applies_to filter, parent trigger resolved) are included, so hidden
 * child questions never receive a spurious 'no'.
 */
function buildEffectiveAnswers(template: RiaFormTemplate, answers: RiaFormAnswers): RiaFormAnswers {
  const systemTypeValue = answers['systemType'] as SystemTypeValue | undefined;
  const isGpai = systemTypeValue === 'gpai';

  const visibleSteps = template.structure.steps.filter((step) => {
    if (!step.applies_to || step.applies_to === 'all') return true;
    if (step.applies_to === 'non_gpai') return !isGpai;
    if (step.applies_to === 'gpai') return isGpai;
    return true;
  });

  const effective: RiaFormAnswers = { ...answers };

  for (const step of visibleSteps) {
    if (step.type !== 'questions') continue;
    for (const section of step.sections ?? []) {
      for (const question of section.questions) {
        // Skip child questions whose parent hasn't triggered them
        if (question.parent_question_id) {
          const parentAnswer = effective[question.parent_question_id];
          if (parentAnswer !== question.parent_answer_trigger) continue;
        }
        if (!(question.key in effective)) {
          effective[question.key] = 'no';
        }
      }
    }
  }

  return effective;
}

// ── Risk level display config ─────────────────────────────────────────────────

const riskLevels = {
  prohibited: {
    label: 'Prohibido',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
    description: 'Este sistema de IA está prohibido por el Artículo 5 del AI Act y no puede desplegarse en la UE.',
  },
  high_risk: {
    label: 'Alto Riesgo',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    description: 'Sistema de alto riesgo sujeto a obligaciones estrictas de cumplimiento (Arts. 9-15).',
  },
  gpai_regime: {
    label: 'Régimen GPAI',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Brain,
    description: 'Modelo de IA de propósito general sujeto a las obligaciones del Artículo 53 del AI Act.',
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Shield,
    description: 'Sujeto a obligaciones de transparencia (Art. 50).',
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    description: 'Libre uso con recomendación de códigos de conducta voluntarios.',
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ClassifyUseCasePage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;

  const [useCase, setUseCase] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{ level: string; transparencyRequired: boolean } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [finalStepReady, setFinalStepReady] = useState(false);

  const [template, setTemplate] = useState<RiaFormTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<RiaFormTemplate[]>([]);
  const [answers, setAnswers] = useState<RiaFormAnswers>({});

  const [isAiFilling, setIsAiFilling] = useState(false);
  const [aiFillProgress, setAiFillProgress] = useState(0);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [unclearQuestions, setUnclearQuestions] = useState<string[]>([]);

  const totalSteps = template ? getRiaStepCount(template, answers) : 0;

  useEffect(() => {
    if (currentStep === totalSteps && totalSteps > 0) {
      setFinalStepReady(false);
      const timer = setTimeout(() => setFinalStepReady(true), 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, totalSteps]);

  useEffect(() => {
    loadData();
  }, [useCaseId]);

  async function loadData() {
    setLoading(true);
    try {
      const [ucResult, tplResult, allTplResult] = await Promise.all([
        supabase.from('use_cases').select('*').eq('id', useCaseId).single(),
        fetch(`/api/v1/ai-systems/${useCaseId}/ria-template`),
        fetch('/api/v1/ria-templates'),
      ]);

      if (ucResult.error) throw ucResult.error;
      setUseCase(ucResult.data);

      const tplJson = await tplResult.json();
      if (tplJson.success && tplJson.data) {
        setTemplate(tplJson.data);
      }

      const allTplJson = await allTplResult.json();
      if (allTplJson.success) {
        setAllTemplates(allTplJson.data);
      }

      if (ucResult.data?.classification_data && !ucResult.data.classification_data.ai_assisted) {
        const prevData = ucResult.data.classification_data as RiaFormAnswers;
        setAnswers(prevData);
      } else {
        setAnswers({});
      }
    } catch {
      toast.error('Error', { description: 'No se pudo cargar el sistema de IA' });
      router.push('/dashboard/inventory');
    } finally {
      setLoading(false);
    }
  }

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleTemplateChange = async (templateId: string) => {
    const found = allTemplates.find((t) => t.id === templateId);
    if (!found) return;
    setTemplate(found);
    setCurrentStep(1);
    setAnswers({});
    setResult(null);

    try {
      await fetch(`/api/v1/ai-systems/${useCaseId}/ria-template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId }),
      });
    } catch {
      // Non-critical — template selection is persisted best-effort
    }
  };

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

      const incoming = data.answers as Record<string, string>;
      const keys = Object.keys(incoming).filter(
        (k) => incoming[k] === 'yes' || incoming[k] === 'no' || k === 'systemType'
      );

      if (incoming.systemType) {
        setAnswers((prev) => ({ ...prev, systemType: incoming.systemType }));
      }

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === 'systemType') continue;
        const val = incoming[key];
        if (val === 'yes' || val === 'no') {
          await new Promise((r) => setTimeout(r, 80));
          setAnswers((prev) => ({ ...prev, [key]: val }));
          setAiFilledFields((prev) => new Set([...prev, key]));
          setAiFillProgress(Math.round(((i + 1) / keys.length) * 100));
        }
      }

      const unclear = data.unclear_fields ?? [];
      const questions = data.unclear_questions ?? [];
      if (unclear.length > 0 && questions.length > 0) {
        setUnclearQuestions(questions);
        setShowChat(true);
        toast.success('Necesito más información', {
          description: `La IA necesita aclarar ${unclear.length} preguntas. Se ha abierto el chat.`,
        });
      } else {
        toast.success('Cuestionario completado por IA', {
          description: `Confianza: ${data.confidence === 'high' ? 'Alta' : data.confidence === 'medium' ? 'Media' : 'Baja'}. Revisa las respuestas antes de finalizar.`,
        });
      }
    } catch (err) {
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'No se pudo completar con IA',
      });
    } finally {
      setIsAiFilling(false);
      setAiFillProgress(100);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!template) return;
    setCalculating(true);
    try {
      // Merge explicit answers with 'no' defaults for every visible unanswered question
      const effectiveAnswers = buildEffectiveAnswers(template, answers);

      const level = evaluateRiaClassification(template.classification_rules, effectiveAnswers, template.structure);
      const transparencyRequired = evaluateTransparencyRequired(template.classification_rules, effectiveAnswers);
      const classificationResult = { level, transparencyRequired };

      const { data: { session } } = await supabase.auth.getSession();

      await supabase.from('use_cases').update({
        ai_act_level: level,
        classification_data: effectiveAnswers,
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
          classification_data: effectiveAnswers,
          ai_act_level: level,
          created_by: session?.user?.id,
          notes: 'Versión inicial - Primera clasificación',
        });
      }

      setResult(classificationResult);
      toast.success('Clasificación Completada', {
        description: `El sistema ha sido clasificado como: ${riskLevels[level as keyof typeof riskLevels]?.label ?? level}`,
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo guardar',
      });
    } finally {
      setCalculating(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded w-96" />
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────

  if (result) {
    const riskInfo = riskLevels[result.level as keyof typeof riskLevels];
    const RiskIcon = riskInfo?.icon ?? CheckCircle2;
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 ${riskInfo?.color.split(' ')[0]} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <RiskIcon className={`w-10 h-10 ${riskInfo?.color.split(' ')[1]}`} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Clasificación Completada</h1>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge className={`text-lg px-4 py-1 ${riskInfo?.color}`}>{riskInfo?.label}</Badge>
                {result.transparencyRequired && (
                  <Badge className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                    Transparencia obligatoria (Art. 50)
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-6">{riskInfo?.description}</p>
              {result.level === 'limited_risk' && answers['systemType'] === 'multipurpose' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    <strong>Aviso:</strong> Este sistema tiene múltiples usos. El AI Act exige evaluar el riesgo por cada caso de uso concreto. Repite esta clasificación para cada finalidad prevista.
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">{String(useCase?.name ?? '')}</h3>
                <p className="text-sm text-gray-600">{String(useCase?.description ?? '')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/inventory">
                  <Button size="lg">Ver en el Inventario</Button>
                </Link>
                <Link href={`/dashboard/inventory/${useCaseId}`}>
                  <Button variant="outline" size="lg">Ver Detalles</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressValue = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const stepTitle = template ? getRiaStepTitle(template, answers, currentStep) : '';

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Inventario', href: '/dashboard/inventory' },
            { label: String(useCase?.name ?? '...'), href: `/dashboard/inventory/${useCaseId}` },
            { label: 'Clasificar' },
          ]}
        />

        <div className="flex items-start gap-3 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Clasificar Sistema de IA</h1>
            <p className="text-gray-600">Cuestionario de clasificación AI Act</p>
          </div>
          <Button
            onClick={handleAiFill}
            disabled={isAiFilling || !template}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shrink-0"
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

        {allTemplates.length > 1 && (
          <div className="mb-4 flex items-center gap-3">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <Select value={template?.id ?? ''} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Selecciona plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {allTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.is_system ? ' (sistema)' : ''}
                    {t.is_default && !t.is_system ? ' (predeterminada)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">Paso {currentStep} de {totalSteps}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {stepTitle || 'Cuestionario de Clasificación AI Act'}
            </CardTitle>
            <CardDescription>
              Responde Sí o No a cada pregunta. Puedes usar{' '}
              <span className="font-semibold text-blue-600">"Completar con IA"</span> para rellenar
              automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {template ? (
                <RiaFormRenderer
                  template={template}
                  answers={answers}
                  currentStep={currentStep}
                  aiFilledFields={aiFilledFields}
                  isAiFilling={isAiFilling}
                  onChange={handleAnswerChange}
                />
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No se pudo cargar la plantilla de evaluación.
                </p>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  disabled={currentStep === 1}
                >
                  Anterior
                </Button>
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={() => setCurrentStep((s) => Math.min(s + 1, totalSteps))}>
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={calculating || !finalStepReady || !template}
                  >
                    {calculating ? 'Calculando...' : 'Finalizar Clasificación'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showChat && (
        <div className="fixed bottom-4 right-4 w-[420px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold text-sm">Asistente AI Act</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AIClassificationAssistant
              systemName={String(useCase?.name ?? '')}
              systemDescription={String(useCase?.description ?? '')}
              initialQuestions={unclearQuestions}
              onClassificationSuggested={(classification) => {
                toast.success('Clasificación aplicada', {
                  description: `Nivel: ${riskLevels[classification.level as keyof typeof riskLevels]?.label ?? classification.level}`,
                });
                setShowChat(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
