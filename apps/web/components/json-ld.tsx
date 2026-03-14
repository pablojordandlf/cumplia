import React from 'react';

interface JsonLdProps {
  type: 'Organization' | 'SoftwareApplication' | 'FAQPage' | 'Article' | 'Product' | 'Service' | 'BreadcrumbList';
  data: Record<string, unknown>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Predefined schemas for common use cases
export function SoftwareApplicationSchema() {
  return (
    <JsonLd
      type="SoftwareApplication"
      data={{
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
      }}
    />
  );
}

export function FAQPageSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return (
    <JsonLd
      type="FAQPage"
      data={{
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <JsonLd
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
