/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' or false
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Or if using src directory:
    // './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Branding colors for CumplIA
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // A vibrant blue, adjust as needed
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          background: '#111827', // Dark background, e.g., slate-900
          card: '#1f2937', // Slightly lighter for card backgrounds, e.g., slate-800
          text: '#d1d5db', // Gray-300 for general text
          secondaryText: '#9ca3af', // Gray-400 for secondary text
        },
        accent: {
          DEFAULT: '#f43f5e', // Example accent color (reddish), adjust as needed
          hover: '#e11d48',
        },
      },
      // Typography
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      // Animation timings, etc. can be extended here
      // transitionDuration: {
      //   'DEFAULT': '300ms',
      // },
    },
  },
  plugins: [],
}
