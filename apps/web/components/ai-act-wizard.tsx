'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';



type RiskFocus = 'prohibited' | 'high' | 'limited' | 'minimal';

interface Question {
  id: string;
  question: string;
  description: string;
  article?: string;
  riskFocus: RiskFocus;
  riskLabel: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

const riskFocusConfig: Record<RiskFocus, { bg: string; text: string; border: string; icon: string }> = {
  prohibited: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🔴' },
  high: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🟠' },
  limited: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '🟢' },
  minimal: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🔵' },
};

const questions: Question[] = [
  {
    id: 'manipulation',
    question: '¿El sistema utiliza técnicas subliminales o explota vulnerabilidades?',
    description: 'Técnicas que influyen en el comportamiento de forma que las personas no lo perciben conscientemente, o explotan vulnerabilidades de grupos específicos (niños, personas con discapacidad).',
    article: 'Art. 5.1.a y 5.1.b',
    riskFocus: 'prohibited',
    riskLabel: 'Prácticas Prohibidas',
    options: [
      { value: 'yes', label: 'Sí', description: 'Usa técnicas subliminales o explota vulnerabilidades' },
      { value: 'no', label: 'No', description: 'No utiliza estas técnicas' },
    ],
  },
  {
    id: 'social_scoring',
    question: '¿El sistema realiza evaluación social por autoridades públicas?',
    description: 'Evaluación o clasificación de personas físicas basada en su comportamiento social, personalidad, características socioeconómicas, etc., que conduce a un tratamiento desfavorable.',
    article: 'Art. 5.1.c',
    riskFocus: 'prohibited',
    riskLabel: 'Prácticas Prohibidas',
    options: [
      { value: 'yes', label: 'Sí', description: 'Autoridad pública evalúa scoring social' },
      { value: 'no', label: 'No', description: 'No aplica scoring social por autoridades' },
    ],
  },
  {
    id: 'biometric_remote',
    question: '¿El sistema realiza identificación biométrica remota en tiempo real en espacios públicos?',
    description: 'Identificación de personas mediante características biométricas (reconocimiento facial, de iris, etc.) en tiempo real en espacios públicos.',
    article: 'Art. 5.1.h',
    riskFocus: 'prohibited',
    riskLabel: 'Prácticas Prohibidas',
    options: [
      { value: 'yes_law', label: 'Sí, para aplicación de la ley', description: 'Uso por fuerzas del orden' },
      { value: 'yes_other', label: 'Sí, para otros fines', description: 'Marketing, seguridad privada, etc.' },
      { value: 'no', label: 'No', description: 'No usa identificación biométrica remota' },
    ],
  },
  {
    id: 'biometric_categorization',
    question: '¿El sistema categoriza personas por características biométricas sensibles?',
    description: 'Clasificación de personas según raza, orientación sexual, afiliación política, religiosa o sindical a partir de datos biométricos.',
    article: 'Art. 5.1.g',
    riskFocus: 'prohibited',
    riskLabel: 'Prácticas Prohibidas',
    options: [
      { value: 'yes', label: 'Sí', description: 'Categoriza por características sensibles' },
      { value: 'no', label: 'No', description: 'No categoriza biométricamente' },
    ],
  },
  {
    id: 'emotion_inference',
    question: '¿El sistema infiere emociones en el lugar de trabajo o instituciones educativas?',
    description: 'Sistemas que detectan o infieren estados emocionales de empleados, estudiantes o personas en estos entornos.',
    article: 'Art. 5.1.f',
    riskFocus: 'prohibited',
    riskLabel: 'Prácticas Prohibidas',
    options: [
      { value: 'yes_work', label: 'Sí, en trabajo', description: 'Monitorización emocional laboral' },
      { value: 'yes_education', label: 'Sí, en educación', description: 'Monitorización emocional educativa' },
      { value: 'medical', label: 'No, es uso médico/terapéutico', description: 'Excepción permitida' },
      { value: 'no', label: 'No aplica', description: 'No infiere emociones en estos contextos' },
    ],
  },
  {
    id: 'high_risk_sector',
    question: '¿El sistema se utiliza en alguno de estos sectores de alto riesgo?',
    description: 'Sistemas críticos que pueden afectar gravemente a los derechos fundamentales.',
    article: 'Art. 6 (Anexo III)',
    riskFocus: 'high',
    riskLabel: 'Alto Riesgo',
    options: [
      { value: 'critical_infra', label: 'Infraestructura crítica', description: 'Transporte, energía, agua, salud, telecomunicaciones' },
      { value: 'education', label: 'Educación y formación vocacional', description: 'Acceso, evaluación educativa' },
      { value: 'employment', label: 'Empleo y gestión laboral', description: 'Contratación, selección, promoción, despido' },
      { value: 'essential_services', label: 'Servicios esenciales privados y públicos', description: 'Crédito, seguros, asistencia sanitaria, servicios públicos' },
      { value: 'law_enforcement', label: 'Aplicación de la ley', description: 'Evaluación de riesgo, investigación criminal, análisis de evidencia' },
      { value: 'migration', label: 'Migración, asilo y fronteras', description: 'Evaluación de solicitudes, detección de documentos fraudulentos' },
      { value: 'justice', label: 'Administración de justicia y procesos democráticos', description: 'Asistencia judicial, influencia en elecciones' },
      { value: 'none', label: 'Ninguno de los anteriores', description: 'No aplica a sectores de alto riesgo' },
    ],
  },
  {
    id: 'chatbot',
    question: '¿El sistema es un chatbot o sistema de conversación con personas?',
    description: 'Sistemas de IA que interactúan mediante texto o voz con personas, simulando conversación humana.',
    article: 'Art. 52',
    riskFocus: 'limited',
    riskLabel: 'Riesgo Limitado',
    options: [
      { value: 'yes', label: 'Sí', description: 'Chatbot, asistente virtual, etc.' },
      { value: 'no', label: 'No', description: 'No interactúa conversacionalmente' },
    ],
  },
  {
    id: 'generated_content',
    question: '¿El sistema genera o manipula contenido (texto, imagen, audio, video)?',
    description: 'Sistemas que crean contenido sintético como deepfakes, generación de texto, imágenes, etc.',
    article: 'Art. 52',
    riskFocus: 'limited',
    riskLabel: 'Riesgo Limitado',
    options: [
      { value: 'deepfake', label: 'Sí, deepfakes o manipulación de contenido', description: 'Videos, audios o imágenes alterados' },
      { value: 'synthetic', label: 'Sí, contenido generado por IA', description: 'Texto, imágenes, audio sintético' },
      { value: 'no', label: 'No genera contenido', description: 'Análisis, predicción, otros fines' },
    ],
  },
  {
    id: 'human_interaction',
    question: '¿El sistema toma decisiones que afectan significativamente a personas?',
    description: 'Decisiones automatizadas con impacto legal o significativo en derechos.',
    riskFocus: 'minimal',
    riskLabel: 'Riesgo Mínimo / General',
    options: [
      { value: 'fully_auto', label: 'Sí, totalmente automatizado', description: 'Sin intervención humana significativa' },
      { value: 'human_assisted', label: 'Sí, con asistencia humana', description: 'Humano en el circuito de decisión' },
      { value: 'minimal', label: 'No o impacto mínimo', description: 'Tareas operativas simples' },
    ],
  },
];

