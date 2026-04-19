import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';
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
