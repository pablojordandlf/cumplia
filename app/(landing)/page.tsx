// apps/web/app/(landing)/page.tsx
import Hero from './Hero';
import Navbar from './Navbar';
import FeatureShowcase from './FeatureShowcase';
import TestimonialsCarousel from './TestimonialsCarousel';
import PricingSection from './PricingSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="bg-dark-background text-dark-text antialiased">
      <Navbar />
      <Hero />
      <FeatureShowcase />
      <TestimonialsCarousel />
      <PricingSection />
      <Footer />
    </div>
  );
}
