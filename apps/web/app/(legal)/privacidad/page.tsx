import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CumpliaLogo } from "@/components/ui/cumplia-logo";

export const metadata: Metadata = {
  title: "Política de Privacidad - CumplIA",
  description: "Política de privacidad y protección de datos de CumplIA. Cumplimiento con GDPR.",
  alternates: {
    canonical: "https://cumplia.com/privacidad",
  },
};

export default function PrivacidadPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
        <p className="text-gray-500 mb-8">Última actualización: 15 de marzo de 2026</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Responsable del Tratamiento</h2>
            <p className="text-gray-600 mb-4">
              El responsable del tratamiento de sus datos personales es CumplIA, S.L., con domicilio 
              en España y CIF B-00000000. Puede contactarnos en:{' '}
              <a href="mailto:privacy@cumplia.com" className="text-blue-600 hover:underline">
                privacy@cumplia.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Datos que Recopilamos</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Información de registro: nombre, email, empresa</li>
              <li>Datos de uso: interacciones con la plataforma</li>
              <li>Información de pago: gestionada por Stripe (no almacenamos datos de tarjetas)</li>
              <li>Datos de sistemas de IA: información que voluntariamente proporciona sobre sus sistemas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalidad del Tratamiento</h2>
            <p className="text-gray-600 mb-4">Utilizamos sus datos para:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Gestionar su cuenta y suscripción</li>
              <li>Enviar comunicaciones relacionadas con el servicio</li>
              <li>Mejorar nuestra plataforma mediante análisis de uso</li>
              <li>Cumplir obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Base Jurídica</h2>
            <p className="text-gray-600 mb-4">
              El tratamiento de sus datos se basa en: (a) la ejecución del contrato de servicios, 
              (b) el consentimiento explícito que nos proporciona, y (c) el cumplimiento de 
              obligaciones legales aplicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Conservación de Datos</h2>
            <p className="text-gray-600 mb-4">
              Conservamos sus datos personales mientras mantenga una cuenta activa o sea necesario 
              para proporcionarle nuestros servicios. Puede solicitar la eliminación de sus datos 
              en cualquier momento contactando con nosotros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Sus Derechos</h2>
            <p className="text-gray-600 mb-4">Conforme al GDPR, tiene derecho a:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Acceder a sus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la supresión de sus datos</li>
              <li>Oponerse al tratamiento</li>
              <li>Solicitar la portabilidad de sus datos</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Para ejercer estos derechos, envíe un email a:{' '}
              <a href="mailto:privacy@cumplia.com" className="text-blue-600 hover:underline">
                privacy@cumplia.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Seguridad</h2>
            <p className="text-gray-600 mb-4">
              Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos 
              personales contra acceso no autorizado, pérdida o alteración. Utilizamos encriptación 
              SSL/TLS para todas las transmisiones de datos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-600 mb-4">
              Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies 
              analíticas para mejorar nuestros servicios. Puede gestionar sus preferencias de 
              cookies en cualquier momento. Para más información, consulte nuestra{' '}
              <Link href="/cookies" className="text-blue-600 hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cambios en esta Política</h2>
            <p className="text-gray-600 mb-4">
              Podemos actualizar esta política periódicamente. Le notificaremos de cambios 
              significativos mediante email o mediante un aviso destacado en nuestra plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-600">
              Si tiene preguntas sobre esta política de privacidad, contacte con nuestro Delegado 
              de Protección de Datos en:{' '}
              <a href="mailto:privacy@cumplia.com" className="text-blue-600 hover:underline">
                privacy@cumplia.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
