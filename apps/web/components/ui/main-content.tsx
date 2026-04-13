'use client';

import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';
import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        'flex-1 bg-slate-50 dark:bg-slate-900 pt-16 pb-16 lg:pb-0 min-h-screen transition-[padding-left] duration-300 ease-in-out',
        isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}
    >
      {children}
    </main>
  );
}
