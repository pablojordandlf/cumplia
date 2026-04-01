'use client';

import { useState, type FormEvent } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Metadata cannot be exported from a 'use client' file in Next.js 13+.
// The metadata for this page is defined in the sibling layout or via generateMetadata.
// See /checklist-ai-act/layout.tsx for the metadata export.

const COPY = {
  headline: '¿Tu empresa cumple el AI Act?',
  subheadline:
    'Descarga el checklist gratuito: 20 preguntas para saberlo en 5 minutos.',
  cta: 'Descargar checklist gratuito',
  successMessage:
    'Te lo enviamos ahora mismo. Revisa tu bandeja de entrada.',
  errorMessage:
    'Ha habido un error al enviar tu solicitud. Por favor, inténtalo de nuevo.',
};

const SECTORS = [
  'Finanzas',
  'Salud',
  'RRHH',
  'Seguros',
  'Tecnología',
  'Retail',
  'Administración pública',
  'Otro',
] as const;

type Sector = (typeof SECTORS)[number];

export default function ChecklistAIActPage() {
  const [email, setEmail] = useState('');
  const [sector, setSector] = useState<Sector | ''>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !sector) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sector }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Request failed');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : COPY.errorMessage);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFB] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#7a8a92] hover:text-[#2D3E4E] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl border border-[#E8ECEB] shadow-sm p-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#E09E50]/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-[#E09E50]" />
            </div>
            <span className="font-bold text-[#2D3E4E] text-sm">CumplIA</span>
          </div>

          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-base font-semibold text-[#2D3E4E]">{COPY.successMessage}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#2D3E4E] mb-2">{COPY.headline}</h1>
              <p className="text-sm text-[#7a8a92] mb-6 leading-relaxed">{COPY.subheadline}</p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-[#2D3E4E] mb-1">
                    Email corporativo
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#E8ECEB] bg-[#F8FAFB] px-3 py-2.5 text-sm text-[#2D3E4E] placeholder:text-[#7a8a92] focus:outline-none focus:ring-2 focus:ring-[#E09E50]/40 focus:border-[#E09E50]"
                  />
                </div>

                <div>
                  <label htmlFor="sector" className="block text-xs font-medium text-[#2D3E4E] mb-1">
                    Sector
                  </label>
                  <select
                    id="sector"
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value as Sector)}
                    className="w-full rounded-lg border border-[#E8ECEB] bg-[#F8FAFB] px-3 py-2.5 text-sm text-[#2D3E4E] focus:outline-none focus:ring-2 focus:ring-[#E09E50]/40 focus:border-[#E09E50]"
                  >
                    <option value="" disabled>Selecciona tu sector</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-600">{errorMsg || COPY.errorMessage}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#E09E50] hover:bg-[#D9885F] text-white py-3 h-auto text-sm font-semibold min-h-[48px] transition-colors"
                >
                  {status === 'loading' ? 'Enviando…' : COPY.cta}
                </Button>
              </form>

              <p className="text-xs text-[#7a8a92] mt-4 text-center">
                Sin tarjeta · Datos alojados en España · Conforme al RGPD
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
