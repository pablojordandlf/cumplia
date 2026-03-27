// apps/web/app/(landing)/PricingCard.tsx
import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  ctaText: string;
  isRecommended?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, ctaText, isRecommended }) => {
  return (
    <div className={`bg-gray-800 p-8 rounded-lg shadow-lg text-center flex flex-col justify-between ${isRecommended ? 'border-4 border-blue-500 scale-105' : ''}`}>
      <div>
        <h3 className={`text-2xl font-bold mb-4 ${isRecommended ? 'text-blue-400' : 'text-white'}`}>{title}</h3>
        <p className="text-5xl font-extrabold mb-6">
          {price}
          <span className="text-xl font-normal text-gray-400">/month</span>
        </p>
        <ul className="text-gray-300 space-y-3 mb-8 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <button className={`w-full py-3 px-6 rounded-lg font-bold transition duration-300 ease-in-out ${
        isRecommended
          ? 'bg-blue-500 hover:bg-blue-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}>
        {ctaText}
      </button>
    </div>
  );
};

export default PricingCard;
