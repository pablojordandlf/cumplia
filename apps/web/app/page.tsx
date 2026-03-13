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
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

export const metadata = {
  title: 'CumplIA - Cumplimiento del AI Act para Empresas',
  description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act). Evaluación de riesgos, documentación y monitoreo continuo.',
  keywords: 'AI Act, cumplimiento IA, regulación inteligencia artificial, IA responsable, GDPR, sistemas de IA',
};

// Header Component
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CumplIA</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#riesgos" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              El Riesgo
            </a>
            <a href="#solucion" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Solución
            </a>
            <a href="#precios" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Precios
            </a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Cumple el AI Act con Confianza
            <span className="block text-blue-600 mt-2">
              Transforma la Regulación en tu Ventaja Competitiva
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La inteligencia artificial avanza a pasos agigantados. Asegúrate de que tu negocio 
            no solo cumpla con el reglamento más importante de IA de Europa, sino que prospere en él. 
            CumplIA te guía paso a paso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Empieza tu Cumplimiento Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#solucion">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Más información
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
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
    <section id="riesgos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            El AI Act no es una Opción, es una Obligación
          </h2>
          <p className="text-lg text-gray-600">
            La entrada en vigor del AI Act europeo marca un antes y un después en el desarrollo 
            y uso de la Inteligencia Artificial. Ignorar esta regulación expone a tu empresa a:
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {risks.map((risk, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className={`${risk.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <risk.icon className={`h-7 w-7 ${risk.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{risk.title}</h3>
                <p className="text-gray-600">{risk.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-xl font-medium text-gray-800">
            ¿Está tu negocio preparado para operar legalmente en el ecosistema de IA de la UE?
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
      microcopy: "Nuestra IA analítica clasifica tus sistemas de acuerdo a los criterios del AI Act 2024."
    },
    {
      icon: FileText,
      title: "Gestión de Documentación y Trazabilidad",
      description: "Crea y mantén expedientes técnicos unificados, registros de datos y auditorías de conformidad.",
      microcopy: "Documenta cada paso de tu ciclo de vida de IA para auditorías simplificadas."
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
      microcopy: "Conecta CumplIA con tus herramientas de desarrollo y gestión de riesgos."
    }
  ];

  return (
    <section id="solucion" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Navega la Complejidad del AI Act con Inteligencia y Facilidad
          </h2>
          <p className="text-lg text-gray-600">
            CumplIA es la plataforma SaaS diseñada para simplificar el cumplimiento normativo de la IA. 
            Te proporcionamos las herramientas y la guía necesarias para entender, implementar y demostrar 
            que tus sistemas de IA cumplen con el AI Act.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-3">{feature.description}</p>
                <p className="text-sm text-blue-600 italic">{feature.microcopy}</p>
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Más Allá del Cumplimiento: Impulsa tu Innovación con Ética
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-lg font-medium text-gray-900">{benefit}</span>
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
    <section id="precios" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comienza tu Viaje de Cumplimiento Hoy Mismo
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-0 shadow-xl ${plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''}`}>
              {plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  Más Popular
                </div>
              )}
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-gray-500">
          Precios basados en facturación anual. Consulta para planes mensuales.
        </p>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "¿Cuándo entra en vigor el AI Act y a quién afecta?",
      answer: "El AI Act entrará en plena aplicación progresivamente, con la mayoría de las disposiciones aplicándose a partir de mediados de 2024. Afecta a proveedores y usuarios de sistemas de IA en el mercado de la UE, independientemente de dónde se encuentren si sus sistemas se usan en la UE."
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
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tus Dudas sobre el AI Act y CumplIA, Respondidas
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <p className="text-gray-600">{faq.answer}</p>
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
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            No Dejes el Futuro de tu IA al Azar
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Asegura tu Cumplimiento con CumplIA. El AI Act es una realidad que definirá 
            el panorama de la inteligencia artificial.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
              Solicita una Demostración Personalizada
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">CumplIA</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-white transition-colors">Blog de IA y Cumplimiento</a>
            </nav>
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
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
      <FAQSection />
      <Footer />
    </main>
  );
}
