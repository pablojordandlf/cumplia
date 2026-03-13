'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/risk-badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface UseCase {
  id: string;
  name: string;
  description: string | null;
  sector: string;
  status: string;
  ai_act_level: string;
  confidence_score: number | null;
  classification_reason: string | null;
  classification_data: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ClassificationResult {
  level: 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';
  confidence: number;
  reasoning: string;
  articles: string[];
  obligations: string[];
}

type Step = 1 | 2 | 3 | 4;

const sectorLabels: Record<string, string> = {
  healthcare: 'Salud',
  education: 'Educación',
  security: 'Seguridad Pública',
  employment: 'Empleo',
  transport: 'Transporte',
  finance: 'Finanzas',
  justice: 'Justicia',
  other: 'Otro',
};

// Preguntas del wizard AI Act basadas en Art. 5, 6 y 52
interface Question {
  id: string;
  question: string;
  helpText: string;
  article: string;
  yesResult: 'prohibited' | 'high' | 'limited' | 'continue';
  yesArticles?: string[];
}

const questions: Question[] = [
  {
    id: 'manipulation',
    question: '¿El sistema utiliza técnicas subliminales, manipulativas o explota vulnerabilidades de personas o grupos específicos (niños, personas con discapacidad, etc.)?',
    helpText: 'Ejemplos: mensajes subliminales, técnicas de dark patterns, explotación de vulnerabilidades cognitivas o emocionales.',
    article: 'Art. 5.1.a',
    yesResult: 'prohibited',
    yesArticles: ['Art. 5.1.a', 'Art. 5.1.b'],
  },
  {
    id: 'social_scoring',
    question: '¿El sistema clasifica o evalúa a personas basándose en su comportamiento social, características personales o contextualizadas, generando un "score" o puntaje social?',
    helpText: 'Ejemplos: scoring de ciudadanos por el gobierno, evaluación de "confiabilidad social", clasificación por comportamiento.',
    article: 'Art. 5.1.c',
    yesResult: 'prohibited',
    yesArticles: ['Art. 5.1.c'],
  },
  {
    id: 'biometric_remote',
    question: '¿El sistema realiza identificación biométrica remota en tiempo real en espacios públicos?',
    helpText: 'Ejemplos: reconocimiento facial en tiempo real en calles, plazas, eventos públicos (salvo excepciones de seguridad nacional).',
    article: 'Art. 5.1.h',
    yesResult: 'prohibited',
    yesArticles: ['Art. 5.1.h'],
  },
  {
    id: 'biometric_emotions',
    question: '¿El sistema infiere emociones en el lugar de trabajo o en instituciones educativas?',
    helpText: 'Ejemplos: detección de emociones de empleados, estudiantes o evaluación de atención en clase/trabajo.',
    article: 'Art. 5.1.f',
    yesResult: 'prohibited',
    yesArticles: ['Art. 5.1.f'],
  },
  {
    id: 'critical_infrastructure',
    question: '¿El sistema gestiona o controla infraestructura crítica (transporte, gestión del tráfico, suministros de agua, gas, electricidad, telecomunicaciones)?',
    helpText: 'Ejemplos: gestión de semáforos inteligentes, control de redes eléctricas, sistemas de agua potable.',
    article: 'Art. 6.2',
    yesResult: 'high',
    yesArticles: ['Art. 6.2', 'Art. 8-15'],
  },
  {
    id: 'education_vocational',
    question: '¿El sistema evalúa o decide sobre el acceso a educación, admisión a instituciones educativas, o orientación vocacional/educativa?',
    helpText: 'Ejemplos: sistemas de admisión universitaria, evaluación de exámenes, recomendación de carreras.',
    article: 'Art. 6.3.a',
    yesResult: 'high',
    yesArticles: ['Art. 6.3.a', 'Art. 8-15'],
  },
  {
    id: 'employment',
    question: '¿El sistema se utiliza para reclutamiento, selección de personal, evaluación de desempeño, promociones o despido de trabajadores?',
    helpText: 'Ejemplos: screening de CVs, análisis de videoentrevistas, evaluación de productividad.',
    article: 'Art. 6.3.b',
    yesResult: 'high',
    yesArticles: ['Art. 6.3.b', 'Art. 8-15'],
  },
  {
    id: 'essential_services',
    question: '¿El sistema evalúa el acceso o asignación de servicios esenciales (vivienda, atención médica, créditos, seguros) o determina precios/prestaciones?',
    helpText: 'Ejemplos: aprobación de hipotecas, evaluación de solicitudes de crédito, seguros de vida/salud.',
    article: 'Art. 6.3.c',
    yesResult: 'high',
    yesArticles: ['Art. 6.3.c', 'Art. 8-15'],
  },
  {
    id: 'law_enforcement',
    question: '¿El sistema es utilizado por autoridades policiales o de aplicación de la ley para evaluar riesgo de reincidencia, perfilado, o análisis de evidencia?',
    helpText: 'Ejemplos: evaluación de riesgo de reincidencia, perfilado de delincuentes, análisis de evidencia digital.',
    article: 'Art. 6.3.d',
    yesResult: 'high',
    yesArticles: ['Art. 6.3.d', 'Art. 8-15'],
  },
  {
    id: 'migration_asylum',
    question: '¿El sistema ayuda a evaluar solicitudes de asilo, visados, residencia, o controla fronteras?',
    helpText: 'Ejemplos: evaluación de credibilidad en asilo, análisis de documentos de viaje, control fronterizo automatizado.',
    article: 'Art. 6.3.e',
    yesResult: 'high',
    yesArticles: ['Art. 6.3.e', 'Art. 8-15'],
  },
  {
    id: 'justice',
    question: '¿El sistema asiste a autoridades judiciales en la investigación, interpretación de hechos, o toma de decisiones legales?',
    helpText: 'Ejemplos: análisis de precedentes, recomendación de sentencias, evaluación de evidencia legal.',
    article: 'Art. 6.3.f',
    yesResult: 'high',
    yesArticles: ['Art. 6.3.f', 'Art. 8-15'],
  },
  {
    id: 'chatbot_genai',
    question: '¿El sistema es un chatbot, asistente virtual o utiliza IA generativa para interactuar con personas (ej: generar texto, imágenes, audio)?',
    helpText: 'Ejemplos: chatbots de atención al cliente, asistentes virtuales, generadores de contenido, deepfakes.',
    article: 'Art. 52',
    yesResult: 'limited',
    yesArticles: ['Art. 52'],
  },
  {
    id: 'automation_simple',
    question: '¿El sistema realiza tareas de automatización simple, juegos, o recomendaciones básicas sin afectar significativamente derechos fundamentales?',
    helpText: 'Ejemplos: filtros de spam, juegos con IA, recomendaciones de productos básicas, análisis de datos internos.',
    article: 'Sin artículo específico',
    yesResult: 'continue',
    yesArticles: [],
  },
];

