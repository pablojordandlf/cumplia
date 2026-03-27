'use client'

import { ArrowRight, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative w-full min-h-screen pt-16 overflow-hidden flex items-center justify-center">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-black to-black opacity-100" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-radial-gradient pointer-events-none" />
      </div>

      {/* Content */}
      <div className={`max-w-4xl mx-auto px-6 text-center transition-all duration-1000 transform ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 hover:bg-white/10 transition-colors">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Nuevo: Soporte para IA Act 2026</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
          Compliance
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            para Humanos
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          AI compliance que entiende lo que importa. No legalese, no complejidad innecesaria. Solo claridad.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2">
            Comienza Gratis
            <ArrowRight size={20} />
          </button>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 font-semibold flex items-center gap-2">
            <Play size={20} fill="currentColor" />
            Ver Demo
          </button>
        </div>

        {/* Trust Badge */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500">Confían en nosotros</p>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <span className="text-gray-600 font-semibold">Startup A</span>
            <span className="text-gray-600 font-semibold">Enterprise B</span>
            <span className="text-gray-600 font-semibold">Tech Co</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
