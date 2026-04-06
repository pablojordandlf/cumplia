'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  FileText,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Users,
  ArrowRight,
  Building2,
  Scale,
  Bot,
  Cpu,
  Sparkles,
  Star,
  Lock,
  ClipboardCheck,
  Bell,
  ChevronRight,
  TrendingUp,
  Clock,
  FolderKanban,
  BarChart3,
  History,
  CalendarClock,
  CheckSquare,
  ShieldCheck,
  Eye,
  Download,
  ChevronDown,
  X,
  Play,
} from 'lucide-react';
import { Header } from '@/components/landing-header';
import { Footer } from '@/components/landing-footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';

// Stagger animation variants
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

// ─────────────────────────────────────────────────────────
// Dashboard Mockup Component
// ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div
      className="relative w-full max-w-2xl mx-auto"
      style={{ filter: 'drop-shadow(0 40px 80px rgba(11,28,61,0.45))' }}
    >
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden border border-[#E3DFD5]">
        <div className="bg-[#F0EEE8] border-b border-[#E3DFD5] px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-[#FAFAF8] rounded-md px-3 py-1 text-xs text-[#8B9BB4] border border-[#E3DFD5] text-center">
            app.cumplia.com/dashboard
          </div>
        </div>

        {/* App layout */}
        <div className="flex bg-[#FAFAF8]" style={{ height: '440px' }}>
          {/* Sidebar */}
          <div className="w-44 bg-[#FAFAF8] border-r border-[#E3DFD5] flex flex-col flex-shrink-0">
            <div className="p-4 flex items-center gap-2">
              {/* Mini logomark inline */}
              <svg width="18" height="18" viewBox="0 0 88 88" fill="none">
                <path d="M74 44 A30 30 0 1 1 62 18" stroke="#0B1C3D" strokeWidth="8" strokeLinecap="round"/>
                <circle cx="67" cy="14" r="9" fill="#E8FF47"/>
                <circle cx="67" cy="14" r="3.6" fill="#0B1C3D"/>
              </svg>
              <span className="font-bold text-[#0B1C3D] text-sm" style={{ fontFamily: '"Fraunces",serif', fontWeight: 900 }}>
                Cumpl<span style={{ fontStyle: 'italic' }}>IA</span>
              </span>
            </div>
            <nav className="px-2 flex-1 space-y-0.5">
              {[
                { label: 'Dashboard',      active: true },
                { label: 'Inventario IA',  active: false },
                { label: 'Gestión Riesgos',active: false },
                { label: 'Compliance',     active: false },
                { label: 'Documentación',  active: false },
                { label: 'Timeline',       active: false },
                { label: 'Mi trabajo',     active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="px-3 py-2 rounded-lg text-[10px] font-medium flex items-center gap-2"
                  style={{
                    background: item.active ? 'rgba(11,28,61,0.07)' : 'transparent',
                    color: item.active ? '#0B1C3D' : '#8B9BB4',
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: item.active ? '#E8FF47' : '#E3DFD5' }}
                  />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-[#F0EEE8] p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0B1C3D]">Dashboard</h3>
                <p className="text-[10px] text-[#8B9BB4]">Resumen de cumplimiento AI Act</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,255,71,0.15)' }}>
                  <Bell className="w-3 h-3" style={{ color: '#0B1C3D' }} />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#E3DFD5] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#8B9BB4]/40" />
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Sistemas IA',     value: '12', sub: '3 nuevos este mes',   border: 'border-[#E3DFD5]' },
                { label: 'Cumplimiento',    value: '78%', sub: '+12% vs anterior',   border: 'border-green-100' },
                { label: 'Riesgos críticos',value: '4',  sub: 'Requieren acción',    border: 'border-orange-100' },
              ].map((stat) => (
                <div key={stat.label} className={`p-2.5 rounded-xl border bg-[#FAFAF8] ${stat.border}`}>
                  <div className="text-base font-bold text-[#0B1C3D]">{stat.value}</div>
                  <div className="text-[9px] font-medium text-[#0B1C3D]">{stat.label}</div>
                  <div className="text-[9px] text-[#8B9BB4]">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Systems list */}
            <div className="bg-[#FAFAF8] rounded-xl border border-[#E3DFD5] p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#0B1C3D]">Sistemas de IA</span>
                <span className="text-[9px] font-medium" style={{ color: '#E8FF47', filter: 'brightness(0.75)' }}>Ver todos →</span>
              </div>
              {[
                { name: 'Chatbot Atención al Cliente', level: 'Limitado',   pct: 85, levelColor: 'bg-blue-100 text-blue-600' },
                { name: 'Scoring de Crédito',          level: 'Alto Riesgo',pct: 42, levelColor: 'bg-orange-100 text-orange-600' },
                { name: 'Recomendador Productos',       level: 'Mínimo',    pct: 96, levelColor: 'bg-green-100 text-green-600' },
                { name: 'Detección de Fraude',          level: 'Alto Riesgo',pct: 61, levelColor: 'bg-orange-100 text-orange-600' },
              ].map((sys) => (
                <div key={sys.name} className="flex items-center gap-2 py-1.5 border-b border-[#F0EEE8] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-[#0B1C3D] truncate">{sys.name}</div>
                    <div className="w-full bg-[#E3DFD5] rounded-full h-1 mt-0.5">
                      <div className="h-1 rounded-full bg-[#0B1C3D]" style={{ width: `${sys.pct}%` }} />
                    </div>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${sys.levelColor}`}>
                    {sys.level}
                  </span>
                  <span className="text-[9px] text-[#8B9BB4] flex-shrink-0">{sys.pct}%</span>
                </div>
              ))}
            </div>

            {/* AI badge */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: 'rgba(11,28,61,0.05)', borderColor: 'rgba(11,28,61,0.1)' }}
            >
              <Sparkles className="w-3 h-3" style={{ color: '#0B1C3D' }} />
              <span className="text-[9px] text-[#0B1C3D] font-medium">Asistente IA activo — 3 recomendaciones pendientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — compliant */}
      <div className="absolute -bottom-4 -right-4 bg-[#FAFAF8] rounded-xl shadow-lg border border-[#E3DFD5] px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-[#0B1C3D]">AI Act compliant</div>
          <div className="text-[9px] text-[#8B9BB4]">Actualizado hoy</div>
        </div>
      </div>

      {/* Floating badge — spark */}
      <div className="absolute -top-4 -left-4 rounded-xl shadow-lg border px-3 py-2 flex items-center gap-2"
        style={{ background: '#0B1C3D', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,255,71,0.15)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#E8FF47' }} />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-[#F0EEE8]">Análisis IA completado</div>
          <div className="text-[9px] text-[#8B9BB4]">12 riesgos identificados</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Risk Management Mockup
// ─────────────────────────────────────────────────────────
function RiskMockup() {
  return (
    <div className="rounded-2xl border border-[#E3DFD5] bg-[#FAFAF8] overflow-hidden shadow-xl">
      <div className="bg-[#F0EEE8] border-b border-[#E3DFD5] px-4 py-2.5 flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#0B1C3D]" />
        <span className="text-xs font-semibold text-[#0B1C3D]">Gestión de Riesgos — Scoring Crédito</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-[#8B9BB4]">Progreso mitigación</span>
              <span className="text-[10px] font-semibold text-[#0B1C3D]">42%</span>
            </div>
            <div className="w-full bg-[#E3DFD5] rounded-full h-2">
              <div className="bg-[#0B1C3D] h-2 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-[#0B1C3D]">12</div>
            <div className="text-[9px] text-[#8B9BB4]">riesgos</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Discriminación injusta', severity: 'Crítico', status: 'Pendiente', severityColor: 'text-red-600 bg-red-50', statusColor: 'text-red-500' },
            { name: 'Sesgos en datos entreno', severity: 'Alto', status: 'En revisión', severityColor: 'text-orange-600 bg-orange-50', statusColor: 'text-orange-500' },
            { name: 'Fuga datos personales', severity: 'Crítico', status: 'Mitigado', severityColor: 'text-red-600 bg-red-50', statusColor: 'text-green-500' },
            { name: 'Falta transparencia', severity: 'Medio', status: 'Mitigado', severityColor: 'text-yellow-600 bg-yellow-50', statusColor: 'text-green-500' },
          ].map((risk) => (
            <div key={risk.name} className="flex items-center gap-2 p-2 rounded-lg bg-[#F0EEE8]">
              <div className="flex-1">
                <span className="text-[10px] font-medium text-[#0B1C3D]">{risk.name}</span>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${risk.severityColor}`}>
                {risk.severity}
              </span>
              <span className={`text-[9px] font-medium ${risk.statusColor}`}>{risk.status}</span>
            </div>
          ))}
        </div>
        <button
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium"
          style={{ background: '#0B1C3D', color: '#E8FF47' }}
        >
          <Sparkles className="w-3 h-3" />
          Analizar con IA
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Compliance Mockup
// ─────────────────────────────────────────────────────────
function ComplianceMockup() {
  return (
    <div className="rounded-2xl border border-[#E3DFD5] bg-[#FAFAF8] overflow-hidden shadow-xl">
      <div className="bg-[#F0EEE8] border-b border-[#E3DFD5] px-4 py-2.5 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[#8B9BB4]" />
        <span className="text-xs font-semibold text-[#0B1C3D]">Compliance — Obligaciones AI Act</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Completadas', value: '18', color: 'text-green-600 bg-green-50' },
            { label: 'En progreso', value: '7',  color: 'text-orange-600 bg-orange-50' },
            { label: 'Pendientes',  value: '4',  color: 'text-red-600 bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`text-center p-2 rounded-lg ${s.color}`}>
              <div className="text-base font-bold">{s.value}</div>
              <div className="text-[9px]">{s.label}</div>
            </div>
          ))}
        </div>
        {[
          { label: 'Art. 13 — Transparencia',      pct: 100, done: true  },
          { label: 'Art. 14 — Supervisión humana', pct: 60,  done: false },
          { label: 'Art. 16 — Registro técnico',   pct: 40,  done: false },
          { label: 'Art. 27 — FRIA completa',      pct: 75,  done: false },
        ].map((ob) => (
          <div key={ob.label} className="flex items-center gap-2 mb-2">
            <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${ob.done ? 'bg-green-100' : 'bg-[#E3DFD5]'}`}>
              {ob.done && <CheckCircle className="w-3 h-3 text-green-600" />}
            </div>
            <div className="flex-1">
              <div className="text-[9px] text-[#0B1C3D] font-medium mb-0.5">{ob.label}</div>
              <div className="w-full bg-[#E3DFD5] rounded-full h-1">
                <div className={`h-1 rounded-full ${ob.done ? 'bg-green-500' : 'bg-[#8B9BB4]'}`} style={{ width: `${ob.pct}%` }} />
              </div>
            </div>
            <span className="text-[9px] text-[#8B9BB4]">{ob.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Animated counter hook
// ─────────────────────────────────────────────────────────
function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, end, duration, start]);

  return { count, ref };
}

// ─────────────────────────────────────────────────────────
// Countdown hook
// ─────────────────────────────────────────────────────────
function useCountdown() {
  const deadline = useMemo(() => new Date('2026-08-02T00:00:00Z'), []);
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) return;
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return t;
}

// ─────────────────────────────────────────────────────────
// 1. HERO SECTION
// ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24"
      style={{ background: '#0B1C3D' }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Spark glow blob — top right */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(232,255,71,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border overflow-hidden mb-6"
              style={{
                background: 'rgba(232,255,71,0.07)',
                borderColor: 'rgba(232,255,71,0.2)',
                color: 'rgba(232,255,71,0.7)',
              }}
            >
              <span
                className="absolute inset-0 -translate-x-full"
                style={{
                  background: 'linear-gradient(90deg,transparent,rgba(232,255,71,0.12),transparent)',
                  animation: 'shimmer 3s ease-in-out infinite 1s',
                }}
              />
              <Sparkles className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10 text-sm font-light tracking-[0.05em]">
                Cumplimiento del AI Act con IA
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 leading-tight"
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 900,
                fontSize: 'clamp(44px, 8vw, 96px)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#F0EEE8',
              }}
            >
              Cumple con el{' '}
              <span style={{ color: '#E8FF47', fontStyle: 'italic' }}>
                AI Act
              </span>{' '}
              sin complicaciones
            </motion.h1>

            {/* Descriptor */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="text-sm mb-2 tracking-[0.32em] uppercase font-light"
              style={{ color: 'rgba(139,155,180,0.5)' }}
            >
              AI Act Compliance Platform
            </motion.p>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-lg sm:text-xl mb-8 leading-relaxed max-w-xl font-light"
              style={{ color: '#8B9BB4' }}
            >
              CumplIA automatiza la gestión de riesgos, obligaciones y documentación de tus sistemas de IA.
              De semanas a horas — con inteligencia artificial incluida.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <Link href="/register">
                <button
                  className="relative overflow-hidden text-base px-8 py-[14px] h-auto w-full sm:w-auto group transition-all"
                  style={{
                    background: '#E8FF47',
                    color: '#0B1C3D',
                    fontWeight: 500,
                    borderRadius: 7,
                    fontFamily: '"Geist", system-ui, sans-serif',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#d4ec2e')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#E8FF47')}
                >
                  <span
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    Empezar gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </button>
              </Link>
              <a href="#how-it-works">
                <button
                  className="text-base px-8 py-[14px] h-auto w-full sm:w-auto transition-all"
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(240,238,232,0.6)',
                    fontWeight: 300,
                    borderRadius: 7,
                    fontFamily: '"Geist", system-ui, sans-serif',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,238,232,0.85)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,238,232,0.6)';
                  }}
                >
                  <span className="flex items-center justify-center">
                    <Play className="mr-2 h-4 w-4" />
                    Cómo funciona
                  </span>
                </button>
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-light"
              style={{ color: 'rgba(139,155,180,0.6)' }}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" style={{ color: '#E8FF47' }} />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" style={{ color: '#E8FF47' }} />
                <span>Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" style={{ color: '#E8FF47' }} />
                <span>Cancela cuando quieras</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
            style={{ perspective: '1200px' }}
          >
            <div
              className="absolute -inset-8 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 60% 40%, rgba(232,255,71,0.06) 0%, rgba(11,28,61,0.4) 50%, transparent 75%)',
                filter: 'blur(32px)',
              }}
            />
            <div
              style={{
                transform: 'rotateX(3deg) rotateY(-4deg)',
                animation: 'float 5s ease-in-out infinite',
              }}
            >
              <DashboardMockup />
            </div>
          </motion.div>
        </div>

        {/* Mobile mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="lg:hidden mt-10"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 2. STATS SECTION
// ─────────────────────────────────────────────────────────
function StatItem({ icon: Icon, value, suffix, label, isSpark }: {
  icon: any; value: number; suffix: string; label: string; isSpark: boolean;
}) {
  const { count, ref } = useCountUp(value, 1800);
  return (
    <div ref={ref} className="text-center relative group">
      <div
        className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
        style={{ background: isSpark ? 'rgba(232,255,71,0.12)' : 'rgba(139,155,180,0.12)' }}
      >
        <Icon className="h-5 w-5" style={{ color: isSpark ? '#E8FF47' : '#8B9BB4' }} />
      </div>
      <div
        className="text-4xl lg:text-5xl font-bold mb-1"
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          color: isSpark ? '#E8FF47' : '#F0EEE8',
        }}
      >
        {count}{suffix}
      </div>
      <div className="text-sm max-w-[140px] mx-auto leading-snug font-light" style={{ color: 'rgba(139,155,180,0.7)' }}>{label}</div>
    </div>
  );
}

function StatsSection() {
  const stats = [
    { icon: Building2, value: 50, suffix: '+', label: 'Factores de riesgo catalogados', isSpark: true },
    { icon: Scale,    value: 4,   suffix: '',    label: 'Niveles de riesgo AI Act cubiertos', isSpark: false },
    { icon: FileText, value: 100, suffix: '%',  label: 'Generación automática de informes', isSpark: true },
    { icon: Clock,    value: 5,   suffix: 'min', label: 'Para tener tu primer sistema clasificado', isSpark: false },
  ];

  return (
    <section className="py-14 relative overflow-hidden" style={{ background: '#0B1C3D' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────
// 3. PROBLEM SECTION
// ─────────────────────────────────────────────────────────
function ProblemSection() {
  const pains = [
    {
      icon: AlertCircle,
      title: 'Incertidumbre jurídica',
      desc: 'El AI Act son 458 artículos de requisitos técnicos y legales. Las sanciones llegan al 7% de facturación global — y la fecha límite ya está encima.',
      stat: '7% de facturación',
      statLabel: 'Sanción máxima',
    },
    {
      icon: Clock,
      title: 'Semanas perdidas',
      desc: 'Clasificar manualmente cada sistema, identificar obligaciones y redactar documentación consume semanas de trabajo de tu equipo de compliance y legal.',
      stat: '6-8 semanas',
      statLabel: 'Tiempo medio sin herramientas',
    },
    {
      icon: FileText,
      title: 'Documentación imposible',
      desc: 'FRIA, registro técnico, análisis de riesgos, supervisión humana… Cada sistema de IA requiere docenas de documentos diferentes y actualizados.',
      stat: '20+ documentos',
      statLabel: 'Por sistema de alto riesgo',
    },
  ];

  return (
    <section className="py-20 bg-[#FAFAF8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">El problema real</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D] mb-4">
            El AI Act es complejo. Sin las herramientas adecuadas, es un calvario.
          </h2>
          <p className="text-[#8B9BB4]">
            Miles de empresas en Europa luchan con los mismos problemas. ¿Te suena familiar?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">
          {pains.map((pain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-red-100 bg-red-50/50"
            >
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <pain.icon className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-[#0B1C3D] mb-2">{pain.title}</h3>
              <p className="text-sm text-[#8B9BB4] mb-4 leading-relaxed">{pain.desc}</p>
              <div className="pt-3 border-t border-red-100">
                <div className="text-xl font-bold text-red-500">{pain.stat}</div>
                <div className="text-xs text-[#8B9BB4]">{pain.statLabel}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transition */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0B1C3D]/[0.07] border border-[#0B1C3D]/25">
            <CheckCircle className="w-5 h-5 text-[#0B1C3D]" />
            <span className="font-semibold text-[#0B1C3D]">CumplIA resuelve los tres problemas de una vez</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 4. HOW IT WORKS
// ─────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: FolderKanban,
      title: 'Registra tus sistemas de IA',
      desc: 'Añade cada sistema de IA que utilizas: nombre, sector, descripción y contexto de uso. En minutos tienes tu inventario completo centralizado.',
      detail: 'Formulario guiado + importación masiva',
      color: 'from-[#0B1C3D]/20 to-[#0B1C3D]/5',
      iconColor: 'text-[#0B1C3D]',
      borderColor: 'border-[#0B1C3D]/30',
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'IA clasifica y analiza riesgos',
      desc: 'Nuestro asistente de IA lee la descripción de tu sistema, lo clasifica según el AI Act y propone los factores de riesgo aplicables de nuestro catálogo de 50+ riesgos.',
      detail: 'Clasificación automática + análisis de riesgos IA',
      color: 'from-[#8B9BB4]/20 to-[#8B9BB4]/5',
      iconColor: 'text-[#8B9BB4]',
      borderColor: 'border-[#8B9BB4]/30',
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'Gestiona obligaciones y genera documentos',
      desc: 'Sigue el progreso de tus obligaciones artículo por artículo, mitiga riesgos, sube evidencias y genera informes PDF de cumplimiento listos para auditores.',
      detail: 'Informes PDF automáticos + exportación',
      color: 'from-green-100 to-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F0EEE8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0B1C3D] mb-3">Cómo funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D] mb-4">
            De cero a cumplimiento en 3 pasos
          </h2>
          <p className="text-[#8B9BB4]">
            Sin consultores externos ni hojas de cálculo. Solo un flujo guiado con IA que hace el trabajo pesado por ti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
          {/* Connector line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="hidden md:block absolute top-[52px] left-[calc(33.33%+28px)] right-[calc(33.33%+28px)] h-0.5 bg-gradient-to-r from-[#0B1C3D]/50 via-[#8B9BB4]/50 to-green-300/50 z-0 origin-left"
          />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`relative p-6 rounded-2xl bg-gradient-to-b ${step.color} border ${step.borderColor}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  {/* Glow ring */}
                  <div className={`absolute inset-0 rounded-xl opacity-50 blur-md scale-125 ${step.number === '01' ? 'bg-[#E8FF47]/40' : step.number === '02' ? 'bg-[#8B9BB4]/40' : 'bg-green-400/30'}`} />
                  <div className="relative w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-white/80">
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                </div>
                <span className="text-3xl font-bold text-[#E3DFD5]/60">{step.number}</span>
              </div>
              <h3 className="text-base font-bold text-[#0B1C3D] mb-2">{step.title}</h3>
              <p className="text-sm text-[#8B9BB4] leading-relaxed mb-4">{step.desc}</p>
              <div className="flex items-center gap-1.5 text-xs text-[#8B9BB4]">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>{step.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 5. AI CLASSIFICATION DEMO (Interactive showcase)
// ─────────────────────────────────────────────────────────
function AIClassificationDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    if (!isAuto) return;
    const id = setInterval(() => setActiveStep(s => (s + 1) % 3), 3200);
    return () => clearInterval(id);
  }, [isAuto]);

  const steps = [
    {
      icon: FolderKanban,
      title: 'Describes tu sistema',
      desc: 'Añades el nombre, descripción y sector de tu sistema de IA en un formulario guiado.',
      color: 'text-[#0B1C3D]',
      bg: 'bg-[#0B1C3D]/[0.07]',
    },
    {
      icon: Sparkles,
      title: 'La IA analiza el contexto',
      desc: 'El asistente lee tu descripción, identifica el sector y evalúa el impacto potencial del sistema.',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      icon: ShieldCheck,
      title: 'Clasificación instantánea',
      desc: 'Obtienes el nivel de riesgo según el AI Act, los artículos aplicables y las obligaciones a cumplir.',
      color: 'text-[#8B9BB4]',
      bg: 'bg-[#8B9BB4]/10',
    },
  ];

  const panels = [
    /* Step 0 — Input form mockup */
    <div key="input" className="space-y-3">
      <div className="text-xs font-semibold text-[#8B9BB4] uppercase tracking-wider mb-4">Nuevo sistema de IA</div>
      {[
        { label: 'Nombre', value: 'Scoring de Crédito v2' },
        { label: 'Sector', value: 'Finanzas y seguros' },
      ].map(f => (
        <div key={f.label}>
          <div className="text-[10px] text-[#8B9BB4] mb-1">{f.label}</div>
          <div className="bg-[#F0EEE8] border border-[#E3DFD5] rounded-lg px-3 py-2 text-xs text-[#0B1C3D] font-medium">{f.value}</div>
        </div>
      ))}
      <div>
        <div className="text-[10px] text-[#8B9BB4] mb-1">Descripción</div>
        <div className="bg-[#F0EEE8] border border-[#E3DFD5] rounded-lg px-3 py-2.5 text-xs text-[#0B1C3D] leading-relaxed">
          Modelo que evalúa la solvencia de personas para la concesión de préstamos personales basado en historial crediticio y datos socioeconómicos.
        </div>
      </div>
      <button className="w-full mt-2 py-2.5 rounded-lg bg-[#E8FF47] text-[#0B1C3D] text-xs font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" /> Clasificar con IA
      </button>
    </div>,

    /* Step 1 — AI thinking */
    <div key="thinking" className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-purple-500" />
        </div>
        <span className="text-xs font-semibold text-[#0B1C3D]">Asistente IA analizando…</span>
        <div className="flex gap-1 ml-auto">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
      {[
        '✦ Analizando sector: Finanzas → Servicios esenciales',
        '✦ Evaluando impacto: decisiones crediticias afectan acceso a recursos financieros',
        '✦ Consultando Anexo III del AI Act...',
        '✦ Verificando Art. III punto 5(b): evaluación solvencia crediticia',
        '✦ Clasificando nivel de riesgo...',
      ].map((line, i) => (
        <div
          key={i}
          className="text-[10px] text-[#8B9BB4] font-mono bg-[#F0EEE8] rounded px-2.5 py-1.5 border border-[#E3DFD5]"
          style={{ animation: `typing 0.3s ease-out ${i * 0.15}s both` }}
        >
          {line}
        </div>
      ))}
    </div>,

    /* Step 2 — Result */
    <div key="result" className="space-y-3">
      <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Clasificación AI Act</span>
          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Completado</span>
        </div>
        <div className="text-2xl font-bold text-orange-600 mb-1">Alto Riesgo</div>
        <div className="text-[10px] text-orange-700/70">Anexo III, punto 5(b) — Evaluación solvencia crediticia</div>
      </div>
      <div className="p-3 rounded-xl bg-[#F0EEE8] border border-[#E3DFD5]">
        <div className="text-[10px] font-semibold text-[#0B1C3D] mb-1.5">Justificación del asistente</div>
        <p className="text-[10px] text-[#8B9BB4] leading-relaxed">
          Sistema que determina el acceso a recursos financieros esenciales mediante evaluación automatizada de personas físicas. Cumple criterios del Anexo III del Reglamento (UE) 2024/1689.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-center">
          <div className="text-base font-bold text-red-500">8</div>
          <div className="text-[9px] text-red-500/70">obligaciones</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#8B9BB4]/10 border border-[#8B9BB4]/20 text-center">
          <div className="text-base font-bold text-[#8B9BB4]">12</div>
          <div className="text-[9px] text-[#8B9BB4]/70">riesgos a gestionar</div>
        </div>
      </div>
      <button className="w-full py-2.5 rounded-lg bg-[#0B1C3D] text-[#E8FF47] text-xs font-semibold">
        Iniciar gestión de cumplimiento →
      </button>
    </div>,
  ];

  return (
    <section className="py-20 bg-[#FAFAF8] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8B9BB4] mb-3">La plataforma en acción</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D] mb-4">
            De la descripción a la clasificación en segundos
          </h2>
          <p className="text-[#8B9BB4]">
            Nuestro asistente IA toma el contexto de tu sistema y lo clasifica automáticamente según el AI Act.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Steps */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.button
                key={i}
                onClick={() => { setIsAuto(false); setActiveStep(i); }}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  activeStep === i
                    ? 'border-[#0B1C3D]/40 bg-white shadow-[0_8px_32px_rgba(11,28,61,0.10)]'
                    : 'border-[#E3DFD5] bg-[#F0EEE8] hover:border-[#0B1C3D]/20'
                }`}
                whileHover={{ x: activeStep === i ? 0 : 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${activeStep === i ? step.bg : 'bg-[#E3DFD5]'} flex items-center justify-center flex-shrink-0 transition-colors duration-300`}>
                    <step.icon className={`w-4.5 h-4.5 ${activeStep === i ? step.color : 'text-[#8B9BB4]'} transition-colors duration-300`} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold transition-colors duration-300 ${activeStep === i ? 'text-[#0B1C3D]' : 'text-[#8B9BB4]'}`}>
                      <span className="text-[#E3DFD5] mr-2 font-normal">0{i + 1}</span>
                      {step.title}
                    </div>
                    {activeStep === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-[#8B9BB4] mt-1 leading-relaxed"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </div>
                  {activeStep === i && (
                    <div className="ml-auto w-1.5 h-8 rounded-full bg-[#E8FF47]" />
                  )}
                </div>
                {/* Progress bar */}
                {activeStep === i && isAuto && (
                  <div className="mt-3 h-0.5 bg-[#E3DFD5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E8FF47] rounded-full"
                      style={{ animation: 'shimmer-bar 3.2s linear forwards' }}
                    />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Right: Panel */}
          <div className="relative">
            <div className="rounded-2xl border border-[#E3DFD5] bg-white overflow-hidden shadow-xl">
              <div className="bg-[#F0EEE8] border-b border-[#E3DFD5] px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-[#8B9BB4] ml-1">app.cumplia.com/dashboard/inventory/nuevo</span>
              </div>
              <div className="p-5 min-h-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {panels[activeStep]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Glow */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(224,158,80,0.3) 0%, rgba(140,189,185,0.2) 60%, transparent 80%)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 6. FEATURES BENTO GRID
// ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: FolderKanban,
      title: 'Inventario centralizado de IA',
      desc: 'Registra y gestiona todos tus sistemas de IA en un único lugar. Sector, responsable, proveedor, estado — todo controlado.',
      size: 'lg',
      color: 'bg-gradient-to-br from-[#0B1C3D]/10 to-white',
    },
    {
      icon: Sparkles,
      title: 'Clasificación automática con IA',
      desc: 'El asistente lee la descripción de tu sistema y lo clasifica en segundos según los 4 niveles del AI Act.',
      size: 'sm',
      color: 'bg-gradient-to-br from-purple-50 to-white',
    },
    {
      icon: Shield,
      title: 'Catálogo de 50+ riesgos',
      desc: 'Base de conocimiento con todos los factores de riesgo relevantes del AI Act, categorizados por criticidad y nivel de riesgo.',
      size: 'sm',
      color: 'bg-gradient-to-br from-orange-50 to-white',
    },
    {
      icon: Bot,
      title: 'Análisis de riesgos con IA',
      desc: 'El asistente IA analiza tu sistema, hace preguntas, propone los factores de riesgo aplicables y los justifica. Tú solo revisas y apruebas.',
      size: 'lg',
      color: 'bg-gradient-to-br from-[#8B9BB4]/10 to-white',
    },
    {
      icon: BarChart3,
      title: 'Seguimiento de obligaciones',
      desc: 'Cada artículo del AI Act traducido a acciones concretas. Marca progreso, sube evidencias, ve el % de cumplimiento por sistema.',
      size: 'sm',
      color: 'bg-gradient-to-br from-blue-50 to-white',
    },
    {
      icon: Download,
      title: 'Informes PDF automáticos',
      desc: 'Genera informes de cumplimiento listos para auditores externos con un clic. Incluye riesgos, obligaciones y evidencias.',
      size: 'sm',
      color: 'bg-gradient-to-br from-green-50 to-white',
    },
    {
      icon: CalendarClock,
      title: 'Timeline regulatorio',
      desc: 'Visualiza las fechas clave del AI Act y mantén a tu equipo al día de los plazos de cumplimiento que aplican a tu organización.',
      size: 'sm',
      color: 'bg-gradient-to-br from-rose-50 to-white',
    },
    {
      icon: Users,
      title: 'Gestión de equipos y roles',
      desc: 'Colabora con admin, compliance officer, auditor y viewer. Cada rol ve solo lo que necesita y puede hacer solo lo que le corresponde.',
      size: 'sm',
      color: 'bg-gradient-to-br from-indigo-50 to-white',
    },
    {
      icon: History,
      title: 'Registro de actividad (Audit Log)',
      desc: 'Trazabilidad completa de cada cambio en la plataforma. Quién hizo qué y cuándo — imprescindible para auditorías.',
      size: 'sm',
      color: 'bg-gradient-to-br from-amber-50 to-white',
    },
    {
      icon: CheckSquare,
      title: 'Mi trabajo',
      desc: 'Cada usuario ve sus tareas pendientes y su progreso personal. Nada se pierde, nadie se bloquea.',
      size: 'sm',
      color: 'bg-gradient-to-br from-teal-50 to-white',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#F0EEE8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0B1C3D] mb-3">Funcionalidades</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D] mb-4">
            Todo lo que necesitas, nada que no necesitas
          </h2>
          <p className="text-[#8B9BB4]">
            Cada funcionalidad está construida para el caso de uso real del compliance del AI Act — no para el caso genérico.
          </p>
        </div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group p-6 rounded-2xl border border-[#E3DFD5] hover:border-[#0B1C3D]/40 hover:shadow-[0_8px_40px_rgba(224,158,80,0.12)] transition-all duration-300 ${feature.color} ${
                feature.size === 'lg' ? 'lg:col-span-1' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#E3DFD5] flex items-center justify-center mb-4 group-hover:border-[#0B1C3D]/30 group-hover:bg-[#E8FF47]/8 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-5 h-5 text-[#0B1C3D]" />
              </div>
              <h3 className="text-base font-bold text-[#0B1C3D] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#8B9BB4] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 7. AI ACT LEVELS
// ─────────────────────────────────────────────────────────
function AIActSection() {
  const levels = [
    {
      icon: Lock,
      title: 'Prohibido',
      badge: 'No desplegable',
      badgeColor: 'bg-red-100 text-red-600',
      desc: 'Sistemas prohibidos en la UE: manipulación subliminal, puntuación social masiva, vigilancia biométrica no autorizada.',
      examples: 'Social scoring, manipulación conductual',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      icon: AlertTriangle,
      title: 'Alto Riesgo',
      badge: 'Cumplimiento estricto',
      badgeColor: 'bg-orange-100 text-orange-600',
      desc: 'Requieren evaluación de conformidad, registro técnico, FRIA, supervisión humana y gestión de riesgos documentada.',
      examples: 'Salud, empleo, justicia, infraestructuras críticas',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      icon: Eye,
      title: 'Riesgo Limitado',
      badge: 'Transparencia obligatoria',
      badgeColor: 'bg-blue-100 text-blue-600',
      desc: 'Obligación de informar al usuario que está interactuando con un sistema de IA. Menos requisitos técnicos.',
      examples: 'Chatbots, deepfakes, contenido generado por IA',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: Star,
      title: 'Riesgo Mínimo',
      badge: 'Voluntario',
      badgeColor: 'bg-green-100 text-green-600',
      desc: 'Sin obligaciones específicas del AI Act. Se recomienda seguir buenas prácticas voluntariamente.',
      examples: 'Filtros de spam, recomendadores básicos, juegos',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <section id="who-applies" className="py-20 bg-[#FAFAF8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8B9BB4] mb-3">Marco del AI Act</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D] mb-4">
            ¿A qué nivel de riesgo pertenece tu sistema?
          </h2>
          <p className="text-[#8B9BB4]">
            El AI Act clasifica los sistemas según el riesgo que suponen. CumplIA te ayuda a identificarlo automáticamente.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <div className="p-4 rounded-xl bg-[#E8FF47]/8 border border-[#0B1C3D]/20 text-center">
            <p className="text-sm text-[#0B1C3D]">
              <strong>Aplica a todas las empresas</strong> que usen o desarrollen IA en la UE —
              independientemente del tamaño o sector. Desde agosto 2026 con sanciones activas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {levels.map((level, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-5 rounded-2xl border ${level.borderColor} bg-white hover:shadow-md transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-xl ${level.iconBg} flex items-center justify-center mb-3`}>
                <level.icon className={`w-5 h-5 ${level.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-[#0B1C3D] mb-1">{level.title}</h3>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-3 ${level.badgeColor}`}>
                {level.badge}
              </span>
              <p className="text-xs text-[#8B9BB4] leading-relaxed mb-3">{level.desc}</p>
              <p className="text-xs text-[#8B9BB4]">
                <strong className="text-[#0B1C3D]">Ej:</strong> {level.examples}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────
// 9. PRICING
// ─────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Evalúa',
      price: '0€',
      period: '/mes',
      description: 'Conoce la plataforma y evalúa tus primeros sistemas de IA',
      features: [
        '3 sistemas de IA',
        '1 usuario administrador',
        'Clasificación AI Act automática',
        'Obligaciones básicas',
        'Checklist de cumplimiento',
      ],
      cta: 'Empezar gratis',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Cumple',
      price: '399€',
      period: '/mes',
      description: 'Para PYMEs y consultoras que necesitan cumplir con el AI Act',
      features: [
        'Hasta 15 sistemas de IA',
        'Hasta 3 usuarios administradores',
        'Funcionalidades completas',
        'IA generativa incluida',
        'FRIA completa (Art. 27)',
        'Registro de evidencias',
        'Soporte email prioritario',
      ],
      cta: 'Elegir Cumple',
      href: '/register?plan=professional',
      highlight: true,
      badge: 'Más popular',
    },
    {
      name: 'Protege',
      price: '899€',
      period: '/mes',
      description: 'Para empresas con múltiples departamentos y más sistemas de IA',
      features: [
        'Hasta 50 sistemas de IA',
        'Hasta 10 usuarios administradores',
        'Funcionalidades completas',
        'IA generativa incluida',
        'Plantillas personalizadas',
        'Multi-departamento',
        'Soporte prioritario',
      ],
      cta: 'Elegir Protege',
      href: '/register?plan=business',
      highlight: false,
    },
    {
      name: 'Lidera',
      price: '2.499€+',
      period: '/mes',
      description: 'Soluciones a medida para grandes organizaciones',
      features: [
        'Sistemas de IA ilimitados',
        'Usuarios administradores ilimitados',
        'Funcionalidades completas',
        'IA generativa incluida',
        'SSO / SAML',
        'SLA garantizado',
        'Account manager dedicado',
      ],
      cta: 'Contactar ventas',
      href: 'mailto:sales@cumplia.com',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-[#FAFAF8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0B1C3D] mb-3">Precios</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D] mb-4">
            Planes para cada etapa
          </h2>
          <p className="text-[#8B9BB4]">
            Empieza gratis, escala cuando lo necesites. Sin sorpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'bg-[#0B1C3D] text-white shadow-2xl shadow-[#0B1C3D]/30 scale-[1.02] hover:shadow-[0_24px_60px_rgba(45,62,78,0.35)]'
                  : 'bg-white border border-[#E3DFD5] hover:border-[#0B1C3D]/30 hover:shadow-[0_8px_40px_rgba(224,158,80,0.08)]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#E8FF47] text-[#0B1C3D] text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#0B1C3D]'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.originalPrice && (
                    <span className={`text-sm line-through ${plan.highlight ? 'text-white/40' : 'text-[#8B9BB4]'}`}>
                      {plan.originalPrice}€
                    </span>
                  )}
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0B1C3D]'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-[#8B9BB4]'}`}>
                    {plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <p className="text-xs font-medium text-green-400">{plan.savings}</p>
                )}
                <p className={`text-xs mt-2 ${plan.highlight ? 'text-white/60' : 'text-[#8B9BB4]'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-[#E8FF47]' : 'text-green-500'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-[#8B9BB4]'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`relative overflow-hidden w-full py-5 h-auto text-sm font-semibold group ${
                    plan.highlight
                      ? 'bg-[#E8FF47] hover:bg-[#d4ec2e] text-[#0B1C3D] shadow-lg shadow-[#E8FF47]/25 font-[500]'
                      : 'bg-[#F0EEE8] hover:bg-[#E3DFD5] text-[#0B1C3D] border border-[#E3DFD5]'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  )}
                  <span className="relative z-10">{plan.cta}</span>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-[#8B9BB4] mt-8">
          Todos los planes incluyen acceso completo durante 14 días de prueba. Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 10. FAQ
// ─────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿El AI Act ya está en vigor? ¿Tengo que cumplir ahora?',
      a: 'El AI Act entró en vigor en agosto de 2024. Las prohibiciones aplican desde febrero de 2025. Las obligaciones para sistemas de alto riesgo entran en vigor en agosto de 2026. Es fundamental empezar el proceso de cumplimiento ahora para llegar a tiempo.',
    },
    {
      q: '¿Cómo sé si mi sistema de IA es de alto riesgo?',
      a: 'El AI Act define los sistemas de alto riesgo en el Anexo III: biometría, infraestructuras críticas, educación, empleo, servicios esenciales, justicia y seguridad. CumplIA te ayuda a clasificar automáticamente tu sistema en segundos mediante nuestro asistente de IA.',
    },
    {
      q: '¿Qué es una FRIA y por qué la necesito?',
      a: 'La Evaluación de Impacto en los Derechos Fundamentales (FRIA) es obligatoria para sistemas de alto riesgo desplegados por organismos públicos o que afecten a la prestación de servicios públicos. CumplIA genera la estructura de la FRIA adaptada a tu sistema (Art. 27).',
    },
    {
      q: '¿CumplIA sustituye a un consultor legal?',
      a: 'CumplIA automatiza el trabajo técnico y de documentación, pero no sustituye el asesoramiento jurídico para casos complejos. Lo que sí hace es reducir drásticamente el tiempo (y coste) que necesitas de consultores externos, aportando la estructura y la documentación base.',
    },
    {
      q: '¿Puedo empezar gratis y migrar mis datos si cambio de plan?',
      a: 'Sí. El plan Evalúa es gratuito sin límite de tiempo para hasta 3 sistemas de IA. Si creces, puedes migrar a Cumple, Protege o Lidera en cualquier momento y todos tus datos, riesgos y documentos se conservan íntegramente.',
    },
    {
      q: '¿Mis datos están seguros? ¿Cumplís el RGPD?',
      a: 'CumplIA está construido sobre infraestructura europea (Supabase/AWS EU), cumple con el RGPD y sus datos nunca se utilizan para entrenar modelos de IA. Puedes solicitar la exportación o eliminación de datos en cualquier momento.',
    },
  ];

  return (
    <section className="py-20 bg-[#F0EEE8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0B1C3D] mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1C3D]">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-[#E3DFD5] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F0EEE8] transition-colors"
              >
                <span className="text-sm font-semibold text-[#0B1C3D] pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#8B9BB4] flex-shrink-0 transition-transform duration-200 ${
                    open === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-[#8B9BB4] leading-relaxed border-t border-[#E3DFD5] pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 11. FINAL CTA
// ─────────────────────────────────────────────────────────
function CTASection() {
  const { days, hours, minutes, seconds } = useCountdown();
  return (
    <section className="py-20 bg-[#0B1C3D] relative overflow-hidden">
      {/* Grid mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Floating orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,255,71,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,155,180,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 11s ease-in-out infinite reverse 2s',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E8FF47]/15 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-2xl bg-[#0B1C3D]/[0.07] scale-150 blur-lg" />
            <Shield className="w-8 h-8 text-[#E8FF47] relative z-10" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Agosto 2026 se acerca.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #E8FF47 0%, #F0C070 50%, #E8FF47 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 4s ease-in-out infinite',
              }}
            >
              Empieza hoy.
            </span>
          </h2>

          {/* Countdown */}
          <div className="flex justify-center gap-3 mb-8">
            {[
              { value: days, label: 'días' },
              { value: hours, label: 'horas' },
              { value: minutes, label: 'min' },
              { value: seconds, label: 'seg' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] text-[#8B9BB4]/60 mt-1 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8B9BB4]/50 -mt-4 mb-8">hasta la entrada en vigor plena del AI Act (agosto 2026)</p>

          <p className="text-lg text-[#8B9BB4] mb-8 leading-relaxed">
            Cada semana que no actúas, el trabajo crece. Regístrate gratis y
            ten tu primer sistema clasificado en menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#E8FF47] hover:bg-[#d4ec2e] text-[#0B1C3D] text-base px-8 py-6 h-auto shadow-lg shadow-[#E8FF47]/30 hover:shadow-[#E8FF47]/40 transition-all w-full sm:w-auto font-[500]"
              >
                Empezar gratis — sin tarjeta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 h-auto border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Ver todos los planes
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-[#8B9BB4]/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#E8FF47]" />
              14 días de prueba
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#E8FF47]" />
              Sin compromisos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#E8FF47]" />
              Soporte incluido
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F0EEE8]">
      <Header />
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <HowItWorksSection />
      <AIClassificationDemo />
      <FeaturesSection />
      <AIActSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
