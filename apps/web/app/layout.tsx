import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/providers/toaster';

export const metadata: Metadata = {
  title: {
    default: 'CumplIA - Cumplimiento del AI Act para Empresas',
    template: '%s | CumplIA',
  },
  description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act). Evaluación de riesgos, documentación legal y monitoreo continuo de sistemas de inteligencia artificial.',
  keywords: ['AI Act', 'cumplimiento IA', 'regulación inteligencia artificial', 'IA responsable', 'GDPR', 'sistemas de IA', 'inteligencia artificial', 'ética IA', 'UE AI Act', 'conformidad IA', 'auditoría IA', 'riesgo IA', 'FRIA', 'evaluación impacto IA'],
  authors: [{ name: 'CumplIA', url: 'https://cumplia.com' }],
  creator: 'CumplIA',
  publisher: 'CumplIA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_CODE',
  },
  alternates: {
    canonical: 'https://cumplia.com',
    languages: {
      'es-ES': 'https://cumplia.com',
    },
  },
  openGraph: {
    title: 'CumplIA - Cumplimiento del AI Act para Empresas',
    description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act). Evaluación de riesgos, documentación y monitoreo continuo.',
    url: 'https://cumplia.com',
    siteName: 'CumplIA',
    type: 'website',
    locale: 'es_ES',
    images: [
      {
        url: 'https://cumplia.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CumplIA - Plataforma de cumplimiento del AI Act',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CumplIA - Cumplimiento del AI Act para Empresas',
    description: 'Plataforma SaaS que ayuda a empresas a cumplir con el Reglamento de IA de la UE (AI Act).',
    images: ['https://cumplia.com/og-image.jpg'],
    creator: '@cumplia',
    site: '@cumplia',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-ES">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CumplIA',
              url: 'https://cumplia.com',
              logo: 'https://cumplia.com/logo.png',
              description: 'Plataforma SaaS de cumplimiento del AI Act para empresas europeas',
              sameAs: [
                'https://twitter.com/cumplia',
                'https://linkedin.com/company/cumplia',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Spanish', 'English'],
              },
            }),
          }}
        />
        {/* SoftwareApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'CumplIA',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '127',
              },
              description: 'Plataforma SaaS de cumplimiento del AI Act para empresas europeas',
              url: 'https://cumplia.com',
              author: {
                '@type': 'Organization',
                name: 'CumplIA',
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
