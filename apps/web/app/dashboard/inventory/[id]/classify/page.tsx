'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/risk-badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCasesApi, UseCase } from '@/lib/api/use-cases';
import { ApiError } from '@/lib/api/client';

const sectors = [
  { value: 'Salud', label: 'Salud' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Seguridad Pública', label: 'Seguridad Pública' },
  { value: 'Empleo', label: 'Empleo' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Finanzas', label: 'Finanzas' },
  { value: 'Justicia', label: 'Justicia' },
  { value: 'Otro', label: 'Otro' },
];

interface ClassificationResult {
  level: 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';
  confidence: number;
  reasoning: string;
  articles: string[];
  obligations: string[];
}

type Step = 1 | 2 | 3 | 4;

// Map backend level to frontend level
const levelMap: Record<string, ClassificationResult['level']> = {
  'prohibited': 'prohibited',
  'high_risk': 'high',
  'limited_risk': 'limited',
  'minimal_risk': 'minimal',
  'unclassified': 'unclassified',
};

export default function ClassificationWizardPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const useCaseId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');

  // Load use case data
  useEffect(() => {
    loadUseCase();
  }, [useCaseId]);

  const loadUseCase = async () => {
    try {
      const data = await useCasesApi.get(useCaseId);
      setUseCase(data);
      setName(data.name);
      setDescription(data.description || '');
      setSector(data.sector);
      
      // If already classified, show result
      if (data.ai_act_level !== 'unclassified' && data.classification_data) {
        setResult({
          level: levelMap[data.ai_act_level] || 'unclassified',
          confidence: data.confidence_score || 0,
          reasoning: data.classification_reason || '',
          articles: data.classification_data.articles || [],
          obligations: data.classification_data.obligations || [],
        });
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
    }
  };

  const stepTitles: Record<Step, string> = {
    1: 'Información',
    2: 'Sector',
    3: 'Propósito',
    4: 'Resultado',
  };

  const progress = (currentStep / 4) * 100;

  const handleNext = () => {
    if (currentStep < 4) {
      if (currentStep === 3) {
        handleClassify();
      } else {
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleClassify = async () => {
    setIsLoading(true);
    try {
      // Update use case with latest info
      await useCasesApi.update(useCaseId, {
        name,
        description,
        sector,
      });
      
      // Call classification endpoint
      const classified = await useCasesApi.classify(useCaseId);
      
      // Format result
      setResult({
        level: levelMap[classified.ai_act_level] || 'unclassified',
        confidence: classified.confidence_score || 0,
        reasoning: classified.classification_reason || '',
        articles: classified.classification_data?.articles || [],
        obligations: classified.classification_data?.obligations || [],
      });
      
      setCurrentStep(4);
      
      toast({
        title: 'Clasificación completada',
        description: `Nivel de riesgo: ${classified.ai_act_level}`,
      });
    } catch (error) {
      console.error('Error classifying use case:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'No se pudo clasificar el caso de uso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard/inventory');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Caso de Uso</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Propósito Principal</Label>
              <p className="text-sm text-gray-600 mt-1">
                Describe el propósito específico del sistema de IA y cómo se utiliza.
              </p>
            </div>
            <div>
              <Label>Impacto Potencial</Label>
              <p className="text-sm text-gray-600 mt-1">
                Considera cómo el sistema puede afectar derechos fundamentales, seguridad, o acceso a servicios esenciales.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Analizando caso de uso...</p>
              </div>
            ) : result ? (
              <>
                <div className="text-center">
                  <RiskBadge level={result.level} size="lg" showIcon />
                  <p className="text-sm text-gray-500 mt-2">
                    Confianza: {Math.round(result.confidence * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Razonamiento</h4>
                  <p className="text-sm text-gray-600">{result.reasoning}</p>
                </div>

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

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Obligaciones de Cumplimiento</h4>
                  <ul className="space-y-1">
                    {result.obligations.map((obligation, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {obligation}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Asistente de Clasificación
        </h1>
        <p className="text-gray-600">
          Clasifica tu caso de uso según el EU AI Act
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
        <CardFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => router.push('/dashboard/inventory') : handlePrevious}
          >
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clasificando...
              </>
            ) : currentStep === 3 ? (
              'Clasificar'
            ) : currentStep === 4 ? (
              'Guardar y Finalizar'
            ) : (
              'Siguiente'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
