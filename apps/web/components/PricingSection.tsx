'use client';

import { useState } from 'react';
import styles from '@/styles/sections.module.css';

const PLANS = [
  {
    key: 'starter',
    name: 'STARTER',
    monthly: 0,
    period: 'Para siempre gratis',
    desc: 'Conoce la plataforma y evalúa tus primeros sistemas de IA',
    features: ['3 sistemas de IA', '1 usuario administrador', 'Clasificación AI Act automática', 'Obligaciones básicas', 'Checklist de cumplimiento'],
    cta: 'Empezar gratis',
    href: '/register',
    primary: false,
    popular: false,
  },
  {
    key: 'pro',
    name: 'PROFESSIONAL',
    monthly: 399,
    period: 'facturado mensualmente',
    desc: 'Para PYMEs y consultoras que necesitan cumplir con el AI Act',
    features: ['Hasta 15 sistemas de IA', 'Hasta 3 usuarios administradores', 'Asistente IA generativa incluido', 'FRIA completa (Art. 27)', 'Módulo de gestión de riesgos IA', 'Exportación PDF/DOCX'],
    cta: 'Elegir Professional',
    href: '/register?plan=professional',
    primary: true,
    popular: true,
  },
  {
    key: 'biz',
    name: 'BUSINESS',
    monthly: 899,
    period: 'facturado mensualmente',
    desc: 'Para empresas con múltiples departamentos y más sistemas de IA',
    features: ['Hasta 50 sistemas de IA', 'Hasta 10 usuarios administradores', 'Asistente IA generativa incluido', 'FRIA completa (Art. 27)', 'Registro de evidencias', 'Exportación PDF/DOCX'],
    cta: 'Elegir Business',
    href: '/register?plan=business',
    primary: false,
    popular: false,
  },
  {
    key: 'enterprise',
    name: 'ENTERPRISE',
    monthly: 2499,
    period: 'facturado anualmente',
    desc: 'Soluciones a medida para grandes organizaciones',
    features: ['Sistemas de IA ilimitados', 'Usuarios ilimitados', 'Asistente IA generativa incluido', 'SLA dedicado', 'Onboarding personalizado', 'Integración API'],
    cta: 'Contactar ventas',
    href: 'mailto:sales@cumplia.com',
    primary: false,
    popular: false,
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  function displayPrice(monthly: number) {
    if (monthly === 0) return '0';
    if (monthly === 2499) return '2.499+';
    return annual ? String(Math.round(monthly * 0.8)) : String(monthly);
  }

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.tag} data-fade>Precios</div>
      <h2 data-fade>Planes para cada etapa</h2>
      <p className={styles.sub} data-fade>Empieza gratis, escala cuando lo necesites. Sin sorpresas.</p>

      <div className={styles.toggleWrap} data-fade>
        <button
          className={`${styles.toggleBtn} ${!annual ? styles.toggleActive : ''}`}
          onClick={() => setAnnual(false)}
        >
          Mensual
        </button>
        <div
          className={`${styles.toggleSwitch} ${annual ? styles.toggleOn : ''}`}
          onClick={() => setAnnual((v) => !v)}
        >
          <div className={styles.toggleKnob} />
        </div>
        <button
          className={`${styles.toggleBtn} ${annual ? styles.toggleActive : ''}`}
          onClick={() => setAnnual(true)}
        >
          Anual <span className={styles.toggleBadge}>−20%</span>
        </button>
      </div>

      <div className={styles.pricingGrid} data-fade>
        {PLANS.map((p) => (
          <div key={p.key} className={`${styles.priceCard} ${p.popular ? styles.pricePopular : ''}`}>
            {p.popular && <div className={styles.popularTag}>MÁS POPULAR</div>}
            <div className={styles.planName}>{p.name}</div>
            <div className={styles.planPrice}>
              {displayPrice(p.monthly)}<span>€</span>
            </div>
            <div className={styles.planPeriod}>
              / mes · {p.key === 'enterprise' ? 'facturado anualmente' : annual ? 'facturado anualmente' : p.period}
            </div>
            <div className={styles.planDesc}>{p.desc}</div>
            <div className={styles.planFeatures}>
              {p.features.map((f) => (
                <div key={f} className={styles.planFeat}>
                  <span className={styles.featCheck}>✓</span> {f}
                </div>
              ))}
            </div>
            <a
              href={p.href}
              className={`${styles.planBtn} ${p.primary ? styles.planBtnPrimary : ''}`}
            >
              {p.cta}
            </a>
          </div>
        ))}
      </div>
      <p className={styles.pricingNote} data-fade>
        Todos los planes incluyen <strong>14 días de prueba</strong>. Sin tarjeta de crédito.
      </p>
    </section>
  );
}
