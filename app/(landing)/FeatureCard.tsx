// apps/web/app/(landing)/FeatureCard.tsx
import React from 'react';
import { motion } from 'framer-motion'; // Assuming framer-motion is installed

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg text-center h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-blue-500 mb-4 text-4xl">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-200">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
