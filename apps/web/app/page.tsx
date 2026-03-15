import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Activity, 
  BookOpen, 
  Zap, 
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Users,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/landing-header';

export const metadata = {
  title: 'CumplIA - Cumplimiento del AI Act para Empresas',
  description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act). Evaluación de riesgos, documentación y monitoreo continuo.',
  keywords: 'AI Act, cumplimiento IA, regulación inteligencia artificial, IA responsable, GDPR, sistemas de IA',
};

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-12 sm:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">
            Cumple el AI Act con Confianza
            <span className="block text-blue-600 mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Transforma la Regulación en tu Ventaja Competitiva
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            La inteligencia artificial avanza a pasos agigantados. Asegúrate de que tu empresa 
            no solo cumpla con el reglamento más importante de IA de Europa, sino que prospere en él. 
            CumplIA guía a tu organización paso a paso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Evalúa tu empresa gratis
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <a href="#solucion" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Más información
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-gray-500">
            Sin tarjeta de crédito • Sin compromiso • Empieza en minutos
          </p>
        </div>
      </div>
    </section>
  );
}

// Pain Points Section
function PainPointsSection() {
  const risks = [
    {
      icon: AlertTriangle,
      title: "Sanciones Millonarias",
      description: "Multas que pueden alcanzar el 7% de tu facturación global anual.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Users,
      title: "Daño Reputacional",
      description: "Pérdida de confianza de clientes, socios e inversores.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: TrendingDown,
      title: "Retrasos en Innovación",
      description: "Bloqueo de proyectos de IA por incumplimiento, frenando tu crecimiento.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: AlertCircle,
      title: "Desventaja Competitiva",
      description: "Mientras tus competidores se adaptan, tú te quedas atrás.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section id="riesgos" className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            El AI Act no es una Opción, es una Obligación
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            La entrada en vigor del AI Act europeo marca un antes y un después en el desarrollo 
            y uso de la Inteligencia Artificial. Ignorar esta regulación expone a tu empresa a:
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {risks.map((risk, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className={`${risk.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                  <risk.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${risk.color}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{risk.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{risk.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-base sm:text-xl font-medium text-gray-800 px-4">
            ¿Está tu empresa preparada para operar legalmente en el ecosistema de IA de la UE?
          </p>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Evaluación de Riesgos Automatizada",
      description: "Identifica la clasificación de riesgo de tus sistemas de IA según el AI Act (bajo, limitado, alto, inaceptable).",
      microcopy: "Nuestra IA analítica clasifica los sistemas de tu empresa según los criterios del AI Act 2024."
    },
    {
      icon: FileText,
      title: "Gestión de Documentación y Trazabilidad",
      description: "Crea y mantén expedientes técnicos unificados, registros de datos y auditorías de conformidad.",
      microcopy: "Documenta cada paso del ciclo de vida de IA de tu organización para auditorías simplificadas."
    },
    {
      icon: Activity,
      title: "Monitoreo Continuo",
      description: "Supervisa tus sistemas de IA en producción para asegurar el cumplimiento post-implementación.",
      microcopy: "Recibe alertas proactivas ante cualquier deriva o incumplimiento."
    },
    {
      icon: BookOpen,
      title: "Guía Experta Integrada",
      description: "Accede a checklists, plantillas y consejos de expertos en regulación de IA.",
      microcopy: "Recursos actualizados para ayudarte a comprender y aplicar las directrices del AI Act."
    },
    {
      icon: Zap,
      title: "Integración con Flujos de Trabajo",
      description: "Se adapta a tus metodologías de desarrollo y gestión de proyectos.",
      microcopy: "Conecta CumplIA con las herramientas de desarrollo y gestión de riesgos de tu empresa."
    }
  ];

  return (
    <section id="solucion" className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Navega la Complejidad del AI Act con Inteligencia y Facilidad
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            CumplIA es la plataforma SaaS diseñada para simplificar el cumplimiento normativo de la IA. 
            Proporcionamos a tu organización las herramientas y la guía necesarias para entender, implementar y demostrar 
            que los sistemas de IA de tu empresa cumplen con el AI Act.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="bg-blue-100 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3">{feature.description}</p>
                <p className="text-xs sm:text-sm text-blue-600 italic">{feature.microcopy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Benefits Section
function BenefitsSection() {
  const benefits = [
    "Reduce Riesgos y Evita Sanciones",
    "Acelera la Adopción de IA",
    "Fortalece la Confianza de Clientes",
    "Optimiza Recursos de tu Equipo",
    "Gana Ventaja Competitiva",
    "Cumplimiento Continuo y Actualizado"
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Más Allá del Cumplimiento: Impulsa tu Innovación con Ética
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 sm:p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                <span className="text-sm sm:text-lg font-medium text-gray-900">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: "Gratis",
      price: "0€",
      period: "/mes",
      description: "Perfecto para validar tu sistema de IA inicial o para equipos pequeños.",
      features: [
        "Evaluación de riesgo para 1 sistema de IA",
        "Documentación básica ilimitada",
        "1 hora de soporte por chat",
        "Checklist de cumplimiento básico"
      ],
      cta: "¡Prueba CumplIA Gratis!",
      popular: false
    },
    {
      name: "Profesional",
      price: "99€",
      period: "/mes",
      description: "Ideal para startups y PYMEs en crecimiento.",
      features: [
        "Todas las características del plan Gratis",
        "Evaluación de riesgo para hasta 5 sistemas",
        "Monitoreo continuo básico",
        "Soporte prioritario por email",
        "Plantillas de documentación avanzadas"
      ],
      cta: "Elige Plan Profesional",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      description: "Solución completa para grandes corporaciones y proyectos complejos.",
      features: [
        "Sistemas de IA ilimitados",
        "Monitoreo avanzado y personalizable",
        "Acceso a API para integraciones",
        "Soporte dedicado 24/7",
        "Consultoría de cumplimiento a medida"
      ],
      cta: "Solicitar Demo",
      popular: false
    }
  ];

  return (
    <section id="precios" className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Comienza tu Viaje de Cumplimiento Hoy Mismo
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-0 shadow-xl ${plan.popular ? 'md:scale-105 ring-2 ring-blue-600' : ''}`}>
              {plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  Más Popular
                </div>
              )}
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription className="mt-2 text-sm sm:text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button 
                    className={`w-full mt-4 sm:mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
          Precios basados en facturación anual. Consulta para planes mensuales.
        </p>
      </div>
    </section>
  );
}

// Timeline Section
function TimelineSection() {
  const milestones = [
    {
      date: '2 ago 2024',
      title: 'Publicación y entrada en vigor',
      description: 'El Reglamento 2024/1689 se publica y entra en vigor oficialmente.',
      completed: true,
      color: 'bg-green-500'
    },
    {
      date: '2 feb 2025',
      title: 'Prohibiciones activas',
      description: 'Entran en vigor las prohibiciones del Art. 5 y códigos de práctica GPAI.',
      completed: true,
      color: 'bg-red-500'
    },
    {
      date: '2 ago 2025',
      title: 'Obligaciones GPAI',
      description: 'Aplican obligaciones del Capítulo III para IA General y riesgo sistémico.',
      completed: false,
      color: 'bg-orange-500'
    },
    {
      date: '2 ago 2026',
      title: 'Sistemas de Alto Riesgo',
      description: 'Obligaciones completas para sistemas alto riesgo (Anexos II y III).',
      completed: false,
      color: 'bg-blue-500'
    },
    {
      date: '2 ago 2027',
      title: 'Sistemas existentes',
      description: 'Los sistemas alto riesgo ya en el mercado deben cumplir.',
      completed: false,
      color: 'bg-purple-500'
    }
  ];

  return (
    <section id="timeline" className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Calendario de Aplicación del AI Act
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            El Reglamento de IA de la UE se aplica progresivamente. 
            Conoce las fechas clave para planificar el cumplimiento de tu empresa.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-start mb-8 last:mb-0">
                {/* Punto del timeline */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 sm:w-16 sm:h-16 rounded-full ${milestone.color} flex items-center justify-center shadow-lg`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-4 h-4 sm:w-8 sm:h-8 text-white" />
                  ) : (
                    <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* Contenido */}
                <div className="ml-4 sm:ml-8 flex-1 bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-transparent hover:border-blue-500 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <span className="inline-block px-3 py-1 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-2 sm:mb-0">
                      {milestone.date}
                    </span>
                    {milestone.completed && (
                      <span className="text-xs text-green-600 font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completado
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">
              ¿Necesitas ayuda para cumplir con estas fechas?
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Empieza tu evaluación gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "¿Cuándo entra en vigor el AI Act y a quién afecta?",
      answer: "El AI Act entrará en vigor el 2 de agosto de 2024, ampliándose su aplicación progresivamente hasta 2027. Afecta a proveedores y usuarios de sistemas de IA en el mercado de la UE, independientemente de su ubicación, si sus sistemas se usan en la UE."
    },
    {
      question: "¿Mi sistema de IA actual ya necesita cumplir todo?",
      answer: "Depende de la clasificación de riesgo de tu sistema (limitado, alto, inaceptable). CumplIA te ayuda a determinar esta clasificación y a aplicar los requisitos correspondientes."
    },
    {
      question: "¿Qué tipo de IA cubre el AI Act?",
      answer: "Cualquier sistema de IA desarrollado para operar con diferentes niveles de autonomía y que pueda generar resultados como predicciones, recomendaciones o decisiones que influyan en entornos reales."
    },
    {
      question: "¿CumplIA es solo para empresas europeas?",
      answer: "No. CumplIA es para cualquier empresa que desarrolle, implemente o ponga a disposición sistemas de IA en el Espacio Económico Europeo, sin importar su ubicación geográfica."
    },
    {
      question: "¿Necesito ser un experto en IA o en derecho para usar CumplIA?",
      answer: "No. CumplIA está diseñado para ser intuitivo. Te guiamos a través del proceso con lenguaje accesible y herramientas automatizadas, complementado con recursos de ayuda."
    },
    {
      question: "¿Cómo garantiza CumplIA la seguridad de mis datos?",
      answer: "Utilizamos encriptación de extremo a extremo y cumplimos con las normativas de protección de datos más estrictas, incluyendo el GDPR. Tus datos de cumplimiento de IA son privados y seguros."
    },
    {
      question: "¿Puedo integrar CumplIA con mis sistemas de gestión de riesgos existentes?",
      answer: "Sí, nuestro Plan Enterprise ofrece acceso a API para una integración fluida con tus plataformas de gestión de riesgos y cumplimiento corporativo."
    }
  ];

  return (
    <section id="faq" className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Las dudas de tu empresa sobre el AI Act, respondidas
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer Section
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            No dejes el futuro de la IA de tu empresa al azar
          </h2>
          <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 px-2 sm:px-0">
            Asegura el cumplimiento de tu empresa con CumplIA. El AI Act es una realidad que definirá 
            el panorama de la inteligencia artificial en Europa.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
              Solicita una Demostración
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
        
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-8 sm:mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              <span className="text-lg sm:text-xl font-bold">CumplIA</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
              <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="/terminos-servicio" className="hover:text-white transition-colors">Términos</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </nav>
          </div>
          <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
            © 2024 CumplIA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <PainPointsSection />
      <FeaturesSection />
      <BenefitsSection />
      <PricingSection />
      <TimelineSection />
      <FAQSection />
      <Footer />
    </main>
  );
}