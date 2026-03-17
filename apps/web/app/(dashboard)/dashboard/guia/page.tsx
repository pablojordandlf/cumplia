'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Ban,
  Info,
  ArrowLeft,
  BookOpen,
  FileText,
  Scale,
  GraduationCap,
  Target,
  AlertOctagon,
  ClipboardCheck,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// NIVELES DE RIESGO AI ACT (Simplificado)
// ============================================

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
    deployable: false,
  },
  {
    key: 'high_risk',
    name: 'Alto Riesgo',
    description: 'Sistemas que afectan seguridad, derechos fundamentales o áreas críticas como salud, educación, seguridad, justicia y acceso a servicios.',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertOctagon,
    obligations: 8,
    examples: ['Sistemas de salud (diagnóstico)', 'Admisión educativa', 'Evaluación de solicitantes de empleo', 'Sistemas de justicia', 'Control fronterizo'],
    articles: ['Anexo III', 'Art. 6', 'Art. 9'],
    deployable: true,
  },
  {
    key: 'limited_risk',
    name: 'Riesgo Limitado',
    description: 'Sistemas con obligaciones específicas de transparencia según el Artículo 50 del AI Act.',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
    obligations: 4,
    examples: ['Chatbots y asistentes conversacionales', 'Generación de contenido sintético (deepfakes)', 'Reconocimiento emocional', 'Sistemas biométricos'],
    articles: ['Art. 50'],
    deployable: true,
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
    deployable: true,
  },
];

// ============================================
// OBLIGACIONES DETALLADAS
// ============================================

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
];

// ============================================
// GUÍA DE GESTIÓN DE RIESGOS IA
// ============================================

