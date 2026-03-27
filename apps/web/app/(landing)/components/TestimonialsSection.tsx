'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonials = [
  {
    quote: 'Cumplia redujo nuestro tiempo de cumplimiento de 3 meses a 2 semanas. Impresionante.',
    author: 'María García',
    role: 'Chief Compliance Officer',
    company: 'TechCorp',
    avatar: '🧑‍💼',
  },
  {
    quote: 'Finalmente, algo que los reguladores realmente entienden. No más documentación innecesaria.',
    author: 'Juan López',
    role: 'Founder & CEO',
    company: 'AI Startup',
    avatar: '👨‍💼',
  },
  {
    quote: 'La transparencia y claridad de Cumplia cambió cómo vemos el compliance en nuestra org.',
    author: 'Sofia Martínez',
    role: 'Head of Risk',
    company: 'Enterprise Solutions',
    avatar: '👩‍💼',
  },
]

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoplay])

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
    setAutoplay(false)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setAutoplay(false)
  }

  return (
    <section id="testimonials" className="py-20 md:py-32 px-6 bg-gradient-to-b from-black via-blue-950/10 to-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Confían en Cumplia
          </h2>
          <p className="text-gray-400">Escucha a equipos que están transformando su compliance</p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 min-h-80 flex flex-col justify-between">
            
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl text-white font-light mb-8 leading-relaxed">
              "{testimonials[current].quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                {testimonials[current].avatar}
              </div>
              <div>
                <div className="font-bold text-white">
                  {testimonials[current].author}
                </div>
                <div className="text-sm text-gray-400">
                  {testimonials[current].role} at {testimonials[current].company}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i)
                    setAutoplay(false)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? 'w-8 bg-blue-600' : 'w-2 bg-white/20'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={prev}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
