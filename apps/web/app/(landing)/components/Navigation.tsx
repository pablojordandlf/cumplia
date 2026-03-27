'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full h-16 bg-black border-b border-neutral-800 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-md group-hover:scale-105 transition-transform duration-200" />
          <span className="font-bold text-lg text-white">
            Cumplia
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">
            Features
          </Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-200">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors duration-200">
            Testimonios
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">
            Docs
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="px-6 py-2 text-gray-400 hover:text-white transition-colors duration-200">
            Log in
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 shadow-lg hover:shadow-xl font-semibold">
            Comienza Gratis
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-b border-neutral-800">
          <div className="px-6 py-4 space-y-3">
            <a href="#features" className="block text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="block text-gray-400 hover:text-white transition-colors">
              Testimonios
            </a>
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold">
              Comienza Gratis
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
