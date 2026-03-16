'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, ShieldAlert, Shield, CheckCircle2, Brain, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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

export function TransparencyObligations({ useCase }: { useCase: UseCase }) {
  const { ai_act_level, classification_data } = useCase;

  const getObligations = () => {
    switch (ai_act_level) {
      case 'prohibited':
        return {
          title: 'Sistema Prohibido',
          icon: AlertCircle,
          color: 'red',
          obligations: [
            {
              title: 'Prohibición absoluta',
              description: 'Este sistema no puede ser desplegado, puesto en servicio o utilizado en la UE.',
              critical: true,
            },
            {
              title: 'Notificación a autoridades',
              description: 'Si se detecta un uso prohibido, debe notificarse inmediatamente a la autoridad nacional competente.',
              critical: true,
            },
          ],
          reference: 'Artículo 5 del AI Act',
        };

      case 'high_risk':
        return {
          title: 'Obligaciones de Alto Riesgo',
          icon: ShieldAlert,
          color: 'orange',
          obligations: [
            {
              title: 'Registro en base de datos UE',
              description: 'El sistema debe registrarse en la base de datos de sistemas de IA de alto riesgo de la UE (Art. 71).',
              critical: true,
            },
            {
              title: 'Documentación técnica completa',
              description: 'Mantener documentación técnica actualizada conforme al Anexo IV (Art. 11).',
              critical: true,
            },
            {
              title: 'Logs automáticos',
              description: 'Registro automático de eventos durante el funcionamiento del sistema (Art. 12).',
              critical: true,
            },
            {
              title: 'Supervisión humana efectiva',
              description: 'Garantizar supervisión humana adecuada para prevenir o minimizar riesgos (Art. 14).',
              critical: true,
            },
            {
              title: 'Transparencia hacia usuarios',
              description: 'Información clara sobre que el sistema es IA, sus capacidades y limitaciones (Art. 13).',
              critical: false,
            },
            {
              title: 'Sistema de gestión de riesgos',
              description: 'Implementar y mantener un sistema de gestión de riesgos continuo (Art. 9).',
              critical: false,
            },
            {
              title: 'Garantías de calidad',
              description: 'Asegurar la calidad de los datos de entrenamiento, validación y prueba (Art. 10).',
              critical: false,
            },
          ],
          reference: 'Artículos 6, 9-15, 71 del AI Act',
        };

      case 'limited_risk': {
        const limitedRiskObligations = [
          {
            title: 'Informar que se interactúa con IA',
            description: 'Los usuarios deben saber que están interactuando con un sistema de inteligencia artificial (chatbots, sistemas conversacionales).',
            appliesTo: classification_data?.isHumanInteraction === 'yes',
            critical: true,
          },
          {
            title: 'Divulgación de contenido sintético',
            description: 'Marcar claramente contenido generado por IA (deepfakes, imágenes sintéticas, audio sintético) como artificialmente generado o manipulado.',
            appliesTo: classification_data?.generatesSyntheticContent === 'yes' || classification_data?.isDeepfake === 'yes',
            critical: true,
          },
          {
            title: 'Informar sobre reconocimiento emocional/biométrico',
            description: 'Notificar a las personas cuando se utilice un sistema de reconocimiento de emociones o categorización biométrica.',
            appliesTo: classification_data?.isEmotionRecognition === 'yes' || classification_data?.isBiometricCategorization === 'yes',
            critical: true,
          },
          {
            title: 'Etiquetado de texto generado por IA',
            description: 'Divulgar que el texto ha sido generado por IA (excepto cuando sea revisado por humanos, asistentes editoriales o contenido artístico/libre).',
            appliesTo: classification_data?.generatesText === 'yes' && classification_data?.systemType !== 'gpai_system',
            critical: false,
          },
        ];

        return {
          title: 'Obligaciones de Transparencia',
          icon: Shield,
          color: 'yellow',
          obligations: limitedRiskObligations,
          reference: 'Artículo 50 del AI Act',
        };
      }

      case 'minimal_risk':
        return {
          title: 'Riesgo Mínimo - Códigos de Conducta',
          icon: CheckCircle2,
          color: 'green',
          obligations: [
            {
              title: 'Adhesión voluntaria a códigos de conducta',
              description: 'Posibilidad de adherirse a códigos de conducta voluntarios para demostrar compromiso ético.',
              critical: false,
            },
            {
              title: 'Buenas prácticas recomendadas',
              description: 'Seguir las mejores prácticas y estándares de la industria para sistemas de IA.',
              critical: false,
            },
          ],
          reference: 'Artículo 95 del AI Act',
        };

      case 'gpai_sr':
        return {
          title: 'Obligaciones GPAI con Riesgo Sistémico',
          icon: Brain,
          color: 'purple',
          obligations: [
            {
              title: 'Documentación técnica',
              description: 'Mantener documentación técnica actualizada del modelo (incluyendo proceso de entrenamiento y evaluación).',
              critical: true,
            },
            {
              title: 'Respetar derechos de autor',
              description: 'Respetar la ley de derechos de autor y derechos conexos, y proporcionar un resumen del contenido utilizado para entrenar.',
              critical: true,
            },
            {
              title: 'Política de uso',
              description: 'Elaborar y mantener una política de uso respetuosa de los derechos de la UE.',
              critical: true,
            },
            {
              title: 'Evaluación de riesgos sistémicos',
              description: 'Realizar evaluaciones de riesgos sistémicos, incluyendo pruebas adversarias y red teaming.',
              critical: true,
            },
            {
              title: 'Mitigación de riesgos',
              description: 'Implementar medidas de mitigación de riesgos sistémicos identificados.',
              critical: true,
            },
            {
              title: 'Seguridad física y cibernética',
              description: 'Garantizar la seguridad del modelo y la infraestructura asociada.',
              critical: true,
            },
            {
              title: 'Informe de incidentes graves',
              description: 'Notificar a la Comisión y autoridades nacionales competentes sobre incidentes graves.',
              critical: true,
            },
          ],
          reference: 'Artículos 52, 55 del AI Act',
        };

      case 'gpai_model':
      case 'gpai_system': {
        const gpaiObligations = [
          {
            title: 'Documentación técnica',
            description: 'Mantener documentación técnica actualizada del modelo (incluyendo proceso de entrenamiento y evaluación).',
            critical: true,
          },
          {
            title: 'Respetar derechos de autor',
            description: 'Respetar la ley de derechos de autor y derechos conexos, y proporcionar un resumen del contenido utilizado para entrenar.',
            critical: true,
          },
          {
            title: 'Política de uso',
            description: 'Elaborar y mantener una política de uso respetuosa de los derechos de la UE.',
            critical: true,
          },
        ];

        return {
          title: 'Obligaciones GPAI',
          icon: Brain,
          color: 'blue',
          obligations: gpaiObligations,
          reference: 'Artículo 52 del AI Act',
        };
      }

      default:
        return {
          title: 'Sin clasificar',
          icon: Clock,
          color: 'gray',
          obligations: [
            {
              title: 'Pendiente de clasificación',
              description: 'Este caso de uso aún no ha sido clasificado. Realiza la clasificación para determinar las obligaciones aplicables.',
              critical: true,
            },
          ],
          reference: 'AI Act',
        };
    }
  };

  const obligations = getObligations();
  const bgColors: Record<string, string> = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    gray: 'bg-gray-50 border-gray-200',
  };
  const textColors: Record<string, string> = {
    red: 'text-red-900',
    orange: 'text-orange-900',
    yellow: 'text-yellow-900',
    green: 'text-green-900',
    blue: 'text-blue-900',
    purple: 'text-purple-900',
    gray: 'text-gray-900',
  };
  const badgeColors: Record<string, string> = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const IconComponent = obligations.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="w-5 h-5" />
          {obligations.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 ${bgColors[obligations.color]} rounded-lg border`}>
          <h4 className={`font-semibold ${textColors[obligations.color]} mb-3 flex items-center gap-2`}>
            <IconComponent className="w-4 h-4" />
            Obligaciones aplicables
          </h4>

          <div className="space-y-3">
            {obligations.obligations.map((obligation: any, index: number) => (
              <div
                key={index}
                className={`p-3 bg-white rounded-lg border ${
                  obligation.critical ? 'border-l-4 ' + (obligations.color === 'red' ? 'border-l-red-500' : obligations.color === 'orange' ? 'border-l-orange-500' : 'border-l-blue-500') : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {obligation.critical ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{obligation.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{obligation.description}</p>

                    {obligation.appliesTo === false && (
                      <Badge variant="secondary" className="mt-2 text-xs bg-gray-100 text-gray-500">
                        No aplica según clasificación actual
                      </Badge>
                    )}
                    {obligation.appliesTo === true && (
                      <Badge variant="secondary" className={`mt-2 text-xs ${badgeColors[obligations.color]}`}>
                        Aplica a este sistema
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-gray-500">
            Referencia: {obligations.reference}
          </span>
          <Link href={`/dashboard/inventory/${useCase.id}/classify`}>
            <Button variant="link" size="sm" className="text-blue-600 p-0">
              {useCase.ai_act_level === 'unclassified' ? 'Clasificar ahora →' : 'Revisar clasificación →'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}