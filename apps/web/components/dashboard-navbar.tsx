'use client';

import { GlobalSearch } from '@/components/global-search';
import { ThemeToggle } from '@/components/theme-toggle';
import UserMenu from '@/components/auth/UserMenu';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const pathTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/inventory': 'Sistemas de IA',
  '/dashboard/guia': 'Formación',
  '/dashboard/admin': 'Templates',
  '/dashboard/settings': 'Configuración',
  '/dashboard/risk': 'Riesgo',
  '/dashboard/assessments': 'Evaluaciones',
  '/dashboard/reports': 'Reportes',
};

export function DashboardNavbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      }
      // Hide when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  // Get page title from pathname
  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pathTitles)) {
      if (pathname === path || pathname?.startsWith(path + '/')) {
        return title;
      }
    }
    return 'Dashboard';
  };

  return (
    <nav 
      className={`hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 items-center justify-between px-6 z-30 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 shadow-sm' : '-translate-y-full shadow-none'
      }`}
    >
      {/* Left: Page Title */}
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        {getPageTitle()}
      </h1>

      {/* Right: Search, Theme, User Menu */}
      <div className="flex items-center gap-4">
        <GlobalSearch />
        <ThemeToggle />
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
        <UserMenu />
      </div>
    </nav>
  );
}
