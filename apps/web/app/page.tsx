import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Zap, 
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Users,
  ArrowRight,
  Building2,
  Globe,
  Scale
} from 'lucide-react';
import { Header } from '@/components/landing-header';
import { Footer } from '@/components/landing-footer';

export const metadata = {
  title: 'CumplIA - Cumplimiento del AI Act para Empresas',
  description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act). Evaluación de riesgos, documentación y gestión de casos de uso de IA.',
  keywords: 'AI Act, cumplimiento IA, regulación inteligencia artificial, IA responsable, GDPR, casos de uso IA',
};

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-12 sm:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">
            CumplIA simplifica el cumplimiento normativo
            <span className="block text-blue-600 mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Gestiona tus Casos de Uso de IA sin Complicaciones
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            La inteligencia artificial avanza a pasos agigantados. Asegúrate de que tu empresa 
            no solo cumpla con el reglamento más importante de IA de Europa, sino que prospere en él. 
            CumplIA guía a tu organización caso de uso por caso de uso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Evalúa tu primer caso gratis
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Ver planes y precios
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-gray-500">
            Sin tarjeta de crédito • Sin compromiso • Empieza en minutos
          </p>
        </div>
      </div>
    </section>
  );
}

function WhoAppliesSection() {
  return (
    <section className="py-12 sm:py-16 bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">¿A quién aplica el AI Act?</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              El Reglamento de IA de la UE aplica a cualquier organización que desarrolle, despliegue o utilice sistemas de IA en el mercado europeo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Empresas de la UE</h3>
                <p className="text-sm text-gray-600">Todas las empresas establecidas en la Unión Europea que usen o desarrollen IA, independientemente de su tamaño.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Empresas externas</h3>
                <p className="text-sm text-gray-600">Empresas fuera de la UE que ofrezcan sistemas de IA en el mercado europeo o afecten a ciudadanos de la UE.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sector público</h3>
                <p className="text-sm text-gray-600">Administraciones públicas y organismos gubernamentales que utilicen sistemas de IA en sus servicios.</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Link href="/guia-ai-act">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Guía completa del AI Act
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PainPointsSection() {
  const risks = [
    { icon: AlertTriangle, title: "Sanciones Millonarias", description: "Multas de hasta el 7% de tu facturación global anual o 35M€, la mayor de ambas, por cada caso de uso no conforme.", color: "text-red-600", bgColor: "bg-red-50" },
    { icon: Users, title: "Daño Reputacional", description: "Pérdida de confianza de clientes, socios e inversores por incumplimiento normativo.", color: "text-orange-600", bgColor: "bg-orange-50" },
    { icon: TrendingDown, title: "Retrasos en Innovación", description: "Bloqueo de proyectos de IA por incumplimiento, frenando tu crecimiento competitivo.", color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { icon: AlertCircle, title: "Desventaja Competitiva", description: "Mientras tus competidores se adaptan, tú te quedas atrás en el mercado europeo.", color: "text-purple-600", bgColor: "bg-purple-50" }
  ];

  return (
    <section id="riesgos" className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">El AI Act no es una Opción, es una Obligación</h2>
          <p className="text-base sm:text-lg text-gray-600">La entrada en vigor del AI Act europeo marca un antes y un después en el desarrollo y uso de la Inteligencia Artificial.</p>
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
          <Link href="/register">
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Descubre tu nivel de riesgo gratis<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Shield, title: "Evaluación de Riesgos por Caso de Uso", description: "Identifica la clasificación de riesgo de cada caso de uso según el AI Act.", microcopy: "Clasificación automática según criterios del AI Act 2024." },
    { icon: FileText, title: "Gestión de Documentación", description: "Crea y mantén expedientes técnicos unificados por caso de uso.", microcopy: "Documentación simplificada para auditorías." },
    { icon: BookOpen, title: "Guía Experta Integrada", description: "Accede a checklists y plantillas para cada caso de uso.", microcopy: "Recursos actualizados del AI Act." },
    { icon: Zap, title: "Generación de FRIA", description: "Genera automáticamente la Evaluación de Impacto en los Derechos Fundamentales (Art. 27).", microcopy: "Cumple con los requisitos más exigentes." }
  ];

  return (
    <section id="solucion" className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">CumplIA simplifica el cumplimiento normativo</h2>
          <p className="text-base sm:text-lg text-gray-600">Gestión integral de la conformidad del AI Act para tu organización.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
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
        <div className="text-center mt-10">
          <Link href="/register"><Button size="lg" className="bg-blue-600 hover:bg-blue-700">Empieza tu evaluación gratuita<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    { name: "Starter", price: "0€", period: "/mes", description: "Perfecto para validar tu primer caso de uso.", features: ["1 caso de uso", "1 sistema de IA", "Documentación básica", "Checklist cumplimiento", "Soporte email"], cta: "Empieza Gratis", popular: false },
    { name: "Essential", price: "29€", period: "/mes", description: "Ideal para startups y PYMEs.", features: ["Hasta 5 casos de uso", "Hasta 3 sistemas IA", "5 documentos/mes", "FRIA básica", "Soporte prioritario"], cta: "Elige Essential", popular: true },
    { name: "Professional", price: "99€", period: "/mes", description: "Casos de uso y sistemas ilimitados.", features: ["Casos de uso ilimitados", "Sistemas IA ilimitados", "Documentos ilimitados", "FRIA completa", "API access"], cta: "Elige Professional", popular: false }
  ];

  return (
    <section id="precios" className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Precios claros, basados en tu uso real</h2>
          <p className="text-base sm:text-lg text-gray-600">Paga por los <strong>casos de uso</strong> que gestionas, no por usuarios.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-0 shadow-xl ${plan.popular ? 'md:scale-105 ring-2 ring-blue-600' : ''}`}>
              {plan.popular && <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">Más Popular</div>}
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-3 sm:mt-4"><span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span><span className="text-gray-600">{plan.period}</span></div>
                <CardDescription className="mt-2 text-sm sm:text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm sm:text-base text-gray-600">{feature}</span></li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className={`w-full mt-4 sm:mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`} size="lg">{plan.cta}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/pricing"><Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Ver comparativa completa<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
        <p className="text-center mt-6 text-sm text-gray-500">
          ¿Necesitas un plan personalizado? <a href="mailto:sales@cumplia.com" className="text-blue-600 hover:underline font-medium">Contacta con nosotros</a>
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <WhoAppliesSection />
        <PainPointsSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
