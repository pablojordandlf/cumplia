import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Download,
  ArrowRight,
  FileText,
  Shield,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { Header } from '@/components/landing-header';

export const metadata = {
  title: 'Checklist de Cumplimiento AI Act | Descargable Gratis',
  description: 'Checklist completo y descargable para evaluar el cumplimiento del AI Act en tu empresa. Verifica que cumples con todos los requisitos del Reglamento de Inteligencia Artificial de la UE.',
  keywords: 'checklist AI Act, cumplimiento AI Act PDF, lista verificación AI Act, requisitos AI Act, guía cumplimiento IA',
};

// JSON-LD Schema
function ArticleSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Checklist de Cumplimiento AI Act',
    description: 'Checklist completo para evaluar el cumplimiento del AI Act en tu empresa.',
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
      '@id': 'https://cumplia.com/recursos/checklist-ai-act',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const checklistItems = [
  {
    category: 'Identificación y Clasificación',
    icon: Shield,
    items: [
      'He identificado todos los sistemas de IA utilizados en mi organización',
      'He clasificado cada sistema según el nivel de riesgo del AI Act (prohibido, alto, limitado, mínimo)',
      'He verificado que ninguno de mis sistemas está en la lista de prácticas prohibidas',
      'He documentado la justificación de la clasificación de cada sistema',
    ],
  },
  {
    category: 'Sistemas de Alto Riesgo',
    icon: AlertTriangle,
    items: [
      'He realizado la evaluación de conformidad para sistemas de alto riesgo',
      'He establecido un sistema de gestión de riesgos documentado',
      'He asegurado la calidad de los datos de entrenamiento y validación',
      'He implementado medidas de supervisión humana efectiva',
      'He preparado la documentación técnica requerida',
      'He registrado el sistema en la base de datos de la UE (cuando esté disponible)',
      'He establecido sistemas de registro y trazabilidad (logs)',
      'He garantizado la transparencia y provisión de información a usuarios',
      'He implementado mecanismos de corrección y mejora continua',
      'He asegurado la robustez, precisión y ciberseguridad del sistema',
    ],
  },
  {
    category: 'Sistemas de Riesgo Limitado',
    icon: FileText,
    items: [
      'He informado a los usuarios que están interactuando con un sistema de IA',
      'He etiquetado adecuadamente el contenido generado por IA (deepfakes)',
      'He obtenido consentimiento para el procesamiento de datos biométricos cuando sea necesario',
    ],
  },
  {
    category: 'Modelos de IA General (GPAI)',
    icon: BookOpen,
    items: [
      'He evaluado si mis modelos cumplen con la definición de modelo de IA general',
      'He preparado la documentación técnica para modelos GPAI',
      'He implementado políticas de respeto a derechos de autor en datos de entrenamiento',
      'He establecido medidas de mitigación de riesgos sistémicos (para modelos de alto impacto)',
    ],
  },
  {
    category: 'Gobernanza y Procesos',
    icon: CheckCircle,
    items: [
      'He designado una persona o equipo responsable del cumplimiento del AI Act',
      'He establecido procedimientos de vigilancia post-comercialización',
      'He creado un plan de respuesta ante incidentes graves',
      'He formado al personal involucrado en el uso de sistemas de IA',
      'He revisado contratos con proveedores y usuarios de IA',
      'He establecido procesos de auditoría periódica',
    ],
  },
];

export default function ChecklistPage() {
  return (
    <>
      <ArticleSchema />
      <main className="min-h-screen">
        <Header />
        
        {/* Hero */}
        <section className="bg-gradient-to-b from-green-50 to-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <nav className="mb-6">
                <ol className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <li><Link href="/" className="hover:text-blue-600">Inicio</Link></li>
                  <li>/</li>
                  <li><Link href="/recursos" className="hover:text-blue-600">Recursos</Link></li>
                  <li>/</li>
                  <li className="text-gray-900">Checklist AI Act</li>
                </ol>
              </nav>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Checklist de Cumplimiento
                <span className="block text-green-600 mt-2 text-2xl sm:text-3xl">
                  AI Act 2024
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Lista de verificación completa para evaluar si tu empresa cumple con todos los 
                requisitos del Reglamento de Inteligencia Artificial de la UE.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8">
                    Usar Checklist Digital
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/guia-ai-act">
                  <Button size="lg" variant="outline" className="px-8">
                    Ver Guía Completa
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist Content */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              <div className="space-y-8">
                {checklistItems.map((section, idx) => (
                  <Card key={idx} className="border-gray-200">
                    <CardHeader className="bg-gray-50">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-6 w-6 text-green-600" />
                        <CardTitle className="text-xl">{section.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <input 
                              type="checkbox" 
                              className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-12 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  Puntuación y próximos pasos
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>✓ <strong>25-30 puntos:</strong> Cumplimiento avanzado. Mantén el monitoreo continuo.</li>
                  <li>⚠ <strong>15-24 puntos:</strong> Cumplimiento parcial. Prioriza las acciones pendientes.</li>
                  <li>✗ <strong>Menos de 15:</strong> Riesgo alto. Inicia tu plan de cumplimiento inmediatamente.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Automatiza tu cumplimiento del AI Act
              </h2>
              <p className="text-gray-400 mb-8">
                CumplIA te guía paso a paso en todo el proceso con herramientas automatizadas, 
                documentación generada y monitoreo continuo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8">
                    Comenzar Gratis
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8">
                    Ver Planes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
