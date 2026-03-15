import Link from 'next/link';
import { Shield, Linkedin, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Shield className="h-7 w-7 text-blue-500" />
              <span className="text-xl font-bold text-white">CumplIA</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Simplificamos el cumplimiento del AI Act para empresas europeas.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/cumplia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/cumplia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:contacto@cumplia.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#riesgos" className="hover:text-white transition-colors">El Riesgo</Link>
              </li>
              <li>
                <Link href="/#solucion" className="hover:text-white transition-colors">Solución</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">Precios</Link>
              </li>
              <li>
                <Link href="/guia-ai-act" className="hover:text-white transition-colors">Guía AI Act</Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog/que-es-ai-act" className="hover:text-white transition-colors">¿Qué es el AI Act?</Link>
              </li>
              <li>
                <Link href="/blog/sanciones-ai-act" className="hover:text-white transition-colors">Sanciones del AI Act</Link>
              </li>
              <li>
                <Link href="/recursos/checklist-ai-act" className="hover:text-white transition-colors">Checklist</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              </li>
              <li>
                <Link href="/terminos-servicio" className="hover:text-white transition-colors">Términos de Servicio</Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} CumplIA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
