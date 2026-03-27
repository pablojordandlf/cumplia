// apps/web/app/(landing)/Hero.tsx
import React from 'react';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-white">
      {/* Background: Video or Gradient */}
      <div className="absolute inset-0 -z-10">
        {/* Placeholder for video or gradient background */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 opacity-70 h-full w-full"></div>
        {/* Or: <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/path/to/your/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
      </div>

      <div className="container mx-auto px-6 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          AI compliance for humans. Not for lawyers.
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          Simplify complex AI regulations with an intuitive, human-friendly platform.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out">
            Comienza gratis
          </button>
          <button className="bg-transparent hover:bg-white hover:text-gray-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-white transition duration-300 ease-in-out">
            Ver demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