export interface ClassificationResult {
  level: RiskLevel;
  confidence: number;
  reasoning: string[];
  applicableArticles: string[];
  wizardAnswers?: Record<string, string>;
}

function calculateClassification(answers: Record<string, string>): ClassificationResult {
  const reasoning: string[] = [];
  const applicableArticles: string[] = [];
  
  // Check prohibited (Art. 5)
  if (answers.manipulation === 'yes') {
    return {
      level: 'prohibited',
      confidence: 0.95,
      reasoning: ['El sistema utiliza técnicas subliminales o explota vulnerabilidades (Art. 5.1.a/b)'],
      applicableArticles: ['Art. 5.1.a', 'Art. 5.1.b'],
    };
  }
  
  if (answers.social_scoring === 'yes') {
    return {
      level: 'prohibited',
      confidence: 0.95,
      reasoning: ['El sistema realiza scoring social por autoridades públicas (Art. 5.1.c)'],
      applicableArticles: ['Art. 5.1.c'],
    };
  }
  
  if (answers.biometric_remote === 'yes_other') {
    return {
      level: 'prohibited',
      confidence: 0.95,
      reasoning: ['El sistema realiza identificación biométrica remota en espacios públicos para fines no autorizados (Art. 5.1.h)'],
      applicableArticles: ['Art. 5.1.h'],
    };
  }
  
  if (answers.biometric_categorization === 'yes') {
    return {
      level: 'prohibited',
      confidence: 0.95,
      reasoning: ['El sistema categoriza personas por características biométricas sensibles (Art. 5.1.g)'],
      applicableArticles: ['Art. 5.1.g'],
    };
  }
  
  if (answers.emotion_inference === 'yes_work' || answers.emotion_inference === 'yes_education') {
    return {
      level: 'prohibited',
      confidence: 0.90,
      reasoning: ['El sistema infiere emociones en el trabajo o educación (Art. 5.1.f)'],
      applicableArticles: ['Art. 5.1.f'],
    };
  }
  
  // Check high-risk (Art. 6)
  if (answers.high_risk_sector && answers.high_risk_sector !== 'none') {
    const sectorNames: Record<string, string> = {
      critical_infra: 'infraestructura crítica',
      education: 'educación',
      employment: 'empleo',
      essential_services: 'servicios esenciales',
      law_enforcement: 'aplicación de la ley',
      migration: 'migración y fronteras',
      justice: 'justicia y procesos democráticos',
    };
    
    return {
      level: 'high',
      confidence: 0.90,
      reasoning: [`El sistema opera en el sector de ${sectorNames[answers.high_risk_sector] || 'alto riesgo'} según el Anexo III del AI Act (Art. 6)`],
      applicableArticles: ['Art. 6', 'Anexo III'],
    };
  }
  
  // Check limited risk (Art. 52)
  if (answers.chatbot === 'yes') {
    return {
      level: 'limited',
      confidence: 0.85,
      reasoning: ['El sistema es un chatbot que interactúa con personas (Art. 52)'],
      applicableArticles: ['Art. 52'],
    };
  }
  
  if (answers.generated_content === 'deepfake' || answers.generated_content === 'synthetic') {
    return {
      level: 'limited',
      confidence: 0.80,
      reasoning: ['El sistema genera contenido sintético que debe ser identificado como generado por IA (Art. 52)'],
      applicableArticles: ['Art. 52'],
    };
  }
  
  // Default to minimal risk
  return {
    level: 'minimal',
    confidence: 0.70,
    reasoning: ['El sistema no cumple los criterios de sistemas prohibidos, de alto riesgo o de riesgo limitado'],
    applicableArticles: [],
  };
}

