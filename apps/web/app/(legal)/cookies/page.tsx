import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Política de Cookies - CumplIA",
  description: "Información sobre el uso de cookies en CumplIA. Gestiona tus preferencias.",
};

export default function CookiesPage() {
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
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">CumplIA</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Cookies</h1>
        <p className="text-gray-500 mb-8">Última actualización: 15 de marzo de 2026</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">¿Qué son las Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando 
              visita un sitio web. Permiten que el sitio recuerde sus acciones y preferencias 
              durante un período de tiempo, para que no tenga que volver a introducirlas cada 
              vez que vuelva al sitio o navegue entre páginas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipos de Cookies que Utilizamos</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">Cookies Esenciales</h3>
            <p className="text-gray-600 mb-4">
              Estas cookies son necesarias para el funcionamiento básico de la plataforma. 
              No pueden desactivarse ya que son esenciales para la navegación y el uso de 
              funcionalidades como el inicio de sesión y la seguridad.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li><strong>session:</strong> Mantiene su sesión de usuario activa</li>
              <li><strong>csrf:</strong> Protección contra ataques CSRF</li>
              <li><strong>auth:</strong> Datos de autenticación segura</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">Cookies Analíticas</h3>
            <p className="text-gray-600 mb-4">
              Nos ayudan a entender cómo los usuarios interactúan con nuestra plataforma, 
              permitiéndonos mejorar continuamente nuestros servicios.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li><strong>_ga:</strong> Google Analytics - estadísticas de uso</li>
              <li><strong>_gid:</strong> Google Analytics - identificación de usuario</li>
              <li><strong>analytics:</strong> Métricas propias de uso de funcionalidades</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">Cookies de Preferencias</h3>
            <p className="text-gray-600 mb-4">
              Permiten recordar sus preferencias para ofrecerle una experiencia personalizada.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>theme:</strong> Preferencia de tema claro/oscuro</li>
              <li><strong>language:</strong> Idioma preferido</li>
              <li><strong>settings:</strong> Configuraciones de visualización</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Cookies</h2>
            <p className="text-gray-600 mb-4">
              Puede gestionar sus preferencias de cookies en cualquier momento. Tenga en cuenta 
              que desactivar ciertas cookies puede afectar al funcionamiento de la plataforma.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <h3 className="font-medium text-gray-900 mb-4">Configuración actual</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Cookies esenciales</p>
                    <p className="text-sm text-gray-500">Siempre activas</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Obligatorias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Cookies analíticas</p>
                    <p className="text-sm text-gray-500">Ayudan a mejorar nuestra plataforma</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Cookies de preferencias</p>
                    <p className="text-sm text-gray-500">Recuerdan sus ajustes</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies de Terceros</h2>
            <p className="text-gray-600 mb-4">
              Utilizamos servicios de terceros que también pueden establecer cookies en su dispositivo:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Stripe:</strong> Procesamiento de pagos seguro</li>
              <li><strong>Supabase:</strong> Autenticación y base de datos</li>
              <li><strong>Vercel:</strong> Hosting y análisis de rendimiento</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Estos terceros tienen sus propias políticas de privacidad y cookies. Le recomendamos 
              revisarlas para entender cómo utilizan sus datos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cómo Desactivar Cookies</h2>
            <p className="text-gray-600 mb-4">
              Puede configurar su navegador para rechazar cookies. Aquí tiene enlaces a las 
              instrucciones de los navegadores más populares:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cambios en esta Política</h2>
            <p className="text-gray-600 mb-4">
              Podemos actualizar esta política de cookies periódicamente para reflejar cambios 
              en las cookies que utilizamos o por otros motivos operativos, legales o regulatorios. 
              Le recomendamos revisar esta página regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contacto</h2>
            <p className="text-gray-600">
              Si tiene preguntas sobre nuestra política de cookies, contáctenos en:{' '}
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
