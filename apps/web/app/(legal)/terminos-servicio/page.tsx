import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CumpliaLogo } from "@/components/ui/cumplia-logo";

export const metadata: Metadata = {
  title: "Términos de Servicio - CumplIA",
  description: "Términos y condiciones de uso de la plataforma CumplIA para cumplimiento del AI Act.",
  alternates: {
    canonical: "https://cumplia.com/terminos-servicio",
  },
};

export default function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <CumpliaLogo markSize={28} wordSize={20} variant="light" gap={8} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Términos de Servicio</h1>
        <p className="text-gray-500 mb-8">Última actualización: 15 de marzo de 2026</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-600 mb-4">
              Al acceder y utilizar la plataforma CumplIA, usted acepta estar legalmente obligado por estos 
              Términos de Servicio. Si no está de acuerdo con alguno de estos términos, no debe utilizar 
              nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-600 mb-4">
              CumplIA es una plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la 
              Unión Europea (AI Act). Nuestros servicios incluyen evaluación de riesgos, generación de 
              documentación y herramientas de seguimiento del cumplimiento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cuentas de Usuario</h2>
            <p className="text-gray-600 mb-4">
              Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa 
              y completa. Usted es responsable de mantener la confidencialidad de sus credenciales y de 
              todas las actividades que ocurran bajo su cuenta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Planes y Pagos</h2>
            <p className="text-gray-600 mb-4">
              Ofrecemos diferentes planes de suscripción con distintas funcionalidades. Los pagos se 
              procesan de forma segura a través de Stripe. Puede cancelar su suscripción en cualquier 
              momento desde su panel de control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Propiedad Intelectual</h2>
            <p className="text-gray-600 mb-4">
              Todo el contenido generado por la plataforma para su uso específico es propiedad suya. 
              Sin embargo, la plataforma, su código, diseño y marca son propiedad exclusiva de CumplIA.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 mb-4">
              CumplIA proporciona herramientas para facilitar el cumplimiento del AI Act, pero no 
              constituye asesoramiento legal. Recomendamos consultar con abogados especializados para 
              casos complejos. No nos hacemos responsables de sanciones derivadas de un uso inadecuado 
              de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Modificaciones</h2>
            <p className="text-gray-600 mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
              entrarán en vigor inmediatamente después de su publicación. El uso continuado de la 
              plataforma constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contacto</h2>
            <p className="text-gray-600">
              Para cualquier consulta sobre estos términos, contacte con nosotros en:{' '}
              <a href="mailto:legal@cumplia.com" className="text-blue-600 hover:underline">
                legal@cumplia.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
