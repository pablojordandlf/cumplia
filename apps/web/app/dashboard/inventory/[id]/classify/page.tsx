'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AiActWizard, RiskLevel } from '@/components/ai-act-wizard';

interface ClassificationResultWithAnswers {
  level: RiskLevel;
  confidence: number;
  reasoning: string[];
  applicableArticles: string[];
  wizardAnswers?: Record<string, string>;
}

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

const levelLabels: Record<RiskLevel, string> = {
  prohibited: 'Prohibido',
  high: 'Alto Riesgo',
  limited: 'Riesgo Limitado',
  minimal: 'Riesgo Mínimo',
  unclassified: 'No Clasificado',
};

export default function ClassificationWizardPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const useCaseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [existingClassification, setExistingClassification] = useState<ClassificationResultWithAnswers | null>(null);
  const [showWizard, setShowWizard] = useState(false);

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

      // If already classified, show existing result
      if (data.ai_act_level && data.ai_act_level !== 'unclassified' && data.classification_data) {
        const levelMap: Record<string, RiskLevel> = {
          prohibited: 'prohibited',
          high_risk: 'high',
          limited_risk: 'limited',
          minimal_risk: 'minimal',
          unclassified: 'unclassified',
        };
        
        setExistingClassification({
          level: levelMap[data.ai_act_level] || 'unclassified',
          confidence: data.confidence_score || 0,
          reasoning: data.classification_data.reasoning || [data.classification_reason || ''],
          applicableArticles: data.classification_data.applicable_articles || data.classification_data.articles || [],
          wizardAnswers: data.classification_data.wizard_answers || {},
        });
      } else {
        setShowWizard(true);
      }
    } catch (error: any) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassificationComplete = async (result: ClassificationResultWithAnswers) => {
    setIsSaving(true);
    
    try {
      const apiLevelMap: Record<RiskLevel, string> = {
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
          classification_reason: result.reasoning.join('. '),
          classification_data: {
            applicable_articles: result.applicableArticles,
            reasoning: result.reasoning,
            wizard_answers: result.wizardAnswers || existingClassification?.wizardAnswers || {},
          },
          status: result.level === 'prohibited' ? 'non_compliant' : 'classified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', useCaseId);

      if (error) throw error;

      setExistingClassification(result);
      setShowWizard(false);
      
      toast({
        title: 'Clasificación guardada',
        description: `Nivel: ${levelLabels[result.level]}`,
      });
    } catch (error: any) {
      console.error('Error saving classification:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la clasificación',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setShowWizard(true);
    // Keep existingClassification to preserve wizardAnswers for initialAnswers
    // Only clear if we want a fresh start (user can clear answers in wizard)
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Show existing classification result
  if (!showWizard && existingClassification) {
    const { level, confidence, reasoning, applicableArticles } = existingClassification;
    
    const riskColors: Record<RiskLevel, { bg: string; border: string; text: string }> = {
      prohibited: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      high: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
      limited: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      minimal: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      unclassified: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
    };
    
    const colors = riskColors[level];

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href={`/dashboard/inventory/${useCaseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al detalle
            </Button>
          </Link>
        </div>

        <Card className={`${colors.bg} ${colors.border} border-2`}>
          <CardHeader className="text-center">
            <div className={`text-6xl mb-4 ${colors.text}`}>
              {level === 'prohibited' && '🚫'}
              {level === 'high' && '⚠️'}
              {level === 'limited' && 'ℹ️'}
              {level === 'minimal' && '✅'}
              {level === 'unclassified' && '❓'}
            </div>
            <CardTitle className={`text-2xl ${colors.text}`}>
              {levelLabels[level]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-6 text-center">
              <div>
                <p className="text-sm text-gray-500">Confianza</p>
                <p className="text-xl font-semibold">{Math.round(confidence * 100)}%</p>
              </div>
              {applicableArticles.length > 0 && (
                <>
                  <div className="w-px bg-gray-300" />
                  <div>
                    <p className="text-sm text-gray-500">Artículos</p>
                    <p className="text-sm font-medium">{applicableArticles.join(', ')}</p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Razonamiento</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {reasoning.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleRestart}>
                Reclasificar
              </Button>
              <Link href={`/dashboard/inventory/${useCaseId}`}>
                <Button>Ver detalle completo</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/dashboard/inventory/${useCaseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al detalle
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Asistente de Clasificación AI Act
          </h1>
          <p className="text-gray-600">
            {useCase ? `Clasificando: ${useCase.name}` : 'Clasifica tu caso de uso según el Reglamento UE de Inteligencia Artificial'}
          </p>
          {useCase?.sector && (
            <p className="text-sm text-gray-500 mt-1">
              Sector: {sectorLabels[useCase.sector] || useCase.sector}
            </p>
          )}
        </header>

        <AiActWizard
          useCaseId={useCaseId}
          onComplete={handleClassificationComplete}
          onCancel={() => router.push(`/dashboard/inventory/${useCaseId}`)}
          initialAnswers={existingClassification?.wizardAnswers}
        />

        {isSaving && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Guardando clasificación...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
