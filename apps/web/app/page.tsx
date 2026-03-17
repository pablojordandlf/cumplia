import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Zap, 
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Users,
  ArrowRight,
  Building2,
  Globe,
  Scale,
  Bot,
  Cpu,
  Sparkles,
  Star
} from 'lucide-react';
import { Header } from '@/components/landing-header';
import { Footer } from '@/components/landing-footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const metadata = {
  title: 'CumplIA - Cumplimiento del AI Act para Empresas',
  description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act). Evaluación de riesgos, documentación y gestión de sistemas de IA.',
  keywords: 'AI Act, cumplimiento IA, regulación inteligencia artificial, IA responsable, GDPR, sistemas de IA',
};

'use client';

function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const rotatingWords = [
    "cumplimiento",
    "transparencia",
    "seguridad",
    "confianza",
    "prosperidad"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-12 sm:py-20 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-100/50 to-transparent dark:from-blue-900/10 rounded-full blur-2xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span>Compliance del AI Act simplificado</span>
          </motion.div>

          {/* Main headline with rotating words */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6"
          >
            CumplIA impulsa tu{' '}
            <span className="relative inline-block min-w-[280px] sm:min-w-[340px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute left-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {rotatingWords[currentWord]}
                </motion.span>
              </AnimatePresence>
              <span className="invisible">{rotatingWords[0]}</span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto"
          >
            Gestiona tus Sistemas de IA sin Complicaciones
          </motion.p>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            La inteligencia artificial avanza a pasos agigantados. Asegúrate de que tu empresa 
            no solo cumpla con el reglamento más importante de IA de Europa, sino que prospere en él.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 mb-12"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-8 py-6 w-full sm:w-auto shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-shadow">
                Empezar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-8 py-6 w-full sm:w-auto border-2">
                Ver precios
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Setup en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancela cuando quieras</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">500+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Sistemas evaluados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">98%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasa de éxito</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">24h</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tiempo medio</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">24h</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tiempo medio</div>
            </div>
          </motion.div
          </p>
        </div>
      </div>
    </section>
  );
}

function WhoAppliesSection() {