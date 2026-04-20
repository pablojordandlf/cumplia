'use client';

import { Fragment, useEffect } from 'react';
import HeroCanvas from './HeroCanvas';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from '@/styles/hero.module.css';

export default function HeroSection() {
  useScrollAnimation();

  return (
    <section className={styles.hero}>
      <HeroCanvas />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          EU AI Act · Agosto 2026
        </div>

        <h1 className={styles.h1}>
          Cumple con el AI Act<br />
          <em>sin complicaciones</em>
        </h1>

        <p className={styles.sub}>
          CumplIA automatiza la gestión de riesgos, obligaciones y documentación
          de tus sistemas de IA. De semanas a horas — con inteligencia artificial incluida.
        </p>

        <div className={styles.actions}>
          <a href="/register" className={styles.btnPrimary}>
            Empieza hoy gratis →
          </a>
          <a href="#how-it-works" className={styles.btnSecondary}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z" fill="currentColor" />
            </svg>
            Ver cómo funciona
          </a>
        </div>
      </div>

      <div className={styles.stats} data-fade>
        {[
          { val: '50+',   lbl: 'Factores de riesgo' },
          { val: '−90%',  lbl: 'Tiempo de auditoría' },
          { val: '100%',  lbl: 'Informes automáticos' },
          { val: '5min',  lbl: 'Primer sistema clasificado' },
        ].map((s, i) => (
          <Fragment key={s.val}>
            {i > 0 && <div className={styles.statDiv} />}
            <div className={styles.stat}>
              <div className={styles.statVal}>{s.val}</div>
              <div className={styles.statLbl}>{s.lbl}</div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
