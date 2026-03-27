'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import UserMenu from '@/components/auth/UserMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

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
  const router = useRouter();
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

  const handleCumpliaClick = () => {
    router.push('/dashboard');
  };

  return (
    <nav 
      className={`hidden lg:flex fixed top-0 left-0 right-0 h-16 glass border-b border-white/10 dark:border-white/5 items-center justify-between px-8 z-30 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 shadow-lg' : '-translate-y-full shadow-none'
      }`}
    >
      {/* Left: CumplIA Logo/Brand ONLY (no "Dashboard" text) */}
      <button
        onClick={handleCumpliaClick}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="relative w-7 h-7">
          <Brain className="w-7 h-7 text-blue-500 dark:text-blue-400 drop-shadow-sm" />
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300 bg-clip-text text-transparent">
          CumplIA
        </span>
      </button>

      {/* Right: Theme, User Menu */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="w-px h-6 bg-white/10 dark:bg-white/5" />
        <UserMenu />
      </div>
    </nav>
  );
}
