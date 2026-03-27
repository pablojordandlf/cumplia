// apps/web/app/(landing)/Navbar.tsx
import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Adjust scroll threshold as needed
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full py-4 transition-all duration-300 ease-in-out ${
      isScrolled ? 'bg-gray-900/80 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-white">
            CumplIA
          </a>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#features" className="text-gray-300 hover:text-white transition duration-200">Features</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition duration-200">Pricing</a>
          <a href="#resources" className="text-gray-300 hover:text-white transition duration-200">Resources</a>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
            Comienza gratis
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-gray-300 hover:text-white focus:outline-none transition duration-200">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
          {/* Mobile Menu (hidden by default, shown via state) */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
