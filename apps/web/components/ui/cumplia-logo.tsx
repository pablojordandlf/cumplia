import * as React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────
// CumplIA Logomark — pure SVG, viewport 88×88
//
// Scale guide (px → stroke-width, node-radius):
//   96+  full (arco + arco interior + nodo)
//   64   full
//   40   arco principal + nodo  (sw=6.5, r=8)
//   28   arco principal + nodo  (sw=7.5, r=9)
//   18   arco + nodo simplified  (sw=8.5, r=10)
//   16   solo círculo chartreuse
// ─────────────────────────────────────────────────────────

interface LogomarkProps {
  /** Rendered size in px (controls SVG width/height) */
  size?: number;
  /** 'light' = dark arco on light bg | 'dark' = light arco on dark bg */
  variant?: 'light' | 'dark';
  /** Animate the draw-on on mount */
  animate?: boolean;
  className?: string;
}

export function Logomark({
  size = 40,
  variant = 'light',
  animate = false,
  className,
}: LogomarkProps) {
  const isDark = variant === 'dark';

  // Scale-aware stroke / node sizing
  const sw     = size >= 64 ? 5.5 : size >= 40 ? 6.5 : size >= 28 ? 7.5 : 8.5;
  const nr     = size >= 64 ? 7   : size >= 40 ? 8   : size >= 28 ? 9   : 10;
  const nDot   = size >= 64 ? 2.8 : size >= 40 ? 3.2 : size >= 28 ? 3.8 : 4.2;
  const showInner = size >= 40;

  const arcColor  = isDark ? '#F0EEE8' : '#0B1C3D';
  const nodeColor = '#E8FF47';
  const nodeDot   = isDark ? '#0B1C3D' : '#0B1C3D';

  const arcStyle  = animate ? { strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw-arc 0.9s cubic-bezier(0.4,0,0.2,1) forwards' } : {};
  const innerStyle= animate ? { strokeDasharray: 140, strokeDashoffset: 140, animation: 'draw-arc-inner 0.9s 0.15s cubic-bezier(0.4,0,0.2,1) forwards' } : {};
  const nodeStyle = animate ? { opacity: 0, animation: 'fade-in-node 0.45s 0.75s ease-out both' } : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
      aria-hidden="true"
    >
      {/* Arco interior (profundidad) */}
      {showInner && (
        <path
          d="M64 44 A20 20 0 1 1 55.4 25.4"
          stroke={isDark ? 'rgba(240,238,232,0.14)' : 'rgba(11,28,61,0.14)'}
          strokeWidth={sw * 0.55}
          strokeLinecap="round"
          style={innerStyle as React.CSSProperties}
        />
      )}

      {/* Arco principal */}
      <path
        d="M74 44 A30 30 0 1 1 62 18"
        stroke={arcColor}
        strokeWidth={sw}
        strokeLinecap="round"
        style={arcStyle as React.CSSProperties}
      />

      {/* Línea conector al nodo */}
      <line
        x1="62" y1="18"
        x2="67" y2="14"
        stroke={isDark ? 'rgba(240,238,232,0.3)' : 'rgba(11,28,61,0.3)'}
        strokeWidth={1.5}
        strokeLinecap="round"
        style={nodeStyle as React.CSSProperties}
      />

      {/* Nodo de verificación — outer */}
      <circle cx="67" cy="14" r={nr} fill={isDark ? '#0B1C3D' : '#0B1C3D'} style={nodeStyle as React.CSSProperties} />
      {/* Nodo chartreuse fill */}
      <circle cx="67" cy="14" r={nr} fill={nodeColor} style={nodeStyle as React.CSSProperties} />
      {/* Nodo dot interior */}
      <circle cx="67" cy="14" r={nDot} fill={nodeDot} style={nodeStyle as React.CSSProperties} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// CumplIA Wordmark
// Cumpl (Fraunces 900) + IA (Fraunces 900 italic)
// ─────────────────────────────────────────────────────────

interface WordmarkProps {
  /** Font size in px */
  size?: number;
  /** 'light' = dark text on light bg | 'dark' = white + spark on dark bg */
  variant?: 'light' | 'dark';
  /** Show subtitle "AI Act Compliance" */
  subtitle?: boolean;
  className?: string;
}

export function Wordmark({ size = 22, variant = 'light', subtitle = false, className }: WordmarkProps) {
  const isDark = variant === 'dark';
  const baseColor = isDark ? '#F0EEE8' : '#0B1C3D';
  const iaColor   = isDark ? '#E8FF47' : '#0B1C3D';

  return (
    <span
      className={cn('flex flex-col leading-none', className)}
      style={{ letterSpacing: '-0.03em' }}
    >
      <span
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1,
          color: baseColor,
        }}
      >
        Cumpl<span style={{ fontStyle: 'italic', color: iaColor }}>IA</span>
      </span>
      {subtitle && (
        <span
          style={{
            fontFamily: '"Geist", system-ui, sans-serif',
            fontWeight: 300,
            fontSize: Math.max(9, size * 0.45),
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(139,155,180,0.7)' : '#8B9BB4',
            marginTop: 2,
          }}
        >
          AI Act Compliance
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// CumplIA Full Logo (mark + wordmark combined)
// ─────────────────────────────────────────────────────────

interface LogoProps {
  markSize?: number;
  wordSize?: number;
  variant?: 'light' | 'dark';
  animate?: boolean;
  subtitle?: boolean;
  gap?: number;
  className?: string;
}

export function CumpliaLogo({
  markSize = 30,
  wordSize = 22,
  variant = 'light',
  animate = false,
  subtitle = false,
  gap = 12,
  className,
}: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center', className)}
      style={{ gap }}
    >
      <Logomark size={markSize} variant={variant} animate={animate} />
      <Wordmark size={wordSize} variant={variant} subtitle={subtitle} />
    </span>
  );
}