export default function ClassificationWizardPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const useCaseId = params.id as string;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(null);

  // Respuestas del wizard
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | null>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    loadUseCase();
  }, [useCaseId]);

  const loadUseCase = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (error) throw error;

      setUseCase(data);

      // If already classified, show result
      if (data.ai_act_level !== 'unclassified' && data.classification_data) {
        setResult({
          level:
            data.ai_act_level === 'high_risk'
              ? 'high'
              : data.ai_act_level === 'limited_risk'
              ? 'limited'
              : data.ai_act_level === 'minimal_risk'
              ? 'minimal'
              : data.ai_act_level === 'prohibited'
              ? 'prohibited'
              : 'unclassified',
          confidence: data.confidence_score || 0,
          reasoning: data.classification_reason || '',
          articles: data.classification_data.articles || [],
          obligations: data.classification_data.obligations || [],
        });
        setCurrentStep(4);
      }
    } catch (error: any) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
    }
  };

  const calculateClassification = (): ClassificationResult => {
    let level: ClassificationResult['level'] = 'minimal';
    let confidence = 0.9;
    const articles: string[] = [];
    const obligations: string[] = [];

    // Check for prohibited first
    for (const q of questions) {
      if (answers[q.id] === 'yes') {
        if (q.yesResult === 'prohibited') {
          return {
            level: 'prohibited',
            confidence: 0.95,
            reasoning: `El sistema cumple con criterios prohibidos según ${q.article}: ${q.question}`,
            articles: q.yesArticles || [q.article],
            obligations: ['No implementar el sistema', 'Desmantelar si ya está en uso', 'Consultar con asesor legal especializado'],
          };
        } else if (q.yesResult === 'high') {
          level = 'high';
          articles.push(...(q.yesArticles || [q.article]));
        } else if (q.yesResult === 'limited' && level !== 'high') {
          level = 'limited';
          articles.push(...(q.yesArticles || [q.article]));
        }
      }
    }

    // Generate obligations based on level
    if (level === 'high') {
      obligations.push(
        'Sistema de gestión de riesgos (Art. 9)',
        'Gestión de datos de entrenamiento (Art. 10)',
        'Documentación técnica (Art. 11)',
        'Registro y logs de funcionamiento (Art. 12)',
        'Transparencia e información a usuarios (Art. 13)',
        'Supervisión humana efectiva (Art. 14)',
        'Exactitud, robustez y ciberseguridad (Art. 15)',
        'Evaluación de conformidad (Art. 20)',
        'Registro en base de datos de la UE (Art. 71)'
      );
    } else if (level === 'limited') {
      obligations.push(
        'Informar a los usuarios que interactúan con IA (Art. 52)',
        'Marcar contenido generado por IA de forma clara (Art. 52.3)',
        'Documentar el uso del sistema'
      );
    } else {
      obligations.push(
        'Documentación interna del uso',
        'Prácticas de gobernanza de IA recomendadas'
      );
    }

    // Deduplicate articles
    const uniqueArticles = [...new Set(articles)];

    return {
      level,
      confidence,
      reasoning: `Clasificación basada en respuestas al cuestionario AI Act. Nivel determinado por criterios del ${uniqueArticles[0] || 'análisis general'}.`,
      articles: uniqueArticles,
      obligations,
    };
  };

  const handleAnswer = (value: 'yes' | 'no') => {
    const question = questions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));

    // Auto-advance on prohibited detection
    if (value === 'yes' && question.yesResult === 'prohibited') {
      // Immediately show prohibited result
      const result = calculateClassification();
      setResult(result);
      setCurrentStep(3);
      return;
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered, go to review
      const result = calculateClassification();
      setResult(result);
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleConfirm = async () => {
    if (!result) return;

    setIsLoading(true);
    try {
      const apiLevelMap: Record<string, string> = {
        prohibited: 'prohibited',
        high: 'high_risk',
        limited: 'limited_risk',
        minimal: 'minimal_risk',
        unclassified: 'unclassified',
      };

      const { error } = await supabase
        .from('use_cases')
        .update({
          ai_act_level: apiLevelMap[result.level],
          confidence_score: result.confidence,
          classification_reason: result.reasoning,
          classification_data: {
            articles: result.articles,
            obligations: result.obligations,
            answers,
          },
          status: result.level === 'prohibited' ? 'non_compliant' : 'classified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', useCaseId);

      if (error) throw error;

      setCurrentStep(4);
      toast({
        title: 'Clasificación guardada',
        description: `Nivel de riesgo: ${result.level}`,
      });
    } catch (error: any) {
      console.error('Error saving classification:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la clasificación',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    1: 'Revisión',
    2: 'Clasificación',
    3: 'Confirmación',
    4: 'Resultado',
  };

  const progress = (currentStep / 4) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Revisa la información de tu caso de uso antes de continuar con la clasificación.
                Si necesitas modificar algo, puedes editarlo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Nombre</Label>
                <p className="text-lg font-medium">{useCase?.name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Descripción</Label>
                <p className="text-gray-700">{useCase?.description || 'Sin descripción'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Sector</Label>
                <p className="text-gray-700">{sectorLabels[useCase?.sector || ''] || useCase?.sector}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/dashboard/inventory/${useCaseId}/edit`}>
                <Button variant="outline">Editar información</Button>
              </Link>
            </div>
          </div>
        );

      case 2:
        const currentQ = questions[currentQuestionIndex];
        const progressQ = ((currentQuestionIndex + 1) / questions.length) * 100;

        return (
          <div className="space-y-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                <span>{Math.round(progressQ)}%</span>
              </div>
              <Progress value={progressQ} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  {currentQuestionIndex + 1}
                </span>
                <h3 className="text-lg font-medium leading-tight">{currentQ.question}</h3>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg flex gap-2">
                <HelpCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{currentQ.helpText}</p>
              </div>

              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={(v: string) => handleAnswer(v as 'yes' | 'no')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer flex-1">
                    Sí, aplica a mi caso de uso
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer flex-1">
                    No, no aplica
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {currentQuestionIndex > 0 && (
              <Button variant="ghost" onClick={handleBack} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Pregunta anterior
              </Button>
            )}
          </div>
        );

      case 3:
        if (!result) return null;
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Resultado de la clasificación</p>
              <RiskBadge level={result.level} size="lg" showIcon />
              <p className="text-sm text-gray-500 mt-2">
                Confianza: {Math.round(result.confidence * 100)}%
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Razonamiento</h4>
              <p className="text-sm text-gray-600">{result.reasoning}</p>
            </div>

            {result.articles.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Artículos Aplicables</h4>
                <div className="flex flex-wrap gap-2">
                  {result.articles.map((article) => (
                    <span
                      key={article}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                    >
                      {article}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.level === 'prohibited' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Sistema Prohibido</p>
                  <p className="text-sm text-red-700 mt-1">
                    Este tipo de sistema está prohibido por el AI Act de la UE. 
                    No debe implementarse y, si ya existe, debe desmantelarse.
                    Consulta con un asesor legal especializado.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Volver a revisar
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar clasificación
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 4:
        if (!result) return null;
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Clasificación Completada</h3>
              <p className="text-gray-600 mt-2">Tu caso de uso ha sido clasificado según el EU AI Act</p>
            </div>

            <div className="flex justify-center">
              <RiskBadge level={result.level} size="lg" showIcon />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Obligaciones de Cumplimiento</h4>
              <ul className="space-y-2">
                {result.obligations.map((obligation, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {obligation}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Link href={`/dashboard/inventory/${useCaseId}`}>
                <Button variant="outline">Ver detalle</Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button>Volver al inventario</Button>
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Asistente de Clasificación AI Act
        </h1>
        <p className="text-gray-600">
          Clasifica tu caso de uso según el Reglamento UE de Inteligencia Artificial
        </p>
      </header>

      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          {([1, 2, 3, 4] as Step[]).map((step) => (
            <span
              key={step}
              className={`${
                step <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              {stepTitles[step]}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{stepTitles[currentStep]}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
        {currentStep === 1 && (
          <CardFooter className="flex justify-end pt-6">
            <Button onClick={() => setCurrentStep(2)}>
              Continuar a clasificación
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
