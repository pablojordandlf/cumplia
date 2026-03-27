// apps/web/app/(landing)/PricingSection.tsx
import React from 'react';
import PricingCard from './PricingCard';

const PricingSection = () => {
  const plans = [
    {
      title: 'Free',
      price: '$0',
      features: ['1 Project', 'Limited AI features', 'Basic Support'],
      ctaText: 'Get Started Free',
    },
    {
      title: 'Pro',
      price: '$49',
      features: ['5 Projects', 'Advanced AI features', 'Priority Support', 'Analytics Dashboard'],
      ctaText: 'Start Pro Trial',
      isRecommended: true,
    },
    {
      title: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited Projects', 'All AI Features', 'Dedicated Support', 'Custom Integrations'],
      ctaText: 'Contact Sales',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Transparent Pricing for Every Need.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              ctaText={plan.ctaText}
              isRecommended={plan.isRecommended}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
