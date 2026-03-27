'use client';

import { Button } from './button';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface ButtonWithStateProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  isSuccess?: boolean;
  successIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Botón con estados de carga y éxito
 * Maneja automáticamente disabled, carga visual, y transición a éxito
 */
export function ButtonWithState({
  isLoading = false,
  isSuccess = false,
  successIcon = '✓',
  disabled = false,
  children,
  ...props
}: ButtonWithStateProps) {
  return (
    <Button
      disabled={disabled || isLoading || isSuccess}
      {...props}
      className={`transition-all duration-300 ${props.className || ''}`}
    >
      {isLoading && (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span className="opacity-70">Procesando...</span>
        </>
      )}
      {isSuccess && (
        <>
          <span className="mr-2">{successIcon}</span>
          <span className="opacity-70">Completado</span>
        </>
      )}
      {!isLoading && !isSuccess && children}
    </Button>
  );
}

/**
 * Estilos de referencia para botones
 * Documentación visual de todos los estados disponibles
 */
export function ButtonStatesShowcase() {
  return (
    <div className="space-y-8 p-6">
      {/* Default Variant */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Default</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="default">Normal</Button>
          <Button variant="default" disabled>
            Deshabilitado
          </Button>
          <ButtonWithState isLoading>Cargando</ButtonWithState>
          <ButtonWithState isSuccess>Completado</ButtonWithState>
        </div>
      </section>

      {/* Secondary Variant */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Secondary</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary">Normal</Button>
          <Button variant="secondary" disabled>
            Deshabilitado
          </Button>
          <ButtonWithState variant="secondary" isLoading>
            Cargando
          </ButtonWithState>
          <ButtonWithState variant="secondary" isSuccess>
            Completado
          </ButtonWithState>
        </div>
      </section>

      {/* Destructive Variant */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Destructive</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="destructive">Normal</Button>
          <Button variant="destructive" disabled>
            Deshabilitado
          </Button>
          <ButtonWithState variant="destructive" isLoading>
            Cargando
          </ButtonWithState>
        </div>
      </section>

      {/* Outline Variant */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Outline</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline">Normal</Button>
          <Button variant="outline" disabled>
            Deshabilitado
          </Button>
          <ButtonWithState variant="outline" isLoading>
            Cargando
          </ButtonWithState>
        </div>
      </section>

      {/* Ghost Variant */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Ghost</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="ghost">Normal</Button>
          <Button variant="ghost" disabled>
            Deshabilitado
          </Button>
          <ButtonWithState variant="ghost" isLoading>
            Cargando
          </ButtonWithState>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Sizes</h3>
        <div className="flex gap-3 flex-wrap items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">⚙️</Button>
        </div>
      </section>
    </div>
  );
}

/**
 * Design tokens para colores de botones
 * Referencia centralizada para uso en estilos
 */
export const BUTTON_TOKENS = {
  colors: {
    primary: {
      bg: 'hsl(var(--primary))',
      text: 'hsl(var(--primary-foreground))',
      hover: 'hsl(var(--primary) / 0.9)',
      disabled: 'hsl(var(--primary) / 0.5)',
    },
    secondary: {
      bg: 'hsl(var(--secondary))',
      text: 'hsl(var(--secondary-foreground))',
      hover: 'hsl(var(--secondary) / 0.8)',
      disabled: 'hsl(var(--secondary) / 0.5)',
    },
    destructive: {
      bg: 'hsl(var(--destructive))',
      text: 'hsl(var(--destructive-foreground))',
      hover: 'hsl(var(--destructive) / 0.9)',
      disabled: 'hsl(var(--destructive) / 0.5)',
    },
  },
  transitions: {
    default: 'transition-colors duration-200 ease-in-out',
    smooth: 'transition-all duration-300 ease-out',
  },
  states: {
    hover: 'hover:bg-opacity-90 hover:shadow-sm',
    active: 'active:scale-95 active:shadow-inner',
    focus: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  },
};
