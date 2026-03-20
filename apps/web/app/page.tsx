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
  Star,
  Lock,
  Search,
  ClipboardCheck,
  Bell,
  Languages,
  ChevronRight,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Header } from '@/components/landing-header';
import { Footer } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const rotatingWords = [
    "CUMPLIMIENTO",
    "TRANSPARENCIA", 
    "SEGURIDAD",
    "CONFIANZA",
    "PROSPERIDAD"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-blue-900/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Compliance del AI Act simplificado</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-8"
          >
            <span className="block">GESTIÓN DE IA.</span>
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                {rotatingWords[currentWord]}
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-slate-400 mb-6 max-w-2xl"
          >
            Gestiona tus Sistemas de IA sin Complicaciones
          </motion.p>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-slate-500 mb-10 max-w-2xl"
          >
            La inteligencia artificial avanza a pasos agigantados. Asegúrate de que tu empresa 
            no solo cumpla con el reglamento más importante de IA de Europa, sino que prospere en él.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-7 w-full sm:w-auto shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all">
                Empezar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Ver precios
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-8 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Setup en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Cancela cuando quieras</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrustedBySection() {
  const stats = [
    { icon: Building2, value: "500+", label: "Sistemas evaluados" },
    { icon: TrendingUp, value: "98%", label: "Tasa de éxito" },
    { icon: Clock, value: "24h", label: "Tiempo medio" },
    { icon: Users, value: "100+", label: "Empresas activas" }
  ];

  return (
    <section className="py-20 bg-slate-950 border-y border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Trusted by Global Enterprises</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Built for What&apos;s Next.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <stat.icon className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EndToEndSection() {
  const capabilities = [
    {
      icon: Search,
      title: "Discover",
      desc: "Visibilidad completa de todos los modelos de IA en tu empresa"
    },
    {
      icon: ClipboardCheck,
      title: "Inventory",
      desc: "Inventario centralizado de sistemas de IA con metadatos"
    },
    {
      icon: Shield,
      title: "Assess",
      desc: "Evaluación automática de riesgos según el AI Act"
    },
    {
      icon: FileText,
      title: "Document",
      desc: "Generación automática de FRIA y documentación"
    },
    {
      icon: Lock,
      title: "Secure",
      desc: "Controles de seguridad y gobernanza integrados"
    },
    {
      icon: Bell,
      title: "Monitor",
      desc: "Alertas en tiempo real sobre cambios regulatorios"
    }
  ];

  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-blue-500 text-sm uppercase tracking-wider mb-4">End-to-End AI Governance</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Gobierno de IA de extremo a extremo
          </h2>
          <p className="text-lg text-slate-400">
            Una plataforma integral diseñada para la velocidad, complejidad y escala de los ecosistemas empresariales de IA
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {capabilities.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <item.icon className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoAppliesSection() {
  const riskLevels = [
    {
      icon: AlertTriangle,
      title: 'Riesgo Inaceptable',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      desc: 'Sistemas prohibidos como manipulación subliminal o puntuación social.',
      examples: 'Sistemas de vigilancia masiva, manipulación conductual'
    },
    {
      icon: Shield,
      title: 'Alto Riesgo',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      desc: 'Sistemas críticos que requieren cumplimiento estricto y evaluación de riesgos.',
      examples: 'Salud, educación, empleo, seguridad, justicia'
    },
    {
      icon: CheckCircle,
      title: 'Riesgo Limitado',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      desc: 'Sistemas con transparencia obligatoria pero menos requisitos.',
      examples: 'Chatbots, generación de contenido (deepfakes)'
    },
    {
      icon: Star,
      title: 'Riesgo Mínimo',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      desc: 'Sistemas de bajo riesgo con cumplimiento voluntario recomendado.',
      examples: 'Spam filters, recomendaciones básicas'
    }
  ];

  return (
    <section id="who-applies" className="py-24 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-blue-500 text-sm uppercase tracking-wider mb-4">Compliance Framework</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            ¿A quién aplica el AI Act?
          </h2>
          <p className="text-lg text-slate-400">
            El Reglamento de IA de la UE establece obligaciones según el nivel de riesgo de tu sistema
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {riskLevels.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-6 rounded-2xl bg-slate-950 ${item.borderColor} border hover:border-opacity-50 transition-all`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{item.desc}</p>
              <p className="text-xs text-slate-500">
                <strong className="text-slate-400">Ejemplos:</strong> {item.examples}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainPointsSection() {
  const pains = [
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
  ];

  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-red-500 text-sm uppercase tracking-wider mb-4">The Challenge</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            El cumplimiento no debería ser un dolor de cabeza
          </h2>
          <p className="text-lg text-slate-400">
            Muchas empresas luchan con el AI Act. Estos son los problemas más comunes:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pains.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {item.title}
              </h3>
              <p className="text-slate-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
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
  ];

  return (
    <section id="features" className="py-24 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-blue-500 text-sm uppercase tracking-wider mb-4">Platform Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Todo lo que necesitas para cumplir
          </h2>
          <p className="text-lg text-slate-400">
            CumplIA te guía paso a paso en todo el proceso de cumplimiento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
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
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-blue-500 text-sm uppercase tracking-wider mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Planes para Empresas
          </h2>
          <p className="text-lg text-slate-400">
            Precios transparentes basados en el número de sistemas de IA que gestionas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 ${
                plan.highlight 
                  ? 'bg-gradient-to-b from-blue-600/20 to-slate-900 border-2 border-blue-500/50' 
                  : 'bg-slate-900 border border-slate-800'
              }`}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button 
                  className={`w-full py-6 text-lg ${
                    plan.highlight 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      <HeroSection />
      <TrustedBySection />
      <EndToEndSection />
      <WhoAppliesSection />
      <PainPointsSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
