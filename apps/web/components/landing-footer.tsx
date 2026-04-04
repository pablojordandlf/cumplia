import Link from 'next/link';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import { CumpliaLogo } from '@/components/ui/cumplia-logo';

export function Footer() {
  return (
    <footer className="bg-[#0F0F0E] text-[#8B9BB4]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-flex mb-4">
              <CumpliaLogo markSize={28} wordSize={20} variant="dark" />
            </Link>
            <p className="text-sm text-[#8B9BB4] mb-4 font-light leading-relaxed">
              Simplificamos el cumplimiento del AI Act para empresas europeas.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/cumplia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B9BB4] hover:text-[#E8FF47] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/cumplia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B9BB4] hover:text-[#E8FF47] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contacto@cumplia.com"
                className="text-[#8B9BB4] hover:text-[#E8FF47] transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-[#F0EEE8] font-medium mb-4 text-sm tracking-wide">Producto</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><Link href="/#riesgos"   className="hover:text-[#E8FF47] transition-colors">El Riesgo</Link></li>
              <li><Link href="/#solucion"  className="hover:text-[#E8FF47] transition-colors">Solución</Link></li>
              <li><Link href="/pricing"    className="hover:text-[#E8FF47] transition-colors">Precios</Link></li>
              <li><Link href="/guia-ai-act" className="hover:text-[#E8FF47] transition-colors">Guía AI Act</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-[#F0EEE8] font-medium mb-4 text-sm tracking-wide">Recursos</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><Link href="/blog/que-es-ai-act"       className="hover:text-[#E8FF47] transition-colors">¿Qué es el AI Act?</Link></li>
              <li><Link href="/blog/sanciones-ai-act"    className="hover:text-[#E8FF47] transition-colors">Sanciones del AI Act</Link></li>
              <li><Link href="/recursos/checklist-ai-act" className="hover:text-[#E8FF47] transition-colors">Checklist</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#F0EEE8] font-medium mb-4 text-sm tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><Link href="/privacidad"        className="hover:text-[#E8FF47] transition-colors">Privacidad</Link></li>
              <li><Link href="/terminos-servicio" className="hover:text-[#E8FF47] transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/cookies"           className="hover:text-[#E8FF47] transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a1a19] mt-12 pt-8 text-center text-sm text-[#BDB9B0] font-light">
          <p>&copy; {new Date().getFullYear()} CumplIA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
