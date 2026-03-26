'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper para animar la entrada de página
 * Aplica fade-in suave al cargar
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-500',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Wrapper para animar la entrada de elementos con stagger
 */
export function AnimatedContainer({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-500',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Skeleton para transición suave entre estados de carga
 */
export function TransitionFade({
  children,
  isLoading = false,
  className,
}: {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'transition-opacity duration-300',
        isLoading ? 'opacity-50' : 'opacity-100',
        className
      )}
    >
      {children}
    </div>
  );
}
