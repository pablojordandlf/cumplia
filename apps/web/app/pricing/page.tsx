import { PricingCard } from "@/components/pricing-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y Precios - CumplIA",
  description: "Elige el plan perfecto para cumplir con el AI Act. Desde gratis hasta Enterprise. Incluye evaluación de riesgos, documentación legal y monitoreo de sistemas de IA.",
  keywords: ["precios AI Act", "planes cumplimiento IA", "software cumplimiento AI Act", "coste auditoría IA", "precio FRIA"],
  alternates: {
    canonical: "https://cumplia.com/pricing",
  },
  openGraph: {
    title: "Planes y Precios - CumplIA",
    description: "Desde gratis hasta Enterprise. Cumple con el AI Act sin complicaciones.",
    url: "https://cumplia.com/pricing",
    type: "website",
  },
};

const pricingTiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Hasta 3 documentos",
      "10 usos de IA/mes",
      "Plantillas básicas",
      "Soporte por email",
    ],
    ctaText: "Empezar Gratis",
    popular: false,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "Documentos ilimitados",
      "500 usos de IA/mes",
      "Todas las plantillas",
      "Análisis de riesgos",
      "Soporte prioritario",
      "Exportación PDF/DOCX",
    ],
    ctaText: "Suscribirse",
    popular: true,
    stripePriceIdMonthly: "price_pro_monthly",
    stripePriceIdYearly: "price_pro_yearly",
  },
  {
    name: "Agency",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Todo lo de Pro",
      "Usos de IA ilimitados",
      "Gestión de múltiples clientes",
      "White-label",
      "API access",
      "Soporte dedicado",
      "Onboarding personalizado",
    ],
    ctaText: "Contactar Ventas",
    popular: false,
    stripePriceIdMonthly: "price_agency_monthly",
    stripePriceIdYearly: "price_agency_yearly",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-4 sm:px-6 lg:px-8 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Planes y Precios
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para tus necesidades de cumplimiento. 
            Todos los planes incluyen actualizaciones automáticas según el AI Act.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Necesitas un plan personalizado?{" "}
            <a href="mailto:enterprise@cumplia.com" className="text-primary hover:underline">
              Contacta con nuestro equipo de ventas
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
