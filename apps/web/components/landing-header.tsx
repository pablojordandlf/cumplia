'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8ECEB] bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={loggedIn ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-[#E09E50]" />
            <span className="text-xl sm:text-2xl font-bold text-[#2D3E4E]">CumplIA</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#who-applies" className="text-sm font-medium text-[#7a8a92] hover:text-[#E09E50] transition-colors">
              AI Act
            </a>
            <a href="#features" className="text-sm font-medium text-[#7a8a92] hover:text-[#E09E50] transition-colors">
              Funciones
            </a>
            <Link href="/pricing" className="text-sm font-medium text-[#7a8a92] hover:text-[#E09E50] transition-colors">
              Precios
            </Link>
            <Link href="/guia-ai-act" className="text-sm font-medium text-[#7a8a92] hover:text-[#E09E50] transition-colors">
              Guía
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#7a8a92] hover:text-[#E09E50] hover:bg-[#E8ECEB]">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#E09E50] hover:bg-[#D9885F]">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#E8ECEB] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#2D3E4E]" />
            ) : (
              <Menu className="h-6 w-6 text-[#2D3E4E]" />
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
              className="md:hidden border-t border-[#E8ECEB] bg-white/95 backdrop-blur-xl"
            >
              <nav className="flex flex-col py-4 space-y-1">
                <a 
                  href="#who-applies" 
                  className="mx-4 px-4 py-4 text-base font-medium text-[#7a8a92] hover:text-[#E09E50] hover:bg-[#E8ECEB] rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Act
                </a>
                <a 
                  href="#features" 
                  className="mx-4 px-4 py-4 text-base font-medium text-[#7a8a92] hover:text-[#E09E50] hover:bg-[#E8ECEB] rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Funciones
                </a>
                <Link 
                  href="/pricing" 
                  className="mx-4 px-4 py-4 text-base font-medium text-[#7a8a92] hover:text-[#E09E50] hover:bg-[#E8ECEB] rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Precios
                </Link>
                <Link 
                  href="/guia-ai-act" 
                  className="mx-4 px-4 py-4 text-base font-medium text-[#7a8a92] hover:text-[#E09E50] hover:bg-[#E8ECEB] rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Guía
                </Link>
                <div className="border-t border-[#E8ECEB] pt-4 mt-2 px-4 space-y-3">
                  <Link href="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full min-h-[52px] text-base border-[#E8ECEB] text-[#7a8a92] hover:bg-[#E8ECEB] hover:text-[#E09E50]">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full min-h-[52px] text-base bg-[#E09E50] hover:bg-[#D9885F]">
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
