import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, HelpCircle, Info, X } from "lucide-react";

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

const tiers = [
  {
    key: "starter",
    name: "Starter",
    description: "Conoce la plataforma y evalúa tus primeros sistemas de IA",
    price: 0,
    priceLabel: "0€",
    period: "/mes",
    badge: null,
    highlight: false,
    ctaText: "Empieza Gratis",
    ctaHref: "/register",
    features: [
      "3 Sistemas de IA",
      "1 usuario administrador",
      "Clasificación AI Act",
      "Obligaciones básicas",
      "Checklist de cumplimiento",
    ],
    notIncluded: [
      "IA generativa",
      "Exportación de documentos",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    description: "Para PYMEs y consultoras que necesitan cumplir con el AI Act",
    price: 399,
    priceLabel: "399€",
    priceAnnualLabel: "319€",
    period: "/mes",
    badge: "Más popular",
    highlight: true,
    ctaText: "Elegir Professional",
    ctaHref: "/register?plan=professional",
    features: [
      "Hasta 15 Sistemas de IA",
      "Hasta 3 usuarios administradores",
      "Asistente de IA generativa incluido para facilitarte el trabajo",
      "FRIA completa (Art. 27)",
      "Acceso al módulo de gestión de riesgos IA",
      "Registro de evidencias",
      "Exportación PDF/DOCX",
    ],
    notIncluded: [],
  },
  {
    key: "business",
    name: "Business",
    description: "Para empresas con múltiples departamentos y más sistemas de IA",
    price: 899,
    priceLabel: "899€",
    priceAnnualLabel: "719€",
    period: "/mes",
    badge: null,
    highlight: false,
    ctaText: "Elegir Business",
    ctaHref: "/register?plan=business",
    features: [
      "Hasta 50 Sistemas de IA",
      "Hasta 10 usuarios administradores",
      "Asistente de IA generativa incluido para facilitarte el trabajo",
      "FRIA completa (Art. 27)",
      "Acceso al módulo de gestión de riesgos IA",
      "Registro de evidencias",
      "Exportación PDF/DOCX",
    ],
    notIncluded: [],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    description: "Para grandes organizaciones con necesidades a medida",
    price: 2499,
    priceLabel: "2.499€+",
    priceAnnualLabel: null,
    period: "/mes",
    badge: null,
    highlight: false,
    ctaText: "Contactar Ventas",
    ctaHref: "mailto:sales@cumplia.com",
    features: [
      "Sistemas de IA ilimitados",
      "Usuarios administradores ilimitados",
      "Asistente de IA generativa incluido para facilitarte el trabajo",
      "FRIA completa (Art. 27)",
      "Acceso al módulo de gestión de riesgos IA",
      "Registro de evidencias",
      "Exportación PDF/DOCX",
    ],
    notIncluded: [],
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
            Evalúa, cumple, protege y lidera en materia de AI Act.
            Empieza gratis y escala cuando lo necesites.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
            <span className="text-green-600 font-bold">Ahorra 20%</span>
            <span>con facturación anual — disponible al contratar</span>
          </div>

          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-blue-50 rounded-xl max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start gap-3 text-left">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0 sm:mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Qué es un Sistema de IA?</h3>
                <p className="text-[#7a8a92] text-sm mb-3">
                  Según el AI Act, un <strong>sistema de IA</strong> es cualquier aplicación basada en inteligencia artificial
                  que tu empresa desarrolle, despliegue o utilice. Cada sistema debe evaluarse y documentarse individualmente.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <span className="text-xs bg-white px-3 py-1.5 rounded-full text-[#7a8a92] border text-center">1 chatbot = 1 sistema</span>
                  <span className="text-xs bg-white px-3 py-1.5 rounded-full text-[#7a8a92] border text-center">1 motor de recomendación = 1 sistema</span>
                  <span className="text-xs bg-white px-3 py-1.5 rounded-full text-[#7a8a92] border text-center">1 herramienta de análisis CV = 1 sistema</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative rounded-2xl p-6 flex flex-col ${
                tier.highlight
                  ? "border-2 border-blue-500 bg-card shadow-lg"
                  : "border bg-card shadow-sm"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">{tier.badge}</Badge>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">{tier.priceLabel}</span>
                  {tier.period && <span className="text-slate-500">{tier.period}</span>}
                </div>
                {tier.key === "starter" && (
                  <Badge className="mt-2 bg-slate-500/20 text-slate-300">Gratis para siempre</Badge>
                )}
                {tier.priceAnnualLabel && (
                  <p className="text-xs text-green-700 mt-2 font-medium">
                    {tier.priceAnnualLabel}/mes pagando anual{" "}
                    <span className="text-green-600 font-bold">(ahorra 20%)</span>
                  </p>
                )}
                {tier.key === "enterprise" && (
                  <p className="text-xs text-slate-500 mt-2">Precio según necesidades · descuento anual disponible</p>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.ctaHref}>
                <Button
                  className={`w-full min-h-[52px] text-base ${
                    tier.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }`}
                  variant={tier.highlight ? "default" : "outline"}
                >
                  {tier.ctaText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Comparativa de planes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium"></th>
                  <th className="text-center py-4 px-4 font-medium">Starter</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-600">Professional</th>
                  <th className="text-center py-4 px-4 font-medium">Business</th>
                  <th className="text-center py-4 px-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Sistemas de IA</td>
                  <td className="text-center py-3 px-4">3</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">15</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Usuarios administradores</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">3</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Funcionalidades</td>
                  <td className="text-center py-3 px-4 text-slate-500">Limitadas</td>
                  <td className="text-center py-3 px-4 font-semibold text-blue-600">Completas</td>
                  <td className="text-center py-3 px-4 font-semibold">Completas</td>
                  <td className="text-center py-3 px-4 font-semibold">Completas</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">IA generativa</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Clasificación AI Act</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Gestión de riesgos</td>
                  <td className="text-center py-3 px-4 text-slate-500">Básica</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Completa</td>
                  <td className="text-center py-3 px-4">Avanzada</td>
                  <td className="text-center py-3 px-4">Avanzada</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">FRIA (Art. 27)</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Registro de evidencias</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Exportación PDF/DOCX</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Plantillas personalizadas</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Multi-departamento</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">SSO / SAML</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">SLA garantizado</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4 text-slate-400">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Soporte</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4 font-medium text-blue-600">Prioritario</td>
                  <td className="text-center py-3 px-4">Prioritario</td>
                  <td className="text-center py-3 px-4">Dedicado</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold">Precio/mes</td>
                  <td className="text-center py-4 px-4 font-bold">0€</td>
                  <td className="text-center py-4 px-4 font-bold text-blue-600">399€</td>
                  <td className="text-center py-4 px-4 font-bold">899€</td>
                  <td className="text-center py-4 px-4 font-bold">2.499€+</td>
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
                ¿Necesito tarjeta de crédito para el plan Starter?
              </h4>
              <p className="text-sm text-muted-foreground">
                No, el plan Starter es completamente gratuito y no requiere tarjeta de crédito.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                ¿Qué incluye la IA generativa?
              </h4>
              <p className="text-sm text-muted-foreground">
                Los planes Professional, Business y Enterprise incluyen generación automática de documentos de cumplimiento,
                asistente IA para análisis de riesgos y sugerencias inteligentes para obligaciones del AI Act.
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
