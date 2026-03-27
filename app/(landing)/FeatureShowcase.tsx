// apps/web/app/(landing)/FeatureShowcase.tsx
import React from 'react';
import FeatureCard from './FeatureCard';
import { BeakerIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'; // Example icons

const FeatureShowcase = () => {
  const features = [
    {
      icon: <CogIcon className="h-10 w-10" />,
      title: 'Intuitive Automation',
      description: 'Automate compliance tasks effortlessly with our smart AI.',
    },
    {
      icon: <ShieldCheckIcon className="h-10 w-10" />,
      title: 'Robust Security',
      description: 'Ensure your data and operations are secure and compliant.',
    },
    {
      icon: <BeakerIcon className="h-10 w-10" />,
      title: 'Advanced Analytics',
      description: 'Gain insights into your compliance status and risks.',
    },
    // Add more features as needed
  ];

  return (
    <section id="features" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Your Compliance, Simplified.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
