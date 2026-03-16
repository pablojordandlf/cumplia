import Link from 'next/link';
import { AlertCircle, Clock, ShieldAlert, Shield, CheckCircle2, Brain, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';

interface UseCase {
  id: string;
  ai_act_level: string;
  classification_data?: {
    isHumanInteraction?: string;
    generatesSyntheticContent?: string;
    isDeepfake?: string;
    isEmotionRecognition?: string;
    isBiometricCategorization?: string;
    generatesText?: string;
    systemType?: string;
  };
}

interface ObligationItem {
  key: string;
  title: string;
  description: string;
}

interface UseCaseObligation {
  id: string;
  use_case_id: string;
  obligation_key: string;
  obligation_title: string;
  is_completed: boolean;
  completed_at: string | null;
}

// Definición de obligaciones por nivel de riesgo
const OBLIGATIONS_BY_LEVEL: Record<string, ObligationItem[]> = {
  prohibited: [
    { key: 'prohibition_absolute', title: 'Prohibición absoluta', description: 'Este sistema no puede ser desplegado, puesto en servicio o utilizado en la UE.' },
    { key: 'notify_authorities', title: 'Notificación a autoridades', description: 'Si se detecta un uso prohibido, debe notificarse inmediatamente a la autoridad nacional competente.' },
  ],
  high_risk: [
    { key: 'eu_database_registration', title: 'Registro en base de datos UE', description: 'El sistema debe registrarse en la base de datos de sistemas de IA de alto riesgo de la UE (Art. 71).' },
    { key: 'technical_documentation', title: 'Documentación técnica completa', description: 'Mantener documentación técnica actualizada conforme al Anexo IV (Art. 11).' },
    { key: 'automatic_logs', title: 'Logs automáticos', description: 'Registro automático de eventos durante el funcionamiento del sistema (Art. 12).' },
    { key: 'human_oversight', title: 'Supervisión humana efectiva', description: 'Garantizar supervisión humana adecuada para prevenir o minimizar riesgos (Art. 14).' },
    { key: 'user_transparency', title: 'Transparencia hacia usuarios', description: 'Información clara sobre que el sistema es IA, sus capacidades y limitaciones (Art. 13).' },
    { key: 'risk_management', title: 'Sistema de gestión de riesgos', description: 'Implementar y mantener un sistema de gestión de riesgos continuo (Art. 9).' },
    { key: 'quality_assurance', title: 'Garantías de calidad', description: 'Asegurar la calidad de los datos de entrenamiento, validación y prueba (Art. 10).' },
    { key: 'conformity_assessment', title: 'Evaluación de conformidad', description: 'Realizar evaluación de conformidad antes de la puesta en el mercado (Art. 43).' },
  ],
  limited_risk: [
    { key: 'inform_ai_interaction', title: 'Informar que se interactúa con IA', description: 'Los usuarios deben saber que están interactuando con un sistema de inteligencia artificial (chatbots, sistemas conversacionales).' },
    { key: 'disclose_synthetic_content', title: 'Divulgación de contenido sintético', description: 'Marcar claramente contenido generado por IA (deepfakes, imágenes sintéticas, audio sintético) como artificialmente generado o manipulado.' },
    { key: 'inform_emotion_recognition', title: 'Informar sobre reconocimiento emocional/biométrico', description: 'Notificar a las personas cuando se utilice un sistema de reconocimiento de emociones o categorización biométrica.' },
    { key: 'label_ai_text', title: 'Etiquetado de texto generado por IA', description: 'Divulgar que el texto ha sido generado por IA (excepto cuando sea revisado por humanos, asistentes editoriales o contenido artístico/libre).' },
  ],
  minimal_risk: [
    { key: 'voluntary_code_conduct', title: 'Adhesión voluntaria a códigos de conducta', description: 'Posibilidad de adherirse a códigos de conducta voluntarios para demostrar compromiso ético.' },
    { key: 'best_practices', title: 'Buenas prácticas recomendadas', description: 'Seguir las mejores prácticas y estándares de la industria para sistemas de IA.' },
  ],
  gpai_sr: [
    { key: 'technical_doc_gpai', title: 'Documentación técnica', description: 'Mantener documentación técnica actualizada del modelo (incluyendo proceso de entrenamiento y evaluación).' },
    { key: 'copyright_compliance', title: 'Respetar derechos de autor', description: 'Respetar la ley de derechos de autor y derechos conexos, y proporcionar un resumen del contenido utilizado para entrenar.' },
    { key: 'use_policy', title: 'Política de uso', description: 'Elaborar y mantener una política de uso respetuosa de los derechos de la UE.' },
    { key: 'systemic_risk_assessment', title: 'Evaluación de riesgos sistémicos', description: 'Realizar evaluaciones de riesgos sistémicos, incluyendo pruebas adversarias y red teaming.' },
    { key: 'risk_mitigation', title: 'Mitigación de riesgos', description: 'Implementar medidas de mitigación de riesgos sistémicos identificados.' },
    { key: 'cybersecurity', title: 'Seguridad física y cibernética', description: 'Garantizar la seguridad del modelo y la infraestructura asociada.' },
    { key: 'incident_reporting', title: 'Informe de incidentes graves', description: 'Notificar a la Comisión y autoridades nacionales competentes sobre incidentes graves.' },
  ],
  gpai_model: [
    { key: 'technical_doc_gpai', title: 'Documentación técnica', description: 'Mantener documentación técnica actualizada del modelo (incluyendo proceso de entrenamiento y evaluación).' },
    { key: 'copyright_compliance', title: 'Respetar derechos de autor', description: 'Respetar la ley de derechos de autor y derechos conexos, y proporcionar un resumen del contenido utilizado para entrenar.' },
    { key: 'use_policy', title: 'Política de uso', description: 'Elaborar y mantener una política de uso respetuosa de los derechos de la UE.' },
  ],
  gpai_system: [
    { key: 'technical_doc_gpai', title: 'Documentación técnica', description: 'Mantener documentación técnica actualizada del modelo (incluyendo proceso de entrenamiento y evaluación).' },
    { key: 'copyright_compliance', title: 'Respetar derechos de autor', description: 'Respetar la ley de derechos de autor y derechos conexos, y proporcionar un resumen del contenido utilizado para entrenar.' },
    { key: 'use_policy', title: 'Política de uso', description: 'Elaborar y mantener una política de uso respetuosa de los derechos de la UE.' },
  ],
  unclassified: [
    { key: 'classify_system', title: 'Clasificar el sistema', description: 'Realizar la clasificación del sistema de IA según el AI Act para determinar las obligaciones aplicables.' },
  ],
};

const LEVEL_INFO: Record<string, { title: string; icon: any; reference: string }> = {
  prohibited: { title: 'Sistema Prohibido', icon: AlertCircle, reference: 'Artículo 5 del AI Act' },
  high_risk: { title: 'Obligaciones de Alto Riesgo', icon: ShieldAlert, reference: 'Artículos 6, 9-15, 43, 71 del AI Act' },
  limited_risk: { title: 'Obligaciones de Transparencia', icon: Shield, reference: 'Artículo 50 del AI Act' },
  minimal_risk: { title: 'Riesgo Mínimo - Códigos de Conducta', icon: CheckCircle2, reference: 'Artículo 95 del AI Act' },
  gpai_sr: { title: 'Obligaciones GPAI con Riesgo Sistémico', icon: Brain, reference: 'Artículos 52, 55 del AI Act' },
  gpai_model: { title: 'Obligaciones GPAI (Modelo)', icon: Brain, reference: 'Artículo 52 del AI Act' },
  gpai_system: { title: 'Obligaciones GPAI (Sistema)', icon: Brain, reference: 'Artículo 52 del AI Act' },
  unclassified: { title: 'Sin clasificar', icon: Clock, reference: 'AI Act' },
};

export function TransparencyObligations({ useCase }: { useCase: UseCase }) {
  const [obligationsStatus, setObligationsStatus] = useState<Record<string, UseCaseObligation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const level = useCase.ai_act_level || 'unclassified';
  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO.unclassified;
  const obligations = OBLIGATIONS_BY_LEVEL[level] || OBLIGATIONS_BY_LEVEL.unclassified;
  const IconComponent = levelInfo.icon;

  // Cargar estado de obligaciones desde Supabase
  const loadObligations = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('use_case_obligations')
        .select('*')
        .eq('use_case_id', useCase.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Convertir a mapa para fácil acceso
      const statusMap: Record<string, UseCaseObligation> = {};
      data?.forEach((item: UseCaseObligation) => {
        statusMap[item.obligation_key] = item;
      });

      setObligationsStatus(statusMap);
    } catch (error) {
      console.error('Error loading obligations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [useCase.id, supabase]);

  useEffect(() => {
    loadObligations();
  }, [loadObligations]);

  // Toggle estado de obligación
  const toggleObligation = async (obligation: ObligationItem, checked: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión',
          variant: 'destructive',
        });
        return;
      }

      const existing = obligationsStatus[obligation.key];

      if (existing) {
        // Actualizar existente
        const { error } = await supabase
          .from('use_case_obligations')
          .update({
            is_completed: checked,
            completed_at: checked ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);

        if (error) throw error;

        setObligationsStatus(prev => ({
          ...prev,
          [obligation.key]: { ...existing, is_completed: checked, completed_at: checked ? new Date().toISOString() : null }
        }));
      } else {
        // Crear nuevo
        const { data, error } = await supabase
          .from('use_case_obligations')
          .insert({
            use_case_id: useCase.id,
            user_id: session.user.id,
            obligation_key: obligation.key,
            obligation_title: obligation.title,
            is_completed: checked,
            completed_at: checked ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;

        setObligationsStatus(prev => ({ ...prev, [obligation.key]: data }));
      }

      toast({
        title: checked ? 'Obligación completada' : 'Obligación pendiente',
        description: checked ? 'La obligación ha sido marcada como cumplida' : 'La obligación ha sido marcada como pendiente',
      });
    } catch (error) {
      console.error('Error updating obligation:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const completedCount = obligations.filter(o => obligationsStatus[o.key]?.is_completed).length;
  const totalCount = obligations.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-blue-600" />
            {levelInfo.title}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-blue-600">{completedCount}</span>
              <span className="text-gray-400">/{totalCount}</span>
              <span className="ml-1">completadas</span>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Obligaciones aplicables
          </h4>

          <div className="space-y-3">
            {obligations.map((obligation) => {
              const isCompleted = obligationsStatus[obligation.key]?.is_completed || false;
              return (
                <div
                  key={obligation.key}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`obligation-${obligation.key}`}
                      checked={isCompleted}
                      onCheckedChange={(checked) => toggleObligation(obligation, checked as boolean)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`obligation-${obligation.key}`}
                        className={`font-medium text-sm cursor-pointer ${
                          isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}
                      >
                        {obligation.title}
                      </label>
                      <p className={`text-sm mt-1 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                        {obligation.description}
                      </p>
                      {isCompleted && obligationsStatus[obligation.key]?.completed_at && (
                        <p className="text-xs text-green-500 mt-2">
                          Completado el {new Date(obligationsStatus[obligation.key].completed_at!).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-gray-500">
            Referencia: {levelInfo.reference}
          </span>
          <Link href={`/dashboard/inventory/${useCase.id}/classify`}>
            <Button variant="link" size="sm" className="text-blue-600 p-0">
              {level === 'unclassified' ? 'Clasificar ahora →' : 'Revisar clasificación →'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Función auxiliar para obtener el conteo de obligaciones (usada en el listado)
export async function getObligationsCount(useCaseId: string, supabase: any): Promise<{ completed: number; total: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { completed: 0, total: 0 };

    // Obtener el use case para saber su nivel
    const { data: useCase } = await supabase
      .from('use_cases')
      .select('ai_act_level')
      .eq('id', useCaseId)
      .single();

    if (!useCase) return { completed: 0, total: 0 };

    const level = useCase.ai_act_level || 'unclassified';
    const obligations = OBLIGATIONS_BY_LEVEL[level] || OBLIGATIONS_BY_LEVEL.unclassified;
    const total = obligations.length;

    // Obtener completadas
    const { data: completedObligations } = await supabase
      .from('use_case_obligations')
      .select('obligation_key')
      .eq('use_case_id', useCaseId)
      .eq('user_id', session.user.id)
      .eq('is_completed', true);

    const completed = completedObligations?.length || 0;

    return { completed, total };
  } catch (error) {
    console.error('Error getting obligations count:', error);
    return { completed: 0, total: 0 };
  }
}