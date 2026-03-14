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
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 sistema de IA gestionado",
      "1 usuario",
      "Evaluación de riesgos básica",
      "Plantillas de documentación",
      "Soporte por email",
    ],
    ctaText: "Empezar Gratis",
    popular: false,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
  {
    name: "Professional",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Hasta 5 sistemas de IA",
      "3 usuarios de empresa",
      "Evaluación de riesgos completa",
      "Generación de FRIA automatizada",
      "Registro de sistemas",
      "Soporte prioritario",
      "Exportación PDF/DOCX",
    ],
    ctaText: "Suscribirse",
    popular: true,
    stripePriceIdMonthly: "price_professional_monthly",
    stripePriceIdYearly: "price_professional_yearly",
  },
  {
    name: "Business",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      "Hasta 15 sistemas de IA",
      "10 usuarios de empresa",
      "Todo lo de Professional",
      "Gestión multi-departamento",
      "API access",
      "Integraciones (Slack, Teams)",
      "Onboarding personalizado",
      "Soporte dedicado",
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
    features: [
      "Sistemas de IA ilimitados",
      "Usuarios ilimitados",
      "Todo lo de Business",
      "Despliegue On-premise / Cloud privado",
      "SSO y control de accesos avanzado",
      "Auditorías y certificaciones",
      "SLA garantizado 99.9%",
      "Account Manager dedicado",
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
            Planes para Empresas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluciones de cumplimiento AI Act diseñadas para empresas de cualquier tamaño. 
            Gestiona tus sistemas de IA y cumple con el Reglamento Europeo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
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