const RISK_MANAGEMENT_GUIDE = {
  title: 'Guía de Gestión de Riesgos IA',
  subtitle: 'Artículo 9 del AI Act - Sistemas de Alto Riesgo',
  description: 'El Artículo 9 establece que los sistemas de IA de alto riesgo deben implementar un sistema de gestión de riesgos continuo y cíclico durante todo su ciclo de vida.',
  phases: [
    {
      title: '1. Identificación de Riesgos',
      icon: Target,
      color: 'blue',
      content: 'Identificar los riesgos conocidos y previsibles que el sistema de IA puede generar para la salud, seguridad y derechos fundamentales.',
      tasks: [
        'Revisar el catálogo de riesgos MIT AI Risk Repository',
        'Evaluar riesgos específicos del contexto de uso',
        'Consultar con stakeholders y expertos',
        'Documentar todos los riesgos identificados'
      ]
    },
    {
      title: '2. Evaluación de Riesgos',
      icon: ClipboardCheck,
      color: 'orange',
      content: 'Estimar y evaluar los riesgos que pueden surgir durante el uso del sistema de IA según su uso previsto y uso razonable.',
      tasks: [
        'Evaluar probabilidad de ocurrencia (1-4)',
        'Evaluar impacto potencial (1-4)',
        'Calcular riesgo residual (probabilidad × impacto)',
        'Priorizar riesgos por criticidad'
      ]
    },
    {
      title: '3. Mitigación de Riesgos',
      icon: Shield,
      color: 'green',
      content: 'Implementar medidas de mitigación y control para reducir los riesgos evaluados hasta niveles aceptables.',
      tasks: [
        'Definir medidas de mitigación específicas',
        'Asignar responsables y fechas límite',
        'Implementar controles técnicos y organizativos',
        'Documentar decisiones de mitigación'
      ]
    },
    {
      title: '4. Monitorización Continua',
      icon: Info,
      color: 'purple',
      content: 'Supervisar el funcionamiento real del sistema post-despliegue para detectar nuevos riesgos o cambios en riesgos conocidos.',
      tasks: [
        'Establecer KPIs de riesgo',
        'Revisar periódicamente el registro de riesgos',
        'Actualizar evaluaciones según nuevos datos',
        'Documentar incidentes y near-misses'
      ]
    }
  ],
  tips: [
    'La gestión de riesgos debe ser un proceso continuo, no puntual',
    'Involucra a todos los stakeholders relevantes en el proceso',
    'Documenta todas las decisiones y justificaciones',
    'Revisa y actualiza el análisis de riesgos regularmente',
    'Considera tanto riesgos pre-despliegue como post-despliegue'
  ]
};

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
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Portal de Formación AI Act
          </h1>
          <p className="text-gray-500 mt-1">
            Aprende sobre cumplimiento, niveles de riesgo y gestión de sistemas de IA
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

      {/* Tabs para organizar el contenido */}
      <Tabs defaultValue="niveles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="niveles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Niveles de Riesgo
          </TabsTrigger>
          <TabsTrigger value="obligaciones" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Obligaciones
          </TabsTrigger>
          <TabsTrigger value="riesgos" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Gestión de Riesgos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Niveles de Riesgo */}
        <TabsContent value="niveles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Clasificación de Sistemas IA
            </h2>
            <Badge variant="outline">4 niveles de riesgo</Badge>
          </div>
          
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
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${level.textColor}`}>{level.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {level.articles.join(', ')}
                        </CardDescription>
                      </div>
                      {!level.deployable && (
                        <Badge variant="destructive" className="shrink-0">No desplegable</Badge>
                      )}
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
        </TabsContent>

        {/* Tab: Obligaciones */}
        <TabsContent value="obligaciones" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Obligaciones por Nivel de Riesgo
            </h2>
          </div>

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
        </TabsContent>

        {/* Tab: Gestión de Riesgos */}
        <TabsContent value="riesgos" className="space-y-6">
          {/* Header de la guía */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500 rounded-lg text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{RISK_MANAGEMENT_GUIDE.title}</h2>
                  <p className="text-indigo-600 font-medium mt-1">{RISK_MANAGEMENT_GUIDE.subtitle}</p>
                  <p className="text-gray-600 mt-2">{RISK_MANAGEMENT_GUIDE.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fases del proceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RISK_MANAGEMENT_GUIDE.phases.map((phase, idx) => {
              const Icon = phase.icon;
              const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
                blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
                orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' },
                green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-800' },
                purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
              };
              const colors = colorClasses[phase.color];
              
              return (
                <Card key={idx} className={`${colors.bg} ${colors.border}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className={`text-base ${colors.text}`}>{phase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{phase.content}</p>
                    <ul className="space-y-2">
                      {phase.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="flex items-start gap-2 text-sm text-gray-600">
                          <ChevronRight className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Consejos prácticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Consejos Prácticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RISK_MANAGEMENT_GUIDE.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* MIT AI Risk Repository */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Catálogo de Riesgos MIT</CardTitle>
              <CardDescription>
                CumplIA integra el MIT AI Risk Repository con 50 riesgos priorizados organizados en 7 dominios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 bg-white rounded-lg border">
                  <span className="font-medium text-red-600">Discriminación</span>
                  <p className="text-gray-500 text-xs mt-1">Riesgos de sesgo y toxicidad</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="font-medium text-orange-600">Privacidad</span>
                  <p className="text-gray-500 text-xs mt-1">Protección de datos personales</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="font-medium text-yellow-600">Misinformación</span>
                  <p className="text-gray-500 text-xs mt-1">Desinformación y fake news</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="font-medium text-purple-600">Malicious Actors</span>
                  <p className="text-gray-500 text-xs mt-1">Uso malicioso de IA</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="font-medium text-blue-600">Human-Computer</span>
                  <p className="text-gray-500 text-xs mt-1">Interacción persona-IA</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="font-medium text-green-600">Socioeconómico</span>
                  <p className="text-gray-500 text-xs mt-1">Impacto social y ambiental</p>
                </div>
                <div className="p-3 bg-white rounded-lg border col-span-2">
                  <span className="font-medium text-indigo-600">Seguridad de Sistemas IA</span>
                  <p className="text-gray-500 text-xs mt-1">Vulnerabilidades técnicas y ciberseguridad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
