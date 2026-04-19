'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

// ── Canvas animation: Radar Sweep ─────────────────────────────────────────────
function useRadarCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    const Y_RGB = { r: 232, g: 255, b: 71 };
    let animId: number;
    let W = 0;
    let H = 0;
    let angle = 0;

    interface RadarDot {
      r: number;
      a: number;
      label: string;
      color: string;
      size: number;
      decay: number;
    }

    let dots: RadarDot[] = [];

    function buildDots() {
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.max(W, H) * 0.6;
      const riskLabels = ['Alto', 'Limitado', 'Mínimo', 'Prohibido', 'GPAI'];
      const riskColors = [
        'rgba(255,80,80,',
        'rgba(255,160,40,',
        `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},`,
        'rgba(255,50,50,',
        'rgba(140,180,255,',
      ];
      dots = Array.from({ length: 22 }, () => {
        const r = 60 + Math.random() * (maxR * 0.85);
        const a = Math.random() * Math.PI * 2;
        const idx = Math.floor(Math.random() * riskLabels.length);
        return { r, a, label: riskLabels[idx], color: riskColors[idx], size: 3 + Math.random() * 3, decay: 0 };
      });
    }

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildDots();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.max(W, H) * 0.6;
      const baseAlpha = 0.8;
      const numRings = 4;

      // Concentric rings
      for (let i = 1; i <= numRings; i++) {
        const r = maxR * (i / numRings);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},${baseAlpha * 0.12})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Cross hairs
      ctx.strokeStyle = `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},${baseAlpha * 0.1})`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 6]);
      [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((a) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Sweep sector
      const sweepAngle = Math.PI * 0.28;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, -sweepAngle, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},${baseAlpha * 0.07})`;
      ctx.fill();
      // Leading edge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},${baseAlpha * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Dots
      dots.forEach((d) => {
        const dotAngle = ((d.a - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (dotAngle < 0.05) d.decay = 1.0;
        if (d.decay > 0) {
          const a = d.decay * baseAlpha;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(d.a) * d.r, cy + Math.sin(d.a) * d.r, d.size, 0, Math.PI * 2);
          ctx.fillStyle = `${d.color}${a})`;
          ctx.fill();
          if (d.decay > 0.4) {
            ctx.font = `500 10px 'DM Mono', monospace`;
            ctx.fillStyle = `${d.color}${a * 0.9})`;
            ctx.fillText(d.label, cx + Math.cos(d.a) * d.r + d.size + 4, cy + Math.sin(d.a) * d.r + 4);
          }
          d.decay = Math.max(0, d.decay - 0.003);
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},${baseAlpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${Y_RGB.r},${Y_RGB.g},${Y_RGB.b},${baseAlpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      angle = (angle + 0.008) % (Math.PI * 2);
      animId = requestAnimationFrame(draw);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [canvasRef]);
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useRadarCanvas(canvasRef);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#0A0A0A',
        padding: '100px 24px 80px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Radial overlay for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0.92) 100%)',
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-[820px] mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-9"
          style={{
            background: 'rgba(232,255,71,0.12)',
            border: '1px solid rgba(232,255,71,0.3)',
            color: '#E8FF47',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              background: '#E8FF47',
              flexShrink: 0,
              animation: 'hero-pulse 2s ease-in-out infinite',
            }}
          />
          EU AI Act · Agosto 2026
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(42px, 6.5vw, 88px)',
            fontWeight: 700,
            lineHeight: 1.03,
            letterSpacing: '-0.04em',
            marginBottom: 28,
            color: '#FAFAFA',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}
        >
          Cumple con el AI Act
          <br />
          <em style={{ fontStyle: 'normal', color: '#E8FF47' }}>sin complicaciones</em>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            color: 'rgba(250,250,250,0.55)',
            lineHeight: 1.6,
            maxWidth: 600,
            margin: '0 auto 48px',
            fontWeight: 400,
          }}
        >
          CumplIA automatiza la gestión de riesgos, obligaciones y documentación de tus sistemas de IA.
          De semanas a horas — con inteligencia artificial incluida.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register">
            <button
              className="transition-all"
              style={{
                background: '#E8FF47',
                color: '#0A0A0A',
                border: 'none',
                padding: '16px 32px',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                letterSpacing: '-0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Empieza hoy gratis
              <ArrowRight size={16} />
            </button>
          </Link>
          <a href="#how-it-works">
            <button
              className="transition-all"
              style={{
                background: 'transparent',
                color: '#FAFAFA',
                border: '1px solid rgba(250,250,250,0.1)',
                padding: '16px 32px',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                letterSpacing: '-0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(250,250,250,0.3)';
                e.currentTarget.style.background = 'rgba(250,250,250,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(250,250,250,0.1)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Play size={16} />
              Ver cómo funciona
            </button>
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10 flex items-center gap-12 flex-wrap justify-center"
        style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: '1px solid rgba(250,250,250,0.1)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {[
          { value: '50+', label: 'Factores de riesgo catalogados' },
          { value: '−90%', label: 'Tiempo de auditoría' },
          { value: '100%', label: 'Generación automática de informes' },
          { value: '5min', label: 'Para tener tu primer sistema clasificado' },
        ].map((stat, i, arr) => (
          <div key={stat.label} className="flex items-center gap-12">
            <div className="text-center">
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#E8FF47',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(250,250,250,0.55)',
                  marginTop: 4,
                  fontWeight: 400,
                }}
              >
                {stat.label}
              </div>
            </div>
            {i < arr.length - 1 && (
              <div
                style={{
                  width: 1,
                  height: 36,
                  background: 'rgba(250,250,250,0.1)',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes hero-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </section>
  );
}
