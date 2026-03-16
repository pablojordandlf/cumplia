'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Ban,
  Info,
  Brain,
  Bot,
  Sparkles,
  ArrowLeft,
  BookOpen,
  FileText,
  Scale
} from 'lucide-react';
import Link from 'next/link';

const RISK_LEVELS = [
  {
    key: 'prohibited',
    name: 'Prohibido',
    description: 'Sistemas que manipulan conscientemente, explotan vulnerabilidades o realizan evaluación social. Está prohibido su uso en la Unión Europea.',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: Ban,
    obligations: 2,
    examples: ['Sistemas de puntuación social', 'Manipulación subliminal', 'Evaluación de riesgo de reincidencia sin intervención humana'],
    articles: ['Art. 5'],
  },
  {
    key: 'high_risk',
    name: 'Alto Riesgo',
    description: 'Sistemas que afectan seguridad, derechos fundamentales o áreas críticas como salud, educación, seguridad, justicia y acceso a servicios.',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertTriangle,
    obligations: 8,
    examples: ['Sistemas de salud (diagnóstico)', 'Admisión educativa', 'Evaluación de solicitantes de empleo', 'Sistemas de justicia', 'Control fronterizo'],
    articles: ['Anexo III', 'Art. 6'],
  },
  {
    key: 'limited_risk',
    name: 'Riesgo Limitado',
    description: 'Sistemas con obligaciones específicas de transparencia según el Artículo 50 del AI Act.',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Info,
    obligations: 4,
    examples: ['Chatbots y asistentes conversacionales', 'Generación de contenido sintético (deepfakes)', 'Reconocimiento emocional', 'Sistemas biométricos'],
    articles: ['Art. 50'],
  },
  {
    key: 'minimal_risk',
    name: 'Riesgo Mínimo',
    description: 'Sistemas con cumplimiento voluntario mediante códigos de conducta. No tienen obligaciones específicas.',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
    obligations: 2,
    examples: ['Sistemas recomendadores', 'Filtros de spam', 'Videojuegos con IA', 'Herramientas creativas asistidas'],
    articles: ['Art. 52', 'Códigos de conducta'],
  },
  {
    key: 'gpai_model',
    name: 'GPAI Model',
    description: 'Modelo de IA de Propósito General (GPAI) que puede usarse para múltiples propósitos distintos.',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Brain,
    obligations: 3,
    examples: ['GPT-4 (base)', 'Llama', 'Gemini base', 'Claude (modelo base)'],
    articles: ['Anexo XI', 'Art. 52-55'],
  },
  {
    key: 'gpai_system',
    name: 'GPAI System',
    description: 'Sistema de IA de Propósito General basado en un modelo GPAI, integrado en productos o servicios.',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: Bot,
    obligations: 3,
    examples: ['ChatGPT', 'Microsoft Copilot', 'Google Bard', 'Sistemas integrados con GPAI'],
    articles: ['Anexo XI', 'Art. 52-55'],
  },
  {
    key: 'gpai_sr',
    name: 'GPAI-SR',
    description: 'Modelo GPAI con Riesgo Sistémico. Requieren evaluaciones de riesgo y medidas adicionales.',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Sparkles,
    obligations: 7,
    examples: ['Modelos >10²⁵ FLOP', 'GPT-4 (modelo con riesgo sistémico)', 'Modelos con capacidades generales elevadas'],
    articles: ['Anexo XI', 'Art. 52-55'],
  },
  {
    key: 'unclassified',
    name: 'Por Clasificar',
    description: 'Sistemas pendientes de clasificación según el AI Act. Deben evaluarse para determinar su nivel de riesgo.',
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Clock,
    obligations: 1,
    examples: ['Sistemas nuevos', 'Sistemas en revisión', 'Casos de uso ambiguos'],
    articles: ['Art. 6', 'Anexos II-III'],
  },
];

