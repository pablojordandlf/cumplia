'use client';

import { GlobalSearch } from '@/components/global-search';
import { ThemeToggle } from '@/components/theme-toggle';
import UserMenu from '@/components/auth/UserMenu';
import { usePathname } from 'next/navigation';

const pathTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/inventory': 'Sistemas de IA',
  '/dashboard/guia': 'Formación',
  '/dashboard/admin': 'Templates',
  '/dashboard/settings': 'Configuración',
};

export function DashboardNavbar() {
  const pathname = usePathname();
  
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
    <nav className="hidden lg:flex fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200 dark:border-slate-800 dark:bg-slate-950 items-center justify-between px-6 z-30">
      {/* Left: Page Title */}
      <h1 className="text-lg font-semibold text-foreground">
        {getPageTitle()}
      </h1>

      {/* Right: Search, Theme, User Menu */}
      <div className="flex items-center gap-4">
        <GlobalSearch />
        <ThemeToggle />
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        <UserMenu />
      </div>
    </nav>
  );
}
