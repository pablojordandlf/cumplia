'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { CumpliaLogo } from '@/components/ui/cumplia-logo';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  const navLinkClass =
    'text-[13px] font-light text-[#8B9BB4] hover:text-[#0B1C3D] transition-colors tracking-[-0.01em]';

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[#E3DFD5] bg-[#FAFAF8]/95 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href={loggedIn ? '/dashboard' : '/'}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <CumpliaLogo markSize={30} wordSize={22} variant="light" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className={navLinkClass}>Cómo funciona</a>
            <a href="#features"     className={navLinkClass}>Funciones</a>
            <a href="#who-applies"  className={navLinkClass}>AI Act</a>
            <Link href="/pricing"   className={navLinkClass}>Precios</Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-light text-[#8B9BB4] hover:text-[#0B1C3D] transition-colors px-3 py-2"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-[500] bg-[#0B1C3D] text-[#E8FF47] rounded-[7px] px-[22px] py-[10px] hover:bg-[#122850] transition-colors"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#E3DFD5] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#0B1C3D]" />
            ) : (
              <Menu className="h-6 w-6 text-[#0B1C3D]" />
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
              className="md:hidden border-t border-[#E3DFD5] bg-[#FAFAF8]/95 backdrop-blur-xl"
            >
              <nav className="flex flex-col py-4 space-y-1">
                {[
                  { href: '#how-it-works', label: 'Cómo funciona' },
                  { href: '#features',     label: 'Funciones' },
                  { href: '#who-applies',  label: 'AI Act' },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="mx-4 px-4 py-4 text-base font-light text-[#8B9BB4] hover:text-[#0B1C3D] hover:bg-[#E3DFD5] rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <Link
                  href="/pricing"
                  className="mx-4 px-4 py-4 text-base font-light text-[#8B9BB4] hover:text-[#0B1C3D] hover:bg-[#E3DFD5] rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Precios
                </Link>
                <div className="border-t border-[#E3DFD5] pt-4 mt-2 px-4 space-y-3">
                  <Link
                    href="/login"
                    className="block w-full text-center min-h-[52px] flex items-center justify-center text-base font-light text-[#8B9BB4] border border-[#E3DFD5] rounded-[7px] hover:bg-[#E3DFD5] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center min-h-[52px] flex items-center justify-center text-base font-[500] bg-[#0B1C3D] text-[#E8FF47] rounded-[7px] hover:bg-[#122850] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
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
