import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Scale,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
  TrendingUp,
  Ban
} from 'lucide-react';
import { Header } from '@/components/landing-header';

export const metadata: Metadata = {
  title: 'Sanciones del AI Act: Cuánto Puedes Pagar por Incumplir',
  description: 'Análisis completo de las sanciones y multas del AI Act. Descubre cuánto puede costar el incumplimiento del Reglamento de Inteligencia Artificial de la UE y cómo evitarlas.',
  keywords: [
    'sanciones AI Act',
    'multas AI Act',
    'penalizaciones reglamento IA',
    'coste incumplimiento AI Act',
    'multas inteligencia artificial UE',
  ],
  alternates: {
    canonical: 'https://cumplia.com/blog/sanciones-ai-act',
  },
  openGraph: {
    title: 'Sanciones del AI Act: Cuánto Puedes Pagar por Incumplir',
    description: 'Análisis completo de las sanciones y multas del AI Act. Descubre cuánto puede costar el incumplimiento del Reglamento de Inteligencia Artificial de la UE.',
    url: 'https://cumplia.com/blog/sanciones-ai-act',
    type: 'article',
  },
};

// JSON-LD Schema
function ArticleSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Sanciones del AI Act: Cuánto Puedes Pagar por Incumplir',
    description: 'Análisis completo de las sanciones y multas del AI Act europeo.',
    author: {
      '@type': 'Organization',
      name: 'CumplIA',
      url: 'https://cumplia.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CumplIA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cumplia.com/logo.png',
      },
    },
    datePublished: '2024-03-14',
    dateModified: '2024-03-14',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://cumplia.com/blog/sanciones-ai-act',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogSancionesAIActPage() {
  return (
    <>
      <ArticleSchema />
      <main className="min-h-screen">
        <Header />
        
        {/* Hero */}
        <section className="bg-gradient-to-b from-red-50 to-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <nav className="mb-6">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li><Link href="/" className="hover:text-blue-600">Inicio</Link></li>
                  <li>/</li>
                  <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
                  <li>/</li>
                  <li className="text-gray-900">Sanciones AI Act</li>
                </ol>
              </nav>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  14 de marzo, 2024
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Equipo CumplIA
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Sanciones del AI Act
                <span className="block text-red-600 mt-2 text-2xl sm:text-3xl">
                  Cuánto Puedes Pagar por Incumplir
                </span>
              </h1>

              <p className="text-lg text-gray-600">
                El incumplimiento del Reglamento de Inteligencia Artificial de la UE puede 
                resultar en sanciones económicas severas. Conoce las multas, cómo se calculan 
                y cómo proteger a tu empresa.
              </p>
            </div>
          </div>
        </section>

        <article className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Escala de sanciones del AI Act
              </h2>
              
              <div className="grid gap-4 my-6">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Ban className="h-6 w-6 text-red-600" />
                      <h3 className="font-semibold text-red-900">Sistemas prohibidos</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-700 mb-1">35 millones €</p>
                    <p className="text-sm text-gray-700">o el 7% de facturación global anual</p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-900">Obligaciones incumplidas</h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-700 mb-1">15 millones €</p>
                    <p className="text-sm text-gray-700">o el 3% de facturación global anual</p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Scale className="h-6 w-6 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-900">Información incorrecta</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700 mb-1">7.5 millones €</p>
                    <p className="text-sm text-gray-700">o el 1.5% de facturación global anual</p>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                ¿Cómo evitar las sanciones?
              </h2>

              <ul className="list-disc pl-6 space-y-3 text-gray-600 mb-6">
                <li>Realiza una auditoría de tus sistemas de IA existentes</li>
                <li>Clasifica cada sistema según su nivel de riesgo</li>
                <li>Implementa las medidas de cumplimiento necesarias</li>
                <li>Mantén documentación técnica actualizada</li>
                <li>Establece procesos de supervisión humana</li>
                <li>Monitorea continuamente el cumplimiento</li>
              </ul>

              <div className="bg-blue-50 p-6 rounded-lg my-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Recursos adicionales
                </h3>
                <ul className="space-y-2">
                  <li><Link href="/guia-ai-act" className="text-blue-600 hover:underline">→ Guía completa del AI Act</Link></li>
                  <li><Link href="/recursos/checklist-ai-act" className="text-blue-600 hover:underline">→ Checklist de cumplimiento</Link></li>
                </ul>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mt-12">
              <div className="bg-red-600 rounded-xl p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  Protege tu empresa de sanciones millonarias
                </h3>
                <p className="text-red-100 mb-6">
                  CumplIA te ayuda a cumplir con el AI Act de forma sencilla y automatizada.
                </p>
                <Link href="/register">
                  <Button className="bg-white text-red-600 hover:bg-gray-100 px-8">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8">
              <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al blog
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
