import React from 'react';

// Script to prevent flash of wrong theme on page load
export const ThemeScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('theme');
            const isDark = theme === 'dark' || 
              (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })();
        `,
      }}
    />
  );
};
