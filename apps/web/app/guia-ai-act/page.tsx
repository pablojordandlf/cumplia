import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  FileText,
  Scale
} from 'lucide-react';
import { Header } from '@/components/landing-header';

export const metadata = {
  title: 'Guía Definitiva del AI Act 2024 | Todo sobre el Reglamento de IA de la UE',
  description: 'Guía completa del AI Act europeo: clasificación de riesgos, obligaciones, sanciones, calendario de aplicación y cómo cumplir. Todo lo que tu empresa necesita saber sobre el Reglamento de Inteligencia Artificial de la UE.',
  keywords: 'AI Act, Reglamento IA UE, cumplimiento AI Act, guía AI Act, clasificación riesgos IA, obligaciones AI Act, sanciones AI Act, FRIA, evaluación impacto IA',
};

// JSON-LD Schema
function ArticleSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Guía Definitiva del AI Act 2024: Cumplimiento, Riesgos y Sanciones',
    description: 'Guía completa del AI Act europeo: clasificación de riesgos, obligaciones, sanciones, calendario de aplicación y cómo cumplir.',
    author: {
      '@type': 'Organization',
      name: 'CumplIA',
      url: 'https://cumplia.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CumplIA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cumplia.com/logo.png',
      },
    },
    datePublished: '2024-03-14',
    dateModified: '2024-03-14',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://cumplia.com/guia-ai-act',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://cumplia.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guía AI Act',
        item: 'https://cumplia.com/guia-ai-act',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-12 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center space-x-2 text-sm text-[#7a8a92]">
              <li><Link href="/" className="hover:text-blue-600">Inicio</Link></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Guía AI Act</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">
            Guía Definitiva del AI Act
            <span className="block text-blue-600 mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Todo sobre el Reglamento de IA de la UE
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#7a8a92] mb-6 sm:mb-8 max-w-3xl mx-auto px-2 sm:px-0">
            El <strong>Reglamento de Inteligencia Artificial de la UE (AI Act)</strong> es la primera 
            normativa integral del mundo sobre sistemas de IA. Descubre todo lo que tu empresa 
            necesita saber para cumplir con esta regulación histórica y evitar sanciones millonarias.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Comenzar Cumplimiento Gratis
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Ver Planes y Precios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// What is AI Act Section
function WhatIsAIActSection() {
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            ¿Qué es el AI Act y por qué es Crucial para tu Empresa?
          </h2>
          
          <div className="prose prose-lg max-w-none text-[#7a8a92] space-y-4">
            <p>
              El <strong>AI Act (Reglamento de Inteligencia Artificial de la Unión Europea)</strong> es 
              la primera normativa integral del mundo diseñada para regular el desarrollo, implementación 
              y uso de sistemas de inteligencia artificial. Aprobado en 2024, establece un marco jurídico 
              vinculante que afecta a todas las empresas que desarrollan, distribuyen o utilizan IA en el 
              mercado europeo.
            </p>
            
            <p>
              Esta regulación nace con el objetivo de garantizar que los sistemas de IA utilizados en 
              la UE sean seguros, respeten los derechos fundamentales de los ciudadanos europeos y 
              fomenten la confianza en la tecnología. El <strong>Reglamento de IA de la UE</strong> 
              clasifica los sistemas según su nivel de riesgo potencial, aplicando requisitos más 
              estrictos a aquellos que puedan afectar significativamente a las personas.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              ¿Quién debe cumplir con el AI Act?
            </h3>
            
            <p>
              El <strong>cumplimiento del AI Act</strong> es obligatorio para:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Proveedores de IA</strong>: Empresas que desarrollan sistemas de inteligencia 
                artificial para el mercado europeo, independientemente de su ubicación geográfica.
              </li>
              <li>
                <strong>Usuarios de IA</strong>: Organizaciones que implementan sistemas de IA en 
                sus procesos, productos o servicios dentro de la UE.
              </li>
              <li>
                <strong>Distribuidores e importadores</strong>: Entidades que comercializan sistemas 
                de IA en el territorio de la Unión Europea.
              </li>
              <li>
                <strong>Responsables de despliegue</strong>: Organizaciones que utilizan sistemas de 
                IA propiedad de terceros en el contexto institucional o empresarial.
              </li>
            </ul>

            <p>
              La extraterritorialidad de esta normativa significa que incluso empresas fuera de Europa 
              deben cumplir si sus sistemas de IA afectan a personas en la UE. Esto convierte al 
              <strong>AI Act</strong> en un estándar global de facto, similar a lo ocurrido con el GDPR.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Risk Classification Section
function RiskClassificationSection() {
  const riskLevels = [
    {
      title: 'Sistemas Prohibidos',
      level: 'prohibited',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      examples: [
        'Sistemas de manipulación cognitiva subliminal',
        'Puntuación social masiva por parte de gobiernos',
        'Sistemas de identificación biométrica remota en tiempo real en espacios públicos',
        'Sistemas que explotan vulnerabilidades de grupos específicos',
      ],
      description: 'Prácticas de IA consideradas inaceptables que representan una amenaza clara para la seguridad, los derechos fundamentales y la libertad de elección de las personas.',
    },
    {
      title: 'Sistemas de Alto Riesgo',
      level: 'high',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      examples: [
        'Sistemas de gestión de infraestructuras críticas',
        'Sistemas educativos y de evaluación profesional',
        'Sistemas de contratación y gestión de empleo',
        'Sistemas de evaluación de acceso a servicios esenciales',
        'Sistemas de evaluación de riesgos en el sector financiero',
        'Sistemas de asistencia judicial y aplicación de la ley',
      ],
      description: 'Sistemas que pueden afectar significativamente a los derechos fundamentales, la seguridad o la vida de las personas. Requieren cumplimiento estricto.',
    },
    {
      title: 'Sistemas de Riesgo Limitado',
      level: 'limited',
      icon: Shield,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      examples: [
        'Chatbots y asistentes conversacionales',
        'Sistemas de generación de contenido (deepfakes)',
        'Sistemas de reconocimiento de emociones',
        'Sistemas de categorización biométrica',
      ],
      description: 'Sistemas que interactúan con personas o generan contenido sintético. Deben cumplir con requisitos de transparencia específicos.',
    },
    {
      title: 'Sistemas de Riesgo Mínimo',
      level: 'minimal',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      examples: [
        'Filtros de spam',
        'Sistemas de recomendación básicos',
        'Videojuegos con IA',
        'Sistemas de optimización de inventario',
      ],
      description: 'La mayoría de los sistemas de IA caen en esta categoría. No tienen obligaciones específicas más allá de los códigos de conducta voluntarios.',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-[#E8ECEB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Clasificación de Riesgos del AI Act
          </h2>
          
          <p className="text-lg text-[#7a8a92] mb-8">
            El <strong>Reglamento de IA UE</strong> establece un sistema de clasificación basado en el 
            nivel de riesgo que un sistema de IA puede suponer para los derechos fundamentales, la 
            seguridad y la libertad de elección de las personas. Comprender esta clasificación es 
            fundamental para determinar las obligaciones de tu empresa.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {riskLevels.map((risk) => (
              <Card key={risk.level} className={`border-2 ${risk.borderColor} ${risk.bgColor}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`${risk.bgColor} p-3 rounded-lg`}>
                      <risk.icon className={`h-6 w-6 ${risk.color}`} />
                    </div>
                    <CardTitle className={`text-xl ${risk.color}`}>{risk.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{risk.description}</p>
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Ejemplos:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-[#7a8a92]">
                      {risk.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Timeline Section
function TimelineSection() {
  const milestones = [
    {
      date: '2 agosto 2024',
      title: 'Publicación y entrada en vigor',
      description: 'El reglamento (Reglamento 2024/1689) se publica y entra en vigor.',
      completed: true,
    },
    {
      date: '2 febrero 2025',
      title: 'Prohibiciones (Art. 5) y Códigos de práctica GPAI',
      description: 'Entran en vigor las prohibiciones del Artículo 5 y los códigos de práctica para IA Generativa.',
      completed: false,
    },
    {
      date: '2 agosto 2025',
      title: 'Obligaciones GPAI y Sistemas de IA General con Riesgo Sistémico',
      description: 'Aplican obligaciones del Capítulo III para GPAI, sistemas de IA general con riesgo sistémico y notificación de incidentes.',
      completed: false,
    },
    {
      date: '2 agosto 2026',
      title: 'Obligaciones Sistemas ALTO RIESGO',
      description: 'Aplican obligaciones para sistemas de alto riesgo (Anexos II y III), FRIA, sistema de calidad y documentación técnica.',
      completed: false,
    },
    {
      date: '2 agosto 2027',
      title: 'Cumplimiento de sistemas alto riesgo ya en el mercado',
      description: 'Los sistemas de alto riesgo ya existentes en el mercado deben cumplir con el Reglamento AI Act.',
      completed: false,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Calendario del AI Act: Fechas Clave
          </h2>
          
          <p className="text-lg text-[#7a8a92] mb-8">
            El <strong>AI Act se aplica progresivamente</strong> para dar tiempo a las empresas 
            a adaptarse. Conoce las fechas críticas para planificar tu estrategia de cumplimiento.
          </p>

          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-blue-600'}`} />
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-[#E8ECEB]/60 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      milestone.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {milestone.date}
                    </span>
                    {milestone.completed && (
                      <span className="text-xs text-green-600 font-medium">✓ Completado</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                  <p className="text-[#7a8a92] mt-1">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Penalties Section
function PenaltiesSection() {
  return (
    <section className="py-12 sm:py-20 bg-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Sanciones del AI Act: El Coste del Incumplimiento
          </h2>
          
          <p className="text-lg text-[#7a8a92] mb-8">
            El <strong>incumplimiento del AI Act</strong> puede resultar en sanciones económicas 
            severas. Las multas se calculan en función del tipo de infracción y el volumen de 
            negocio de la empresa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-red-600" />
                  <CardTitle className="text-lg">Sanciones más severas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600 mb-2">35 millones €</p>
                <p className="text-[#7a8a92]">o el <strong>7% de la facturación global anual</strong> del año anterior (el valor más alto).</p>
                <p className="text-sm text-[#7a8a92] mt-4">
                  Aplicables al uso de sistemas de IA prohibidos o incumplimiento de requisitos para modelos de alto impacto.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <CardTitle className="text-lg">Infracciones graves</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600 mb-2">15 millones €</p>
                <p className="text-[#7a8a92]">o el <strong>3% de la facturación global anual</strong> del año anterior (el valor más alto).</p>
                <p className="text-sm text-[#7a8a92] mt-4">
                  Aplicables al incumplimiento de obligaciones para sistemas de alto riesgo o deficiencias en la evaluación de impacto.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg border border-red-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Impacto más allá de las multas
            </h3>
            <ul className="space-y-3 text-[#7a8a92]">
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>Daño reputacional:</strong> Pérdida de confianza de clientes, inversores y partners.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>Bloqueo de operaciones:</strong> Prohibición de comercializar o utilizar sistemas de IA no conformes.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>Responsabilidad legal:</strong> Posibles acciones judiciales por parte de usuarios afectados.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-12 sm:py-20 bg-blue-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para asegurar el cumplimiento del AI Act?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            CumplIA guía a tu empresa paso a paso en todo el proceso de cumplimiento del Reglamento de 
            Inteligencia Artificial de la UE. Desde la clasificación de riesgos hasta la 
            documentación regulatoria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-[#E8ECEB] px-8 py-6 text-lg w-full sm:w-auto">
                <CheckCircle className="mr-2 h-5 w-5" />
                Registrarse Gratis
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-6 text-lg w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Ver Planes
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-200">
            Sin tarjeta de crédito • Empieza en minutos • Cancela cuando quieras
          </p>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: '¿El AI Act afecta a empresas fuera de la UE?',
      answer: 'Sí, el AI Act tiene efecto extraterritorial. Cualquier empresa que desarrolle, distribuya o utilice sistemas de IA que afecten a personas en la UE debe cumplir con esta regulación, independientemente de su ubicación geográfica.',
    },
    {
      question: '¿Qué es la FRIA (Evaluación de Impacto en IA)?',
      answer: 'La FRIA (Fundamental Rights Impact Assessment) es un análisis obligatorio para sistemas de alto riesgo que evalúa el impacto potencial en los derechos fundamentales de las personas afectadas. Debe realizarse antes de la implementación del sistema.',
    },
    {
      question: '¿Cómo sé si mi sistema de IA es de alto riesgo?',
      answer: 'Un sistema es de alto riesgo si se utiliza en sectores críticos como infraestructuras esenciales, educación, empleo, servicios públicos esenciales, justicia o vigilancia biométrica. CumplIA incluye una herramienta de evaluación automatizada para determinar la clasificación.',
    },
    {
      question: '¿Cuánto tiempo tengo para cumplir el AI Act?',
      answer: 'El calendario varía según el tipo de sistema. Las prohibiciones aplican desde febrero de 2025, los requisitos para modelos de IA general desde agosto de 2025, y la aplicación completa para sistemas de alto riesgo comienza en agosto de 2026.',
    },
    {
      question: '¿Necesito un abogado especializado para cumplir el AI Act?',
      answer: 'Aunque recomendable para casos complejos, no es obligatorio. Plataformas como CumplIA proporcionan guías paso a paso, plantillas y herramientas automatizadas que facilitan el cumplimiento sin necesidad de conocimientos jurídicos especializados.',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
            Preguntas Frecuentes sobre el AI Act
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-[#E8ECEB]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-[#7a8a92]">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Related Content Section
function RelatedContentSection() {
  return (
    <section className="py-12 sm:py-20 bg-[#E8ECEB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Contenido Relacionado
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog/que-es-ai-act">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Qué es el AI Act? Guía para principiantes
                  </h3>
                  <p className="text-[#7a8a92] text-sm">
                    Introducción completa al Reglamento de Inteligencia Artificial de la UE para empresas.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/blog/sanciones-ai-act">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <Scale className="h-8 w-8 text-red-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sanciones del AI Act: Cuánto puedes pagar
                  </h3>
                  <p className="text-[#7a8a92] text-sm">
                    Análisis detallado de las multas y penalizaciones por incumplimiento del AI Act.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recursos/checklist-ai-act">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <FileText className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Checklist de Cumplimiento AI Act
                  </h3>
                  <p className="text-[#7a8a92] text-sm">
                    Lista de verificación descargable para evaluar el cumplimiento de tu empresa.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pricing">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Planes y Precios de CumplIA
                  </h3>
                  <p className="text-[#7a8a92] text-sm">
                    Descubre nuestras soluciones para facilitar el cumplimiento del AI Act.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Page
export default function GuiaAIActPage() {
  return (
    <>
      <ArticleSchema />
      <BreadcrumbSchema />
      <main className="min-h-screen">
        <Header />
        <HeroSection />
        <WhatIsAIActSection />
        <RiskClassificationSection />
        <TimelineSection />
        <PenaltiesSection />
        <CTASection />
        <FAQSection />
        <RelatedContentSection />
      </main>
    </>
  );
}
