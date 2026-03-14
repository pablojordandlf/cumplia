import { PricingCard } from "@/components/pricing-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y Precios - CumplIA",
  description: "Soluciones de cumplimiento AI Act para empresas. Desde startups hasta grandes corporaciones. Evaluación de riesgos, documentación legal y gestión de sistemas de IA.",
  keywords: ["precios AI Act", "planes cumplimiento IA", "software cumplimiento AI Act", "coste auditoría IA", "precio FRIA", "compliance empresas"],
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
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Para probar la plataforma",
    features: [
      "1 sistema de IA",
      "1 usuario",
      "Evaluación básica de riesgos",
      "Visualización de clasificación",
      "Sin generación de documentos",
      "Soporte community",
    ],
    ctaText: "Empezar Gratis",
    popular: false,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
  {
    name: "PRO",
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: "Para pequeñas empresas",
    features: [
      "Hasta 5 sistemas de IA",
      "3 usuarios",
      "Evaluación completa de riesgos",
      "Generación FRIA básica",
      "10 documentos/mes",
      "Exportación PDF/DOCX",
      "Soporte por email",
    ],
    ctaText: "Suscribirse",
    popular: true,
    stripePriceIdMonthly: "price_pro_monthly",
    stripePriceIdYearly: "price_pro_yearly",
  },
  {
    name: "Business",
    monthlyPrice: 239,
    yearlyPrice: 2390,
    description: "Para empresas en crecimiento",
    features: [
      "Hasta 15 sistemas de IA",
      "10 usuarios",
      "FRIA completa Art. 27",
      "Documentos ilimitados",
      "Gestión multi-departamento",
      "API access",
      "Integraciones (Slack, Teams)",
      "Plantillas personalizadas",
      "Soporte prioritario",
    ],
    ctaText: "Suscribirse",
    popular: false,
    stripePriceIdMonthly: "price_business_monthly",
    stripePriceIdYearly: "price_business_yearly",
  },
  {
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Para grandes organizaciones",
    features: [
      "Sistemas de IA ilimitados",
      "Usuarios ilimitados",
      "Todo lo de Business",
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
                  <th className="text-center py-4 px-4 font-medium">Free</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-600">PRO</th>
                  <th className="text-center py-4 px-4 font-medium">Business</th>
                  <th className="text-center py-4 px-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Sistemas de IA</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">5</td>
                  <td className="text-center py-3 px-4">15</td>
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
                  <td className="text-center py-3 px-4 font-medium text-blue-600">10</td>
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

        <div className="mt-16 max-w-3xl mx-auto bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">¿Por qué preciamos por sistemas de IA?</h3>
          <p className="text-muted-foreground text-center mb-4">
            El AI Act obliga a documentar y auditar cada sistema de IA de forma individual. 
            Tu coste de cumplimiento depende del número de sistemas que gestionas, no del tamaño de tu equipo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-background rounded">
              <div className="font-semibold text-2xl text-green-600">35M€</div>
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