interface AiActWizardProps {
  useCaseId: string;
  onComplete: (result: ClassificationResult) => void;
  onCancel?: () => void;
  initialAnswers?: Record<string, string>;
  readOnly?: boolean;
}

export function AiActWizard({ useCaseId, onComplete, onCancel, initialAnswers, readOnly }: AiActWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update answers if initialAnswers changes (for review mode)
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);
  
  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion.id];
  
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };
  
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    const result = calculateClassification(answers);
    // Include wizard answers for review mode
    const resultWithAnswers = { ...result, wizardAnswers: answers };
    setIsSubmitting(true);
    
    try {
      // Save classification via API
      const response = await fetch(`/api/use-cases/${useCaseId}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_act_level: result.level,
          confidence: result.confidence,
          reasoning: result.reasoning,
          applicable_articles: result.applicableArticles,
          wizard_answers: answers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error saving classification');
      }
      
      onComplete(resultWithAnswers);
    } catch (error) {
      console.error('Error saving classification:', error);
      // Still complete even if save fails
      onComplete(resultWithAnswers);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getRiskLevelInfo = (level: RiskLevel) => {
    switch (level) {
      case 'prohibited':
        return {
          icon: Ban,
          title: 'Sistema Prohibido',
          description: 'Este sistema no puede ser desplegado según el Artículo 5 del AI Act.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'high':
        return {
          icon: ShieldAlert,
          title: 'Alto Riesgo (High-Risk)',
          description: 'El sistema requiere cumplimiento estricto con los requisitos de los Artículos 8-15 del AI Act.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'limited':
        return {
          icon: AlertTriangle,
          title: 'Riesgo Limitado (Limited-Risk)',
          description: 'El sistema debe cumplir con las obligaciones de transparencia del Artículo 52.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'minimal':
        return {
          icon: ShieldCheck,
          title: 'Riesgo Mínimo (Minimal-Risk)',
          description: 'El sistema tiene libertad de uso con recomendaciones de buenas prácticas voluntarias.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      default:
        return {
          icon: Info,
          title: 'No Clasificado',
          description: 'Se requiere análisis adicional.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };
  
  if (showResult) {
    const result = calculateClassification(answers);
    const riskInfo = getRiskLevelInfo(result.level);
    const Icon = riskInfo.icon;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className={cn("text-center", riskInfo.bgColor)}>
          <div className="mx-auto mb-4">
            <Icon className={cn("h-16 w-16", riskInfo.color)} />
          </div>
          <CardTitle className={cn("text-2xl", riskInfo.color)}>
            {riskInfo.title}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {riskInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Confianza</p>
              <p className="text-2xl font-bold">{Math.round(result.confidence * 100)}%</p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm text-gray-500">Artículos aplicables</p>
              <p className="text-lg font-medium">
                {result.applicableArticles.length > 0 
                  ? result.applicableArticles.join(', ') 
                  : 'Ninguno específico'}
              </p>
            </div>
          </div>
          
          <div className={cn("rounded-lg border p-4", riskInfo.bgColor, riskInfo.borderColor)}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              <h4 className="font-semibold">Razonamiento</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {result.reasoning.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowResult(false)}
              disabled={isSubmitting}
            >
              Revisar respuestas
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                result.level === 'prohibited' ? 'bg-red-600 hover:bg-red-700' :
                result.level === 'high' ? 'bg-amber-600 hover:bg-amber-700' :
                result.level === 'limited' ? 'bg-green-600 hover:bg-green-700' :
                'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar clasificación'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Pregunta {currentStep + 1} de {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% completado
          </span>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        {/* Step indicators - clickable when in review mode (has initialAnswers) */}
        <div className="flex justify-center gap-1 flex-wrap">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentStep;
            const canNavigate = initialAnswers && Object.keys(initialAnswers).length > 0;
            return (
              <button
                key={q.id}
                onClick={() => canNavigate && setCurrentStep(idx)}
                disabled={!canNavigate}
                className={`
                  w-8 h-8 rounded-full text-xs font-medium transition-all
                  ${isCurrent 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-200' 
                    : isAnswered 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-400'}
                  ${canNavigate ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : 'cursor-default'}
                `}
                title={canNavigate ? `Ir a pregunta ${idx + 1}: ${q.riskLabel}` : `Pregunta ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 border",
            riskFocusConfig[currentQuestion.riskFocus].bg,
            riskFocusConfig[currentQuestion.riskFocus].text,
            riskFocusConfig[currentQuestion.riskFocus].border
          )}>
            <span>{riskFocusConfig[currentQuestion.riskFocus].icon}</span>
            <span>{currentQuestion.riskLabel}</span>
            {currentQuestion.article && (
              <span className="opacity-75">• {currentQuestion.article}</span>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {currentQuestion.question}
          </h3>
          <p className="text-gray-600 mb-4">
            {currentQuestion.description}
          </p>
        </div>
        
        <RadioGroup 
          value={currentAnswer} 
          onValueChange={handleAnswer}
          className="space-y-3"
        >
          {currentQuestion.options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                currentAnswer === option.value 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => handleAnswer(option.value)}
            >
              <RadioGroupItem 
                value={option.value} 
                id={option.value}
                className="mt-1"
              />
              <div className="flex-1">
                <Label 
                  htmlFor={option.value}
                  className="font-medium cursor-pointer"
                >
                  {option.label}
                </Label>
                {option.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentAnswer || isSubmitting}
          >
            {currentStep === questions.length - 1 ? 'Ver resultado' : 'Siguiente'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AiActWizard;
