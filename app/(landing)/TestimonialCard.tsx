// apps/web/app/(landing)/TestimonialCard.tsx
import React from 'react';

const TestimonialCard = ({ quote, author, title, company, avatar }: {
  quote: string;
  author: string;
  title: string;
  company: string;
  avatar: string;
}) => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-sm mx-auto">
      <p className="text-lg text-gray-300 mb-6 italic">"{quote}"</p>
      <img src={avatar} alt={`${author}'s avatar`} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-500" />
      <h4 className="text-xl font-bold text-white">{author}</h4>
      <p className="text-gray-400">{title}, {company}</p>
    </div>
  );
};

export default TestimonialCard;
