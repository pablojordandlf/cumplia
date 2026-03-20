'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />
            <span className="text-xl sm:text-2xl font-bold text-white">CumplIA</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#who-applies" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              AI Act
            </a>
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Funciones
            </a>
            <Link href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Precios
            </Link>
            <Link href="/guia-ai-act" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Guía
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-300" />
            ) : (
              <Menu className="h-6 w-6 text-slate-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl"
            >
              <nav className="flex flex-col py-4 space-y-1">
                <a 
                  href="#who-applies" 
                  className="mx-4 px-4 py-4 text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Act
                </a>
                <a 
                  href="#features" 
                  className="mx-4 px-4 py-4 text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Funciones
                </a>
                <Link 
                  href="/pricing" 
                  className="mx-4 px-4 py-4 text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Precios
                </Link>
                <Link 
                  href="/guia-ai-act" 
                  className="mx-4 px-4 py-4 text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Guía
                </Link>
                <div className="border-t border-slate-800 pt-4 mt-2 px-4 space-y-3">
                  <Link href="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full min-h-[52px] text-base border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full min-h-[52px] text-base bg-blue-600 hover:bg-blue-700">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
