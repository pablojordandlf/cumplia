'use client'

import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-md" />
              <span className="font-bold text-white text-lg">Cumplia</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI compliance para humanos. No para abogados.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4">Producto</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Roadmap</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Empleos</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Términos</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row items-center justify-between">
          
          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            © 2026 Cumplia. Todos los derechos reservados.
          </p>

          {/* Social */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
