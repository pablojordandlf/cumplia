'use client';

import { useState, useEffect } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  ChevronLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Brain,
  Users,
  Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Schema para el cuestionario de clasificación
const classificationSchema = z.object({
  // Artículo 5 - Sistemas prohibidos
  isSubliminal: z.boolean(),
  isSocialScoring: z.boolean(),
  isRealTimeBiometric: z.boolean(),
  exploitsVulnerabilities: z.boolean(),
  
  // Artículo 6 - Sistemas de alto riesgo (Anexo III)
  isBiometricIdentification: z.boolean(),
  isCriticalInfrastructure: z.boolean(),
  isEducationVocational: z.boolean(),
  isEmployment: z.boolean(),
  isAccessToServices: z.boolean(),
  isLawEnforcement: z.boolean(),
  isMigrationAsylum: z.boolean(),
  isJusticeDemocratic: z.boolean(),
  
  // Anexo II - Productos de seguridad
  isSafetyComponent: z.boolean(),
  
  // GPAI
  isGeneralPurposeAI: z.boolean(),
  hasSystemicRisk: z.boolean(),
  
  // Interacción
  interactsWithHumans: z.boolean(),
  isEmotionRecognition: z.boolean(),
  isBiometricCategorization: z.boolean(),
  generatesDeepfakes: z.boolean(),
});

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
    description: 'Sistema de alto riesgo sujeto a obligaciones estrictas de cumplimiento (Arts. 6-51).',
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

