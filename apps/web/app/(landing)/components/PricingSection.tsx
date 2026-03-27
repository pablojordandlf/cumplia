'use client'

import { CheckCircle2 } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$99',
    period: 'mes',
    description: 'Para startups que comienzan su viaje de compliance',
    features: [
      'Análisis de hasta 5 sistemas de IA',
      'Reportes de compliance automáticos',
      'Soporte por email',
      'Dashboard básico',
      'Alertas de cambios regulatorios',
    ],
    cta: 'Comienza Gratis',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$599',
    period: 'mes',
    description: 'Para empresas que escalan su compliance',
    features: [
      'Análisis ilimitado de sistemas',
      'Reportes avanzados con trazabilidad',
      'Soporte prioritario',
      'Dashboard completo + API',
      'Alertas en tiempo real',
      'Auditorías programadas',
      'Integraciones empresariales',
    ],
    cta: 'Contáctanos',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Para organizaciones con requisitos especiales',
    features: [
      'Todo en Professional',
      'SLA garantizado 99.9%',
      'Account manager dedicado',
      'Implementación personalizada',
      'Entrenamiento de equipo',
      'Auditorías continuas',
      'Soporte 24/7',
    ],
    cta: 'Hablemos',
    highlighted: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Precios Simples y Transparentes
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Sin sorpresas, sin complejidad. Solo lo que necesitas.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600/20 to-blue-900/10 border-2 border-blue-500 scale-105 shadow-2xl'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="p-8">
                
                {/* Badge */}
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full mb-4">
                    Recomendado
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  )}
                </div>

                {/* CTA */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mb-8 ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Preguntas Frecuentes
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-white mb-2">¿Puedo cambiar de plan?</h4>
              <p className="text-gray-400">Sí, puedes cambiar o cancelar en cualquier momento, sin penalizaciones.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">¿Hay periodo de prueba?</h4>
              <p className="text-gray-400">14 días gratis con acceso completo. No se requiere tarjeta de crédito.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
