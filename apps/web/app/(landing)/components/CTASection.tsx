'use client'

import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-20 md:py-32 px-6 bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-black">
      <div className="max-w-4xl mx-auto text-center">
        
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          ¿Listo para transformar tu compliance?
        </h2>

        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Únete a empresas que ya están usando Cumplia para hacer el compliance más simple, más rápido y más humano.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-xl font-bold text-lg flex items-center gap-2">
            Comienza tu Prueba Gratis
            <ArrowRight size={22} />
          </button>
          <button className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 font-bold text-lg">
            Agenda una Demo
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Acceso completo durante 14 días. Sin tarjeta de crédito requerida.
        </p>
      </div>
    </section>
  )
}
