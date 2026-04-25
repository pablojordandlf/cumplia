'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import UserMenu from '@/components/auth/UserMenu';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

const pathTitles: Record<string, string> = {
  '/dashboard':            'Dashboard',
  '/dashboard/inventory':  'Sistemas de IA',
  '/dashboard/guia':       'Formación',
  '/dashboard/admin':      'Templates',
  '/dashboard/settings':   'Configuración',
  '/dashboard/risk':       'Riesgo',
  '/dashboard/assessments':'Evaluaciones',
  '/dashboard/reports':    'Reportes',
};

export function DashboardNavbar() {
  const pathname  = usePathname();
  const { isCollapsed } = useSidebar();
  const [isVisible, setIsVisible]     = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pathTitles)) {
      if (pathname === path || pathname?.startsWith(path + '/')) return title;
    }
    return 'Dashboard';
  };

  return (
    <nav
      className={cn(
        'hidden lg:flex fixed top-0 right-0 h-16 bg-[#FAFAF8]/95 dark:bg-[#0B1C3D]/95 backdrop-blur-md border-b border-[#E3DFD5] dark:border-white/5 items-center justify-between px-8 z-30 transition-all duration-300 ease-in-out',
        isCollapsed ? 'left-16' : 'left-64',
        isVisible ? 'translate-y-0 shadow-sm' : '-translate-y-full shadow-none'
      )}
    >
      {/* Left: page title */}
      <span className="text-sm font-medium text-[#0B1C3D] dark:text-[#F0EEE8] tracking-[-0.01em]">
        {getPageTitle()}
      </span>

      {/* Right: Theme toggle + user menu */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="w-px h-6 bg-[#E3DFD5] dark:bg-white/10" />
        <UserMenu />
      </div>
    </nav>
  );
}
