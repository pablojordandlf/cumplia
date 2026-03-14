import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  ArrowLeft,
  BookOpen,
  Calendar,
  User
} from 'lucide-react';
import { Header } from '@/components/landing-header';

export const metadata = {
  title: '¿Qué es el AI Act? Guía Completa para Empresas 2024',
  description: 'Descubre qué es el AI Act, quién debe cumplirlo y cómo afecta a tu empresa. Guía introductoria completa al Reglamento de Inteligencia Artificial de la Unión Europea.',
  keywords: 'qué es AI Act, Reglamento IA UE, AI Act explicado, cumplimiento IA empresas, inteligencia artificial regulación Europa',
};

// JSON-LD Schema
function ArticleSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '¿Qué es el AI Act? Guía Completa para Empresas',
    description: 'Descubre qué es el AI Act, quién debe cumplirlo y cómo afecta a tu empresa.',
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
      '@id': 'https://cumplia.com/blog/que-es-ai-act',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogQueEsAIActPage() {
  return (
    <>
      <ArticleSchema />
      <main className="min-h-screen">
        <Header />
        
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li><Link href="/" className="hover:text-blue-600">Inicio</Link></li>
                  <li>/</li>
                  <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
                  <li>/</li>
                  <li className="text-gray-900">Qué es el AI Act</li>
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
                ¿Qué es el AI Act?
                <span className="block text-blue-600 mt-2 text-2xl sm:text-3xl">
                  Guía Completa para Empresas
                </span>
              </h1>

              <p className="text-lg text-gray-600">
                El Reglamento de Inteligencia Artificial de la UE, conocido como AI Act, está 
                transformando la forma en que las empresas desarrollan y utilizan sistemas de IA. 
                En esta guía te explicamos todo lo que necesitas saber.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-lg max-w-none">
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Definición del AI Act
              </h2>
              
              <p className="text-gray-600 mb-6">
                El <strong>AI Act (Reglamento (UE) 2024/1689)</strong> es la primera normativa 
                integral del mundo dedicada específicamente a regular la inteligencia artificial. 
                Aprobado por el Parlamento Europeo y el Consejo de la UE en 2024, establece un 
                marco jurídico vinculante que busca garantizar que los sistemas de IA utilizados 
                en Europa sean seguros, respetuosos con los derechos fundamentales y dignos de 
                confianza.
              </p>

              <p className="text-gray-600 mb-6">
                Esta regulación representa un hito histórico en la gobernanza tecnológica global, 
                posicionando a la Unión Europea como pionera en la creación de un marco ético y 
                legal para la IA, similar al rol que desempeñó con el GDPR en materia de protección 
                de datos.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                Objetivos principales del Reglamento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Seguridad</h3>
                    <p className="text-sm text-gray-600">
                      Garantizar que los sistemas de IA no representen riesgos para la salud, 
                      seguridad o derechos fundamentales de las personas.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Derechos fundamentales</h3>
                    <p className="text-sm text-gray-600">
                      Proteger la privacidad, la no discriminación, la libertad de expresión 
                      y otros derechos fundamentales de los ciudadanos europeos.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Mercado único</h3>
                    <p className="text-sm text-gray-600">
                      Establecer normas armonizadas para facilitar la circulación de sistemas 
                      de IA conformes en todo el territorio de la UE.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Innovación responsable</h3>
                    <p className="text-sm text-gray-600">
                      Fomentar el desarrollo de IA ética y transparente sin obstaculizar 
                      la innovación tecnológica legítima.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                ¿Quién debe cumplir con el AI Act?
              </h2>

              <p className="text-gray-600 mb-4">
                El <strong>alcance del AI Act</strong> es amplio y abarca a múltiples actores 
                dentro del ecosistema de inteligencia artificial:
              </p>

              <ul className="list-disc pl-6 space-y-3 text-gray-600 mb-6">
                <li>
                  <strong>Proveedores de IA:</strong> Empresas que desarrollan sistemas de 
                  inteligencia artificial para su comercialización o uso en la UE, 
                  independientemente de su ubicación geográfica.
                </li>
                <li>
                  <strong>Usuarios de IA:</strong> Organizaciones que implementan sistemas de 
                  IA en sus operaciones, productos o servicios dentro del territorio europeo.
                </li>
                <li>
                  <strong>Distribuidores e importadores:</strong> Entidades que facilitan la 
                  comercialización de sistemas de IA en la Unión Europea.
                </li>
                <li>
                  <strong>Responsables de despliegue:</strong> Organizaciones que utilizan 
                  sistemas de IA propiedad de terceros en contextos institucionales o empresariales.
                </li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
                <p className="text-gray-700">
                  <strong>Importante:</strong> El AI Act tiene efecto extraterritorial. 
                  Empresas fuera de Europa que ofrezcan sistemas de IA que afecten a personas 
                  en la UE deben cumplir con esta regulación, similar al alcance del GDPR.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                Clasificación de sistemas de IA
              </h2>

              <p className="text-gray-600 mb-4">
                El AI Act adopta un enfoque basado en el riesgo, clasificando los sistemas de 
                IA en cuatro categorías principales:
              </p>

              <div className="space-y-4 my-6">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">🚫 Sistemas prohibidos</h3>
                  <p className="text-gray-700 text-sm">
                    Prácticas consideradas inaceptables, como la manipulación cognitiva subliminal, 
                    la puntuación social masiva por parte de gobiernos y la identificación 
                    biométrica remota en espacios públicos.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">⚠️ Sistemas de alto riesgo</h3>
                  <p className="text-gray-700 text-sm">
                    Sistemas utilizados en infraestructuras críticas, educación, empleo, 
                    servicios esenciales o justicia. Requieren evaluación de conformidad previa 
                    y cumplimiento estricto de requisitos.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚡ Sistemas de riesgo limitado</h3>
                  <p className="text-gray-700 text-sm">
                    Chatbots, sistemas de generación de contenido y reconocimiento de emociones. 
                    Deben cumplir con requisitos de transparencia específicos.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Sistemas de riesgo mínimo</h3>
                  <p className="text-gray-700 text-sm">
                    Filtros de spam, videojuegos con IA y sistemas de recomendación básicos. 
                    No tienen obligaciones específicas más allá de códigos de conducta voluntarios.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                ¿Por qué el AI Act es importante para tu empresa?
              </h2>

              <p className="text-gray-600 mb-4">
                El cumplimiento del AI Act no es opcional: las sanciones por incumplimiento 
                pueden alcanzar los <strong>35 millones de euros o el 7% de la facturación 
                global anual</strong>, el valor más alto de ambos.
              </p>

              <p className="text-gray-600 mb-6">
                Pero más allá de las multas, el AI Act representa una oportunidad para:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                <li>Demostrar compromiso con la IA ética y responsable</li>
                <li>Generar confianza entre clientes, inversores y partners</li>
                <li>Diferenciarse competitivamente en un mercado cada vez más regulado</li>
                <li>Prepararse para futuras regulaciones en otras jurisdicciones</li>
                <li>Mitigar riesgos legales y reputacionales</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                Próximos pasos
              </h2>

              <p className="text-gray-600 mb-6">
                Si tu empresa desarrolla o utiliza sistemas de IA, es crucial comenzar a preparar 
                tu estrategia de cumplimiento cuanto antes. El calendario de aplicación del AI Act 
                es progresivo, pero los plazos se acercan rápidamente.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg my-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Recursos adicionales
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/guia-ai-act" className="text-blue-600 hover:underline">
                      → Guía completa del AI Act
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/sanciones-ai-act" className="text-blue-600 hover:underline">
                      → Sanciones del AI Act: cuánto puedes pagar
                    </Link>
                  </li>
                  <li>
                    <Link href="/recursos/checklist-ai-act" className="text-blue-600 hover:underline">
                      → Checklist de cumplimiento AI Act
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

            {/* CTA */}
            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t">
              <div className="bg-blue-600 rounded-xl p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  ¿Necesitas ayuda con el cumplimiento del AI Act?
                </h3>
                <p className="text-blue-100 mb-6">
                  CumplIA te guía paso a paso en todo el proceso de cumplimiento del Reglamento 
                  de Inteligencia Artificial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6">
                      Comenzar Gratis
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="border-white text-white hover:bg-blue-700 px-6">
                      Ver Planes
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to blog */}
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