const OBLIGATIONS_DETAIL = [
  {
    level: 'Alto Riesgo',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    obligations: [
      { name: 'Registro UE', desc: 'Inscripción en la base de datos de sistemas de alto riesgo de la UE', article: 'Art. 71' },
      { name: 'Documentación técnica', desc: 'Preparar documentación según Anexo IV del AI Act', article: 'Art. 11' },
      { name: 'Logs automáticos', desc: 'Registro automático de eventos durante el ciclo de vida (Art. 12)', article: 'Art. 12' },
      { name: 'Supervisión humana', desc: 'Garantizar supervisión humana efectiva durante el uso (Art. 14)', article: 'Art. 14' },
      { name: 'Transparencia', desc: 'Proporcionar información a los usuarios sobre el uso de IA (Art. 13)', article: 'Art. 13' },
      { name: 'Gestión de riesgos', desc: 'Sistema de gestión de riesgos continuo durante el ciclo de vida (Art. 9)', article: 'Art. 9' },
      { name: 'Garantías de calidad', desc: 'Prácticas de gobernanza de datos para datos de entrenamiento (Art. 10)', article: 'Art. 10' },
      { name: 'Evaluación de conformidad', desc: 'Evaluación antes de la puesta en el mercado (Art. 43)', article: 'Art. 43' },
    ],
  },
  {
    level: 'Riesgo Limitado',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    obligations: [
      { name: 'Informar interacción IA', desc: 'Notificar a los usuarios que interactúan con un sistema de IA (chatbots)', article: 'Art. 50.1' },
      { name: 'Divulgación contenido sintético', desc: 'Marcar contenido generado o manipulado por IA (deepfakes)', article: 'Art. 50.2' },
      { name: 'Notificar reconocimiento', desc: 'Informar cuando se utiliza reconocimiento emocional o biométrico', article: 'Art. 50.3' },
      { name: 'Etiquetado texto IA', desc: 'Indicar cuando el texto ha sido generado por IA', article: 'Art. 50.4' },
    ],
  },
  {
    level: 'Prohibido',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    obligations: [
      { name: 'Prohibición absoluta', desc: 'No implementar, poner en el mercado ni usar sistemas prohibidos en la UE', article: 'Art. 5.1' },
      { name: 'Notificación autoridades', desc: 'Notificar a las autoridades si se detecta uso prohibido', article: 'Art. 5.2' },
    ],
  },
  {
    level: 'Riesgo Mínimo',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    obligations: [
      { name: 'Códigos de conducta voluntarios', desc: 'Adherirse voluntariamente a códigos de conducta de la UE', article: 'Art. 52' },
      { name: 'Buenas prácticas', desc: 'Seguir recomendaciones de transparencia y documentación (voluntario)', article: 'Art. 52' },
    ],
  },
  {
    level: 'GPAI Model / GPAI System',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    obligations: [
      { name: 'Documentación técnica', desc: 'Preparar y mantener documentación técnica actualizada', article: 'Art. 53' },
      { name: 'Política de uso', desc: 'Respetar la política de uso proporcionada por el proveedor', article: 'Art. 53' },
      { name: 'Transparencia', desc: 'Cumplir con obligaciones de transparencia específicas', article: 'Art. 53' },
    ],
  },
  {
    level: 'GPAI-SR (Riesgo Sistémico)',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    obligations: [
      { name: 'Evaluación de riesgos', desc: 'Realizar evaluaciones de riesgos sistémicos y medidas de mitigación', article: 'Art. 55' },
      { name: 'Seguridad cibernética', desc: 'Garantizar protección contra intentos de acceso no autorizado', article: 'Art. 55' },
      { name: 'Reporte incidentes', desc: 'Notificar incidentes graves a la Comisión Europea', article: 'Art. 55' },
      { name: 'Pruebas adversarias', desc: 'Realizar pruebas de red team para evaluar capacidades peligrosas', article: 'Art. 55' },
      { name: 'Información usuarios downstream', desc: 'Proporcionar información necesaria a desarrolladores que integren el modelo', article: 'Art. 55' },
      { name: 'Documentación específica', desc: 'Documentación adicional para modelos con riesgo sistémico', article: 'Art. 55' },
      { name: 'Cumplimiento adicional', desc: 'Medidas específicas según evaluación de riesgos', article: 'Art. 55' },
    ],
  },
];

export default function GuiaPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Guía del AI Act
          </h1>
          <p className="text-gray-500 mt-1">
            Clasificación de sistemas y obligaciones según el Reglamento UE de Inteligencia Artificial
          </p>
        </div>
      </div>

      {/* Introducción */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500 rounded-lg text-white">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">¿Qué es el AI Act?</h2>
              <p className="text-gray-600 mt-2">
                El Reglamento de la UE sobre Inteligencia Artificial (AI Act) es el primer marco regulatorio 
                integral del mundo para la IA. Establece requisitos y obligaciones específicas según el nivel 
                de riesgo del sistema de IA, desde sistemas prohibidos hasta sistemas de riesgo mínimo.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="bg-white">Entrada en vigor: 1 Agosto 2024</Badge>
                <Badge variant="outline" className="bg-white">Aplicable a: Toda la UE</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Niveles de Riesgo */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Niveles de Riesgo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RISK_LEVELS.map((level) => {
            const Icon = level.icon;
            return (
              <Card 
                key={level.key}
                className={`${level.bgColor} ${level.borderColor} hover:shadow-lg transition-shadow`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${level.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${level.textColor}`}>{level.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {level.articles.join(', ')}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {level.obligations} obligaciones
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">{level.description}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Ejemplos típicos:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {level.examples.map((example, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Obligaciones Detalladas */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Obligaciones por Nivel de Riesgo
        </h2>
        <div className="space-y-4">
          {OBLIGATIONS_DETAIL.map((section) => (
            <Card key={section.level} className={`${section.bgColor} ${section.borderColor}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${section.color}`}>{section.level}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.obligations.map((obl, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-white/50"
                    >
                      <CheckCircle2 className={`w-5 h-5 ${section.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900">{obl.name}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {obl.article}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{obl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer con enlace de vuelta */}
      <div className="flex justify-center pt-4">
        <Link href="/dashboard">
          <Button variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
