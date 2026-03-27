'use client'

import { CheckCircle2, Zap, Shield, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Análisis de Riesgos IA',
    description: 'Identifica automáticamente riesgos de cumplimiento en sistemas de IA Act.',
  },
  {
    icon: Shield,
    title: 'Compliance Automático',
    description: 'Documentación y reportes de cumplimiento generados en minutos, no semanas.',
  },
  {
    icon: TrendingUp,
    title: 'Monitoreo Continuo',
    description: 'Alertas en tiempo real sobre cambios regulatorios y nuevos riesgos.',
  },
  {
    icon: CheckCircle2,
    title: 'Auditorías Transparentes',
    description: 'Pruebas de cumplimiento con trazabilidad completa para reguladores.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Potencia tu Compliance
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Herramientas diseñadas para equipos que entienden que el cumplimiento es estrategia, no un obstáculo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div 
                key={idx}
                className="group p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <Icon className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
          <div className="text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">50+</div>
            <p className="text-gray-400">Regulaciones Cubiertas</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">10K+</div>
            <p className="text-gray-400">Sistemas Auditados</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">99.9%</div>
            <p className="text-gray-400">Uptime Garantizado</p>
          </div>
        </div>
      </div>
    </section>
  )
}
