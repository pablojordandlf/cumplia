'use client';

import { useEffect, useRef } from 'react';

const YELLOW = { r: 232, g: 255, b: 71 };
const y = (a: number) => `rgba(${YELLOW.r},${YELLOW.g},${YELLOW.b},${a})`;
const ALPHA = 0.85;
const SWEEP = Math.PI * 0.28;

const RISK_LABELS = ['Alto', 'Limitado', 'Mínimo', 'Prohibido', 'GPAI'];
const RISK_COLORS = [
  'rgba(255,80,80,',
  'rgba(255,160,40,',
  `rgba(${YELLOW.r},${YELLOW.g},${YELLOW.b},`,
  'rgba(255,50,50,',
  'rgba(140,180,255,',
];

type Dot = { r: number; a: number; decay: number; label: string; color: string; size: number };

function makeDots(maxR: number): Dot[] {
  return Array.from({ length: 26 }, () => {
    const r = 60 + Math.random() * maxR * 0.85;
    const a = Math.random() * Math.PI * 2;
    const idx = Math.floor(Math.random() * RISK_LABELS.length);
    return { r, a, decay: 0, label: RISK_LABELS[idx], color: RISK_COLORS[idx], size: 3 + Math.random() * 3 };
  });
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const angleRef  = useRef(0);
  const dotsRef   = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = 0, H = 0;

    function resize() {
      W = canvas!.width  = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      dotsRef.current = makeDots(Math.max(W, H) * 0.6);
    }

    function draw() {
      const mr  = Math.max(W, H) * 0.6;
      const cxd = W / 2, cyd = H / 2;
      ctx.clearRect(0, 0, W, H);

      // Rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cxd, cyd, mr * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = y(ALPHA * 0.1);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Cross-hairs
      ctx.strokeStyle = y(ALPHA * 0.08);
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((a) => {
        ctx.beginPath();
        ctx.moveTo(cxd, cyd);
        ctx.lineTo(cxd + Math.cos(a) * mr, cyd + Math.sin(a) * mr);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Sweep sector
      ctx.save();
      ctx.translate(cxd, cyd);
      ctx.rotate(angleRef.current);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, mr, -SWEEP, 0);
      ctx.closePath();
      ctx.fillStyle = y(ALPHA * 0.06);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(mr, 0);
      ctx.strokeStyle = y(ALPHA * 0.9);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Dots
      dotsRef.current.forEach((d) => {
        const da = ((d.a - angleRef.current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (da < 0.06) d.decay = 1;
        if (d.decay > 0) {
          const opacity = d.decay * ALPHA;
          const dx = cxd + Math.cos(d.a) * d.r;
          const dy = cyd + Math.sin(d.a) * d.r;
          ctx.beginPath();
          ctx.arc(dx, dy, d.size, 0, Math.PI * 2);
          ctx.fillStyle = `${d.color}${opacity})`;
          ctx.fill();
          if (d.decay > 0.4) {
            ctx.font = `500 10px var(--font-mono, 'DM Mono', monospace)`;
            ctx.fillStyle = `${d.color}${opacity * 0.9})`;
            ctx.fillText(d.label, dx + d.size + 4, dy + 4);
          }
          d.decay = Math.max(0, d.decay - 0.0025);
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cxd, cyd, 5, 0, Math.PI * 2);
      ctx.fillStyle = y(ALPHA);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cxd, cyd, 12, 0, Math.PI * 2);
      ctx.strokeStyle = y(ALPHA * 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();

      angleRef.current = (angleRef.current + 0.007) % (Math.PI * 2);
      rafRef.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
