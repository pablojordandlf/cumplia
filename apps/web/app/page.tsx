'use client';

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

function WhoAppliesSection() {
  return (
    <section id="who-applies" className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿A quién aplica el AI Act?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            El Reglamento de IA de la UE establece obligaciones según el nivel de riesgo de tu sistema
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: AlertTriangle,
              title: 'Riesgo Inaceptable',
              color: 'text-red-600 bg-red-50 dark:bg-red-950',
              desc: 'Sistemas prohibidos como manipulación subliminal o puntuación social.',
              examples: 'Sistemas de vigilancia masiva, manipulación conductual'
            },
            {
              icon: Shield,
              title: 'Alto Riesgo',
              color: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
              desc: 'Sistemas críticos que requieren cumplimiento estricto y evaluación de riesgos.',
              examples: 'Salud, educación, empleo, seguridad, justicia'
            },
            {
              icon: CheckCircle,
              title: 'Riesgo Limitado',
              color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
              desc: 'Sistemas con transparencia obligatoria pero menos requisitos.',
              examples: 'Chatbots, generación de contenido (deepfakes)'
            },
            {
              icon: Star,
              title: 'Riesgo Mínimo',
              color: 'text-green-600 bg-green-50 dark:bg-green-950',
              desc: 'Sistemas de bajo riesgo con cumplimiento voluntario recomendado.',
              examples: 'Spam filters, recomendaciones básicas'
            }
          ].map((item, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Ejemplos:</strong> {item.examples}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainPointsSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            El cumplimiento no debería ser un dolor de cabeza
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Muchas empresas luchan con el AI Act. Estos son los problemas más comunes:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: AlertCircle,
              title: 'Incertidumbre Legal',
              desc: 'El reglamento es complejo y las sanciones pueden llegar al 7% de facturación global.'
            },
            {
              icon: TrendingDown,
              title: 'Pérdida de Tiempo',
              desc: 'Evaluar manualmente cada sistema de IA consume semanas de trabajo de expertos.'
            },
            {
              icon: FileText,
              title: 'Documentación Excesiva',
              desc: 'Se requieren decenas de documentos técnicos y de cumplimiento diferentes.'
            }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Todo lo que necesitas para cumplir
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            CumplIA te guía paso a paso en todo el proceso de cumplimiento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Bot,
              title: 'Evaluación de Riesgos',
              desc: 'Clasifica automáticamente tus sistemas de IA según el nivel de riesgo del AI Act.'
            },
            {
              icon: FileText,
              title: 'FRIA Automatizada',
              desc: 'Genera Evaluaciones de Impacto en Riesgos de IA adaptadas a cada sistema.'
            },
            {
              icon: Shield,
              title: 'Registro de Cumplimiento',
              desc: 'Mantén un registro actualizado de todas tus obligaciones y evidencias.'
            },
            {
              icon: BookOpen,
              title: 'Biblioteca de Plantillas',
              desc: 'Accede a plantillas predefinidas de documentación requerida por el AI Act.'
            },
            {
              icon: Zap,
              title: 'Alertas Inteligentes',
              desc: 'Recibe notificaciones sobre cambios en la regulación y fechas importantes.'
            },
            {
              icon: Globe,
              title: 'Multi-idioma',
              desc: 'Plataforma disponible en español, inglés y otros idiomas de la UE.'
            }
          ].map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Planes para Empresas
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Precios transparentes basados en el número de sistemas de IA que gestionas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '0€',
              period: '/mes',
              description: 'Para empresas que quieren evaluar un único sistema',
              features: [
                '1 sistema de IA',
                'Clasificación de riesgo',
                'Guía básica de cumplimiento',
                'Soporte por email'
              ],
              cta: 'Empezar Gratis',
              href: '/register',
              highlight: false
            },
            {
              name: 'Professional',
              price: '49€',
              period: '/mes',
              description: 'Para equipos con varios sistemas de IA',
              features: [
                '15 sistemas de IA',
                '3 usuarios',
                'FRIA automatizada',
                'Gestión de riesgos',
                'Registro de evidencias',
                'Exportación de documentos',
                'Soporte prioritario'
              ],
              cta: 'Prueba Gratis',
              href: '/register?plan=professional',
              highlight: true
            },
            {
              name: 'Business',
              price: '299€',
              period: '/mes',
              description: 'Para organizaciones con múltiples departamentos',
              features: [
                'Sistemas de IA ilimitados',
                '10 usuarios',
                'Asistente de IA',
                'Gestión avanzada de riesgos',
                'Plantillas personalizadas',
                'Múltiples departamentos',
                'Soporte dedicado'
              ],
              cta: 'Contactar Ventas',
              href: '/contact?plan=business',
              highlight: false
            }
          ].map((plan, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg ${plan.highlight ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block mt-8">
                  <Button 
                    className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <WhoAppliesSection />
      <PainPointsSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