export default function ClassifyUseCasePage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;
  
  const [useCase, setUseCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof classificationSchema>>({
    resolver: zodResolver(classificationSchema),
    defaultValues: {
      isSubliminal: false,
      isSocialScoring: false,
      isRealTimeBiometric: false,
      exploitsVulnerabilities: false,
      isBiometricIdentification: false,
      isCriticalInfrastructure: false,
      isEducationVocational: false,
      isEmployment: false,
      isAccessToServices: false,
      isLawEnforcement: false,
      isMigrationAsylum: false,
      isJusticeDemocratic: false,
      isSafetyComponent: false,
      isGeneralPurposeAI: false,
      hasSystemicRisk: false,
      interactsWithHumans: false,
      isEmotionRecognition: false,
      isBiometricCategorization: false,
      generatesDeepfakes: false,
    },
  });

  useEffect(() => {
    loadUseCase();
  }, [useCaseId]);

  async function loadUseCase() {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (error) throw error;
      setUseCase(data);
    } catch (error) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
      router.push('/dashboard/inventory');
    } finally {
      setLoading(false);
    }
  }

  function calculateRiskLevel(values: z.infer<typeof classificationSchema>): string {
    // Artículo 5 - Prohibidos
    if (values.isSubliminal || values.isSocialScoring || values.isRealTimeBiometric || values.exploitsVulnerabilities) {
      return 'prohibited';
    }

    // Artículo 6 y Anexo III - Alto riesgo
    if (
      values.isBiometricIdentification ||
      values.isCriticalInfrastructure ||
      values.isEducationVocational ||
      values.isEmployment ||
      values.isAccessToServices ||
      values.isLawEnforcement ||
      values.isMigrationAsylum ||
      values.isJusticeDemocratic ||
      values.isSafetyComponent
    ) {
      return 'high_risk';
    }

    // GPAI con riesgo sistémico
    if (values.isGeneralPurposeAI && values.hasSystemicRisk) {
      return 'high_risk';
    }

    // Artículo 50 - Riesgo limitado
    if (
      values.interactsWithHumans ||
      values.isEmotionRecognition ||
      values.isBiometricCategorization ||
      values.generatesDeepfakes
    ) {
      return 'limited_risk';
    }

    // GPAI sin riesgo sistémico
    if (values.isGeneralPurposeAI && !values.hasSystemicRisk) {
      return 'limited_risk';
    }

    // Por defecto - Riesgo mínimo
    return 'minimal_risk';
  }

  async function onSubmit(values: z.infer<typeof classificationSchema>) {
    setCalculating(true);
    
    try {
      const riskLevel = calculateRiskLevel(values);
      
      // Actualizar el caso de uso con la clasificación
      const { error } = await supabase
        .from('use_cases')
        .update({
          ai_act_level: riskLevel,
          classification_data: values,
          status: 'classified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', useCaseId);

      if (error) throw error;

      setResult(riskLevel);
      
      toast({
        title: 'Clasificación Completada',
        description: `El sistema ha sido clasificado como: ${riskLevels[riskLevel as keyof typeof riskLevels].label}`,
      });
    } catch (error: any) {
      console.error('Error saving classification:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la clasificación',
        variant: 'destructive',
      });
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded w-96"></div>
        </div>
      </div>
    );
  }

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
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Clasificación Completada
              </h1>
              
              <Badge className={`text-lg px-4 py-1 ${riskInfo.color}`}>
                {riskInfo.label}
              </Badge>
              
              <p className="text-gray-600 mt-4 mb-6">
                {riskInfo.description}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">{useCase?.name}</h3>
                <p className="text-sm text-gray-600">{useCase?.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/inventory">
                  <Button size="lg">
                    Ver en el Inventario
                  </Button>
                </Link>
                <Link href={`/dashboard/inventory/${useCaseId}`}>
                  <Button variant="outline" size="lg">
                    Ver Detalles
                  </Button>
                </Link>
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
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clasificar Caso de Uso</h1>
            <p className="text-gray-600">Paso 2 de 2: Cuestionario AI Act</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">Paso 2 de 2</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">CumplIA te ayuda a clasificar</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Responde las siguientes preguntas basadas en el Reglamento Europeo de IA. 
                  CumplIA calculará automáticamente el nivel de riesgo de tu sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cuestionario de Clasificación AI Act
            </CardTitle>
            <CardDescription>
              Marca todas las opciones que apliquen a tu sistema de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Artículo 5 - Prohibidos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Artículo 5: Prácticas Prohibidas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Estos sistemas están prohibidos en la UE:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <FormField
                      control={form.control}
                      name="isSubliminal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Técnicas subliminales o manipuladoras</FormLabel>
                            <FormDescription>
                              Técnicas que distorsionan el comportamiento de manera que cause daño
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exploitsVulnerabilities"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Explota vulnerabilidades de grupos específicos</FormLabel>
                            <FormDescription>
                              Aprovecha debilidades de personas por su edad, discapacidad o situación social
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isSocialScoring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Puntuación social (Social Scoring)</FormLabel>
                            <FormDescription>
                              Evaluación o clasificación de personas por autoridades públicas
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isRealTimeBiometric"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Identificación biométrica remota en tiempo real</FormLabel>
                            <FormDescription>
                              En espacios públicos para fines policiales (con excepciones limitadas)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Artículo 6 - Alto riesgo */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Artículo 6: Sistemas de Alto Riesgo (Anexo III)
                  </h3>
                  <p className="text-sm text-gray-600">
                    ¿Tu sistema se utiliza en alguno de estos ámbitos críticos?
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    <FormField
                      control={form.control}
                      name="isBiometricIdentification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Identificación y categorización biométrica</FormLabel>
                            <FormDescription>
                              Sistemas de identificación remota (no en tiempo real), categorización por características protegidas
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isCriticalInfrastructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Gestión de infraestructura crítica</FormLabel>
                            <FormDescription>
                              Gestión de operaciones en agua, gas, electricidad, tráfico aéreo
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isEducationVocational"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Educación y formación profesional</FormLabel>
                            <FormDescription>
                              Determina acceso a educación, evaluación del aprendizaje, admisión
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isEmployment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Empleo, gestión de trabajadores y acceso al empleo</FormLabel>
                            <FormDescription>
                              Selección de candidatos, promociones, evaluación de desempeño
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAccessToServices"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Acceso a servicios esenciales y beneficios públicos</FormLabel>
                            <FormDescription>
                              Evaluación de elegibilidad para beneficios públicos, servicios de emergencia, créditos
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isLawEnforcement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Aplicación de la ley</FormLabel>
                            <FormDescription>
                              Evaluación de riesgo de reincidencia, análisis de evidencia, perfilado policial
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isMigrationAsylum"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Migración, asilo y control de fronteras</FormLabel>
                            <FormDescription>
                              Verificación de documentos, evaluación de solicitudes de asilo, detección de irregularidades
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isJusticeDemocratic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Administración de justicia y procesos democráticos</FormLabel>
                            <FormDescription>
                              Asistencia a jueces, investigación de hechos, influencia en procesos electorales
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* GPAI */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Modelos de Propósito General (GPAI)
                  </h3>

                  <FormField
                    control={form.control}
                    name="isGeneralPurposeAI"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Modelo de IA de propósito general (GPAI)</FormLabel>
                          <FormDescription>
                            Sistema con capacidades generales que puede usarse en múltiples contextos (ej. GPT, Claude, Llama)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('isGeneralPurposeAI') && (
                    <FormField
                      control={form.control}
                      name="hasSystemicRisk"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ml-6 border-purple-200 bg-purple-50">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-purple-900">Posee riesgo sistémico</FormLabel>
                            <FormDescription className="text-purple-700">
                              Alto impacto en mercado interior de UE: capacidades avanzadas, más de 10^25 FLOPs de entrenamiento
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Riesgo limitado */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Sistemas de Interacción (Art. 50)
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    <FormField
                      control={form.control}
                      name="interactsWithHumans"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Interactúa con humanos (chatbots)</FormLabel>
                            <FormDescription>
                              Sistemas conversacionales donde el usuario debe saber que habla con IA
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isEmotionRecognition"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Reconocimiento de emociones</FormLabel>
                            <FormDescription>
                              Detecta o interpreta emociones o intenciones en contextos de trabajo o educación
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generatesDeepfakes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Generación de deepfakes o contenido sintético</FormLabel>
                            <FormDescription>
                              Crea o manipula contenido que parece auténtico (imagen, audio, video)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/inventory')}
                  >
                    Guardar como borrador
                  </Button>
                  <Button type="submit" disabled={calculating} size="lg">
                    {calculating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Calcular Clasificación
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
