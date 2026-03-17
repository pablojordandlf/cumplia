import { PricingCard } from "@/components/pricing-card";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, HelpCircle, Info, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Planes y Precios - CumplIA",
  description: "Soluciones de cumplimiento AI Act para empresas. Pricing por sistemas de IA desde 0€. Evaluación de riesgos, documentación legal y gestión de compliance.",
  keywords: ["precios AI Act", "planes cumplimiento IA", "software cumplimiento AI Act", "coste auditoría IA", "precio FRIA", "compliance empresas", "sistemas de IA"],
  alternates: {
    canonical: "https://cumplia.com/pricing",
  },
  openGraph: {
    title: "Planes y Precios - CumplIA",
    description: "Soluciones de cumplimiento AI Act para empresas. Desde startups hasta grandes corporaciones.",
    url: "https://cumplia.com/pricing",
    type: "website",
  },
};

const pricingTiers = [
  {
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Valida tu primer sistema de IA y conoce la plataforma",
    features: [
      "1 Sistema de IA",
      "1 usuario",
      "Clasificación AI Act",
      "Obligaciones básicas",
      "Checklist de cumplimiento",
      "Sin generación de documentos",
    ],
    ctaText: "Empieza Gratis",
    popular: false,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
  {
    name: "Professional",
    monthlyPrice: 49,
    yearlyPrice: 490,
    description: "Ideal para PYMEs y consultoras con varios sistemas de IA",
    features: [
      "Hasta 15 Sistemas de IA",
      "Hasta 3 usuarios",
      "FRIA completa (Art. 27)",
      "Gestión completa de riesgos",
      "Registro de evidencias",
      "Exportación PDF/DOCX",
      "Soporte email prioritario",
    ],
    ctaText: "Elige Professional",
    popular: true,
    stripePriceIdMonthly: "price_professional_monthly",
    stripePriceIdYearly: "price_professional_yearly",
  },
  {
    name: "Business",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    description: "Para empresas con múltiples departamentos y necesidades avanzadas",
    features: [
      "Sistemas de IA ilimitados",
      "Hasta 10 usuarios",
      "Asistente IA",
      "Gestión de Riesgos avanzada",
      "Registro de evidencias",
      "Plantillas personalizadas",
      "Gestión multi-departamento",
      "Soporte prioritario",
    ],
    ctaText: "Elige Business",
    popular: false,
    stripePriceIdMonthly: "price_business_monthly",
    stripePriceIdYearly: "price_business_yearly",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-4 sm:px-6 lg:px-8 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Planes para cada etapa
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde pruebas gratuitas hasta soluciones empresariales. 
            Cumple con el AI Act sin comprometer tu presupuesto.
          </p>
          
          {/* Explicación de Sistemas de IA */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl max-w-3xl mx-auto">
            <div className="flex items-start gap-3 text-left">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Qué es un Sistema de IA?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Según el AI Act, un <strong>sistema de IA</strong> es cualquier aplicación basada en inteligencia artificial 
                  que tu empresa desarrolle, despliegue o utilice. Cada sistema debe evaluarse y documentarse individualmente.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border">1 chatbot = 1 sistema</span>
                  <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border">1 motor de recomendación = 1 sistema</span>
                  <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border">1 herramienta de análisis CV = 1 sistema</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              description={tier.description}
              monthlyPrice={tier.monthlyPrice}
              yearlyPrice={tier.yearlyPrice}
              features={tier.features}
              ctaText={tier.ctaText}
              popular={tier.popular}
              stripePriceIdMonthly={tier.stripePriceIdMonthly}
              stripePriceIdYearly={tier.stripePriceIdYearly}
            />
          ))}
        </div>

        {/* Enterprise CTA - Hidden temporarily
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Enterprise</h3>
                  <p className="text-gray-300">Para grandes corporaciones y organizaciones reguladas</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold">Custom</div>
                <p className="text-sm text-gray-400 mb-4">Precio según necesidades</p>
                <Link href="mailto:sales@cumplia.com">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100">
                    Contactar Ventas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Sistemas ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>SSO / SAML</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>SLA garantizado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Customer Success</span>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Feature Comparison */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Comparativa de funciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Función</th>
                  <th className="text-center py-4 px-4 font-medium">Starter</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-600">Professional</th>
                  <th className="text-center py-4 px-4 font-medium">Business</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Sistemas de IA</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">15</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Usuarios</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">3</td>
                  <td className="text-center py-3 px-4">10</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Clasificación AI Act</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Obligaciones</td>
                  <td className="text-center py-3 px-4">Básicas</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Completas</td>
                  <td className="text-center py-3 px-4">Completas</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Gestión de riesgos</td>
                  <td className="text-center py-3 px-4">Básica</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Completa</td>
                  <td className="text-center py-3 px-4">Avanzada</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">FRIA (Art. 27)</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Registro de evidencias</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Asistente IA</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Documentos/mes</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">10</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Plantillas custom</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Multi-departamento</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Soporte</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Prioritario</td>
                  <td className="text-center py-3 px-4">Prioritario</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why AI Systems */}
        <div className="mt-16 max-w-3xl mx-auto bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">¿Por qué precios por sistemas de IA?</h3>
          <p className="text-muted-foreground text-center mb-4">
            El AI Act obliga a documentar y auditar cada sistema de IA de forma individual. 
            Tu coste de cumplimiento depende del número de aplicaciones que gestionas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-background rounded">
              <div className="font-semibold text-2xl text-red-600">35M€</div>
              <div className="text-muted-foreground">Multa máxima por incumplimiento</div>
            </div>
            <div className="text-center p-3 bg-background rounded">
              <div className="font-semibold text-2xl text-blue-600">100%</div>
              <div className="text-muted-foreground">Sistemas documentados</div>
            </div>
            <div className="text-center p-3 bg-background rounded">
              <div className="font-semibold text-2xl text-purple-600">24h</div>
              <div className="text-muted-foreground">Tiempo medio de evaluación</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-8">Preguntas frecuentes</h3>
          <div className="space-y-4">
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                ¿Puedo cambiar de plan más adelante?
              </h4>
              <p className="text-sm text-muted-foreground">
                Sí, puedes actualizar o downgradear tu plan en cualquier momento. Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                ¿Qué pasa si excedo el límite de sistemas de IA?
              </h4>
              <p className="text-sm text-muted-foreground">
                Te notificaremos cuando te acerques al límite. Puedes actualizar tu plan o contactarnos para opciones personalizadas.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                ¿Hay descuentos por pago anual?
              </h4>
              <p className="text-sm text-muted-foreground">
                Sí, ofrecemos un ~17% de descuento en los planes Professional y Business cuando eliges facturación anual.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                ¿Necesito tarjeta de crédito para el plan Starter?
              </h4>
              <p className="text-sm text-muted-foreground">
                No, el plan Starter es completamente gratuito y no requiere tarjeta de crédito.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16 text-center bg-blue-600 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">¿Listo para cumplir con el AI Act?</h3>
          <p className="text-blue-100 mb-6">Empieza gratis hoy y descubre cuántos sistemas de IA tiene tu empresa.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Crear cuenta gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Necesitas un plan personalizado para tu organización?{" "}
            <a href="mailto:sales@cumplia.com" className="text-primary hover:underline font-medium">
              Contacta con nuestro equipo de ventas
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
