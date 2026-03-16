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
  FormField,
  FormItem,
  FormLabel,
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
  Brain,
  Users,
  Building2,
  HelpCircle,
  Cpu,
  Sparkles,
  Bot,
  Network
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Schema para el cuestionario de clasificación
const classificationSchema = z.object({
  // Tipo de sistema IA
  systemType: z.enum(['standard', 'gpai', 'embedded', 'biometric', 'safety']),
  
  // Artículo 5 - Sistemas prohibidos
  isSubliminal: z.enum(['yes', 'no']),
  isSocialScoring: z.enum(['yes', 'no']),
  isRealTimeBiometric: z.enum(['yes', 'no']),
  exploitsVulnerabilities: z.enum(['yes', 'no']),
  
  // Artículo 6 - Sistemas de alto riesgo (Anexo III)
  isBiometricIdentification: z.enum(['yes', 'no']),
  isCriticalInfrastructure: z.enum(['yes', 'no']),
  isEducationVocational: z.enum(['yes', 'no']),
  isEmployment: z.enum(['yes', 'no']),
  isAccessToServices: z.enum(['yes', 'no']),
  isLawEnforcement: z.enum(['yes', 'no']),
  isMigrationAsylum: z.enum(['yes', 'no']),
  isJusticeDemocratic: z.enum(['yes', 'no']),
  
  // Anexo II - Productos de seguridad
  isSafetyComponent: z.enum(['yes', 'no']),
  
  // GPAI
  isGeneralPurposeAI: z.enum(['yes', 'no']),
  hasSystemicRisk: z.enum(['yes', 'no']),
  
  // Interacción
  interactsWithHumans: z.enum(['yes', 'no']),
  isEmotionRecognition: z.enum(['yes', 'no']),
  isBiometricCategorization: z.enum(['yes', 'no']),
  generatesDeepfakes: z.enum(['yes', 'no']),
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

const systemTypes = [
  { 
    value: 'standard', 
    label: 'Sistema de IA Estándar', 
    description: 'Sistema de IA tradicional con propósito específico',
    icon: Cpu
  },
  { 
    value: 'gpai', 
    label: 'Modelo de Propósito General (GPAI)', 
    description: 'IA con capacidades generales aplicables a múltiples contextos (ej: GPT, Claude)',
    icon: Sparkles
  },
  { 
    value: 'embedded', 
    label: 'Sistema de IA Embebido', 
    description: 'IA integrada en productos de seguridad o dispositivos físicos',
    icon: Bot
  },
  { 
    value: 'biometric', 
    label: 'Sistema Biométrico', 
    description: 'IA para identificación, categorización o análisis de personas',
    icon: Users
  },
  { 
    value: 'safety', 
    label: 'Componente de Seguridad', 
    description: 'Sistema de seguridad regulado por legislación sectorial UE (Anexo II)',
    icon: Shield
  },
];

// Tooltip component
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-2">
      <HelpCircle 
        className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 max-w-xs">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Selector Sí/No visual
function YesNoSelector({ 
  value, 
  onChange, 
  label, 
  tooltip 
}: { 
  value: string; 
  onChange: (val: 'yes' | 'no') => void;
  label: string;
  tooltip?: string;
}) {
  return (
    <div className="rounded-lg border p-4 hover:border-gray-300 transition-colors cursor-pointer" onClick={() => onChange(value === 'yes' ? 'no' : 'yes')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onChange('yes')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value === 'yes'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => onChange('no')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value === 'no'
                ? 'bg-gray-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

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
      systemType: 'standard',
      isSubliminal: 'no',
      isSocialScoring: 'no',
      isRealTimeBiometric: 'no',
      exploitsVulnerabilities: 'no',
      isBiometricIdentification: 'no',
      isCriticalInfrastructure: 'no',
      isEducationVocational: 'no',
      isEmployment: 'no',
      isAccessToServices: 'no',
      isLawEnforcement: 'no',
      isMigrationAsylum: 'no',
      isJusticeDemocratic: 'no',
      isSafetyComponent: 'no',
      isGeneralPurposeAI: 'no',
      hasSystemicRisk: 'no',
      interactsWithHumans: 'no',
      isEmotionRecognition: 'no',
      isBiometricCategorization: 'no',
      generatesDeepfakes: 'no',
    },
  });

  const isGPAI = form.watch('isGeneralPurposeAI') === 'yes';

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
      
      // Si hay classification_data previo, cargarlo
      if (data?.classification_data) {
        const prevData = data.classification_data;
        // Convertir booleanos a 'yes'/'no'
        const convertedData: any = { systemType: prevData.systemType || 'standard' };
        Object.keys(prevData).forEach(key => {
          if (typeof prevData[key] === 'boolean') {
            convertedData[key] = prevData[key] ? 'yes' : 'no';
          } else if (prevData[key] === 'yes' || prevData[key] === 'no') {
            convertedData[key] = prevData[key];
          }
        });
        form.reset(convertedData);
      }
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
    if (values.isSubliminal === 'yes' || values.isSocialScoring === 'yes' || 
        values.isRealTimeBiometric === 'yes' || values.exploitsVulnerabilities === 'yes') {
      return 'prohibited';
    }

    // Artículo 6 y Anexo III - Alto riesgo
    if (
      values.isBiometricIdentification === 'yes' ||
      values.isCriticalInfrastructure === 'yes' ||
      values.isEducationVocational === 'yes' ||
      values.isEmployment === 'yes' ||
      values.isAccessToServices === 'yes' ||
      values.isLawEnforcement === 'yes' ||
      values.isMigrationAsylum === 'yes' ||
      values.isJusticeDemocratic === 'yes' ||
      values.isSafetyComponent === 'yes'
    ) {
      return 'high_risk';
    }

    // GPAI con riesgo sistémico
    if (values.isGeneralPurposeAI === 'yes' && values.hasSystemicRisk === 'yes') {
      return 'high_risk';
    }

    // Artículo 50 - Riesgo limitado
    if (
      values.interactsWithHumans === 'yes' ||
      values.isEmotionRecognition === 'yes' ||
      values.isBiometricCategorization === 'yes' ||
      values.generatesDeepfakes === 'yes'
    ) {
      return 'limited_risk';
    }

    // GPAI sin riesgo sistémico
    if (values.isGeneralPurposeAI === 'yes' && values.hasSystemicRisk === 'no') {
      return 'limited_risk';
    }

    // Por defecto - Riesgo mínimo
    return 'minimal_risk';
  }

  async function onSubmit(values: z.infer<typeof classificationSchema>) {
    setCalculating(true);
    
    try {
      const riskLevel = calculateRiskLevel(values);
      
      // Obtener sesión actual para el user_id
      const { data: { session } } = await supabase.auth.getSession();
      
      // Actualizar el caso de uso con la clasificación
      const { error } = await supabase
        .from('use_cases')
        .update({
          ai_act_level: riskLevel,
          classification_data: values,
          status: 'classified',
          updated_at: new Date().toISOString(),
          updated_by: session?.user?.id,
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

        {/* Classification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cuestionario de Clasificación AI Act
            </CardTitle>
            <CardDescription>
              Responde Sí o No a cada pregunta. Pasa el cursor sobre <HelpCircle className="w-3 h-3 inline" /> para más información.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Tipo de Sistema IA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Tipo de Sistema de IA
                    </h3>
                    <InfoTooltip text="El AI Act clasifica los sistemas de IA en diferentes categorías según su naturaleza y alcance." />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="systemType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-3">
                            {systemTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => field.onChange(type.value)}
                                  className={`flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                                    field.value === type.value
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${
                                    field.value === type.value ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                    <Icon className={`w-5 h-5 ${
                                      field.value === type.value ? 'text-blue-600' : 'text-gray-500'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{type.label}</div>
                                    <div className="text-sm text-gray-500">{type.description}</div>
                                  </div>
                                  {field.value === type.value && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Artículo 5 - Prohibidos */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-red-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Artículo 5: Prácticas Prohibidas
                    </h3>
                    <InfoTooltip text="El Artículo 5 del AI Act prohíbe ciertas prácticas consideradas inaceptables para la UE. Si respondes Sí a alguna, el sistema será clasificado como PROHIBIDO." />
                  </div>
                  
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="isSubliminal"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <YesNoSelector
                              value={field.value}
                              onChange={field.onChange}
                              label="¿Usa técnicas subliminales o manipuladoras que distorsionen el comportamiento causando daño?"
                              tooltip="Técnicas que distorsionan el comportamiento de personas de manera que puedan causar daño psicológico o físico."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exploitsVulnerabilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <YesNoSelector
                              value={field.value}
                              onChange={field.onChange}
                              label="¿Explota vulnerabilidades de grupos específicos (edad, discapacidad, situación social)?"
                              tooltip="Aprovecha debilidades de personas debido a su edad, discapacidad, situación social o económica específica."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isSocialScoring"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <YesNoSelector
                              value={field.value}
                              onChange={field.onChange}
                              label="¿Realiza puntuación social (social scoring) por autoridades públicas?"
                              tooltip="Evaluación o clasificación de personas basada en comportamiento social o personalidad que conduce a tratamiento desfavorable."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isRealTimeBiometric"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <YesNoSelector
                              value={field.value}
                              onChange={field.onChange}
                              label="¿Realiza identificación biométrica remota en tiempo real en espacios públicos para fines policiales?"
                              tooltip="Identificación mediante biometría en tiempo real en espacios públicos por autoridades policiales (prohibido salvo excepciones muy limitadas)."
                            />
                          </FormControl>
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
