import { PricingCard } from "@/components/pricing-card";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, HelpCircle, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Planes y Precios - CumplIA",
  description: "Soluciones de cumplimiento AI Act para empresas. Pricing por casos de uso desde 0€ hasta planes Enterprise. Evaluación de riesgos, documentación legal y gestión de IA.",
  keywords: ["precios AI Act", "planes cumplimiento IA", "software cumplimiento AI Act", "coste auditoría IA", "precio FRIA", "compliance empresas", "casos de uso IA"],
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
    description: "Perfecto para validar tu primer caso de uso de IA",
    features: [
      "1 caso de uso",
      "1 sistema de IA incluido",
      "Evaluación básica de riesgos",
      "Documentación básica ilimitada",
      "Checklist de cumplimiento",
      "Sin generación de documentos",
      "Soporte community",
    ],
    ctaText: "Empieza Gratis",
    popular: false,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
  {
    name: "Essential",
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "Ideal para startups y PYMEs con varios casos de uso",
    features: [
      "Hasta 5 casos de uso",
      "Hasta 3 sistemas de IA",
      "Evaluación completa de riesgos",
      "Generación FRIA básica",
      "5 documentos/mes",
      "Exportación PDF/DOCX",
      "Soporte por email prioritario",
    ],
    ctaText: "Elige Essential",
    popular: true,
    stripePriceIdMonthly: "price_essential_monthly",
    stripePriceIdYearly: "price_essential_yearly",
  },
  {
    name: "Professional",
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: "Para empresas en crecimiento con múltiples aplicaciones",
    features: [
      "Hasta 20 casos de uso",
      "Hasta 10 sistemas de IA",
      "FRIA completa Art. 27",
      "Documentos ilimitados",
      "Gestión multi-departamento",
      "API access",
      "Integraciones (Slack, Teams)",
      "Plantillas personalizadas",
      "Soporte prioritario",
    ],
    ctaText: "Elige Professional",
    popular: false,
    stripePriceIdMonthly: "price_professional_monthly",
    stripePriceIdYearly: "price_professional_yearly",
  },
  {
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Solución completa para grandes organizaciones",
    features: [
      "Casos de uso ilimitados",
      "Sistemas de IA ilimitados",
      "Todo lo de Professional",
      "On-premise / Cloud privado",
      "SSO y control de accesos",
      "Auditorías y certificaciones",
      "SLA garantizado 99.9%",
      "Account Manager dedicado",
      "Integraciones custom",
    ],
    ctaText: "Contactar Ventas",
    popular: false,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-4 sm:px-6 lg:px-8 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Planes para cada etapa
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde pruebas gratuitas hasta soluciones enterprise. 
            Cumple con el AI Act sin comprometer tu presupuesto.
          </p>
          
          {/* Explicación de Casos de Uso */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl max-w-3xl mx-auto">
            <div className="flex items-start gap-3 text-left">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Qué es un Caso de Uso?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Según el AI Act, cada <strong>aplicación concreta</strong> de IA en tu negocio es un caso de uso. 
                  No importa cuántos modelos o sistemas uses detrás.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border">1 chatbot = 1 caso</span>
                  <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border">1 sistema de recomendación = 1 caso</span>
                  <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border">1 herramienta de análisis CV = 1 caso</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
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

        {/* Feature Comparison */}
        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Comparativa de funciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Función</th>
                  <th className="text-center py-4 px-4 font-medium">Starter</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-600">Essential</th>
                  <th className="text-center py-4 px-4 font-medium">Professional</th>
                  <th className="text-center py-4 px-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Casos de uso</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">5</td>
                  <td className="text-center py-3 px-4">20</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Sistemas de IA</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">3</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Usuarios</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">3</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Documentos/mes</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">5</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">FRIA (Art. 27)</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Básica</td>
                  <td className="text-center py-3 px-4">Completa</td>
                  <td className="text-center py-3 px-4">Completa</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">API Access</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Integraciones</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">Custom</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Multi-departamento</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Soporte</td>
                  <td className="text-center py-3 px-4">Community</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Email</td>
                  <td className="text-center py-3 px-4">Prioritario</td>
                  <td className="text-center py-3 px-4">Dedicado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Use Cases */}
        <div className="mt-16 max-w-3xl mx-auto bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">¿Por qué preciamos por casos de uso?</h3>
          <p className="text-muted-foreground text-center mb-4">
            El AI Act obliga a documentar y auditar cada caso de uso de IA de forma individual. 
            Tu coste de cumplimiento depende del número de aplicaciones que gestionas, no del tamaño de tu equipo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-background rounded">
              <div className="font-semibold text-2xl text-green-600">35M€</div>
              <div className="text-muted-foreground">Multa máxima por incumplimiento</div>
            </div>
            <div className="text-center p-3 bg-background rounded">
              <div className="font-semibold text-2xl text-blue-600">100%</div>
              <div className="text-muted-foreground">Casos de uso documentados</div>
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
                ¿Qué pasa si excedo el límite de casos de uso?
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
                Sí, ofrecemos un 20% de descuento en todos los planes cuando eliges facturación anual.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16 text-center bg-blue-600 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">¿Listo para cumplir con el AI Act?</h3>
          <p className="text-blue-100 mb-6">Empieza gratis hoy y descubre cuántos casos de uso tiene tu empresa.</p>
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
            <a href="mailto:enterprise@cumplia.com" className="text-primary hover:underline font-medium">
              Contacta con nuestro equipo de ventas
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}