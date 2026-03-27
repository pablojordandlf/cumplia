// apps/web/app/(landing)/Footer.tsx
import React from 'react';
import Link from 'next/link'; // Assuming Next.js Link component

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">CumplIA</h3>
          <p className="text-sm">AI compliance for humans. Not for lawyers.</p>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-md font-semibold text-white mb-4">Resources</h4>
          <ul>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Blog</a></li>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Documentation</a></li>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">API</a></li>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Case Studies</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-md font-semibold text-white mb-4">Company</h4>
          <ul>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">About Us</a></li>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Careers</a></li>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Contact</a></li>
          </ul>
        </div>

        {/* Legal & Signup */}
        <div>
          <h4 className="text-md font-semibold text-white mb-4">Legal</h4>
          <ul>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Privacy Policy</a></li>
            <li className="mb-2"><a href="#" className="hover:text-blue-400 transition duration-200">Terms of Service</a></li>
          </ul>
          <h4 className="text-md font-semibold text-white mt-6 mb-4">Stay Updated</h4>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-l-lg px-4 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 w-full"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r-lg transition duration-300 ease-in-out"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm">
        &copy; {currentYear} CumplIA. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
