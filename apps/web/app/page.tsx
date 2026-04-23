import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';

export const metadata: Metadata = {
  title: {
    absolute: 'CumplIA - Cumplimiento del AI Act para Empresas',
  },
  description: 'Evalúa el riesgo de tus sistemas de IA, genera la documentación técnica exigida por el AI Act y gestiona el cumplimiento de tu organización desde una sola plataforma.',
  keywords: [
    'AI Act cumplimiento',
    'plataforma compliance IA',
    'evaluación riesgo AI Act',
    'documentación técnica IA',
    'FRIA evaluación impacto',
    'sistemas alto riesgo IA',
    'reglamento inteligencia artificial UE',
    'software auditoría IA',
  ],
  alternates: {
    canonical: 'https://cumplia.com',
  },
  openGraph: {
    title: 'CumplIA - Cumplimiento del AI Act para Empresas',
    description: 'Evalúa el riesgo de tus sistemas de IA, genera la documentación técnica exigida por el AI Act y gestiona el cumplimiento de tu organización desde una sola plataforma.',
    url: 'https://cumplia.com',
    type: 'website',
  },
};
import Ticker from '@/components/Ticker';
import ProblemaSection from '@/components/ProblemaSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FeaturesSection from '@/components/FeaturesSection';
import RiskSection from '@/components/RiskSection';
import PricingSection from '@/components/PricingSection';
import FaqSection from '@/components/FaqSection';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div data-landing>
      <Nav />
      <HeroSection />
      <Ticker />
      <ProblemaSection />
      <HowItWorksSection />
      <FeaturesSection />
      <RiskSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
