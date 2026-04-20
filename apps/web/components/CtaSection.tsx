'use client';

import { Fragment, useEffect, useState } from 'react';
import styles from '@/styles/sections.module.css';

const TARGET = new Date('2026-08-02T00:00:00');

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function CtaSection() {
  const [time, setTime] = useState({ d: '--', h: '--', m: '--', s: '--' });

  useEffect(() => {
    function tick() {
      const diff = TARGET.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: '00', h: '00', m: '00', s: '00' }); return; }
      setTime({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor((diff % 86400000) / 3600000)),
        m: pad(Math.floor((diff % 3600000) / 60000)),
        s: pad(Math.floor((diff % 60000) / 1000)),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.ctaWrap}>
      <div className={styles.ctaInner}>
        <div className={styles.tag} data-fade>Agosto 2026 se acerca</div>
        <h2 data-fade>Empieza <em>hoy.</em></h2>
        <p data-fade>
          Cada semana que no actúas, el trabajo crece. Regístrate gratis y ten tu
          primer sistema clasificado en menos de 5 minutos.
        </p>

        <div className={styles.countdown} data-fade>
          {[
            { val: time.d, lbl: 'días' },
            { val: time.h, lbl: 'horas' },
            { val: time.m, lbl: 'min' },
            { val: time.s, lbl: 'seg' },
          ].map((u, i) => (
            <Fragment key={u.lbl}>
              {i > 0 && <div className={styles.cdSep}>:</div>}
              <div className={styles.cdUnit}>
                <div className={styles.cdNum}>{u.val}</div>
                <div className={styles.cdLbl}>{u.lbl}</div>
              </div>
            </Fragment>
          ))}
        </div>

        <div className={styles.ctaActions} data-fade>
          <a href="/register" className={styles.btnPrimary}>
            Empezar gratis — sin tarjeta →
          </a>
          <a href="/pricing" className={styles.btnSecondary}>
            Ver todos los planes
          </a>
        </div>

        <div className={styles.ctaTags} data-fade>
          {['14 días de prueba', 'Sin compromisos', 'Soporte incluido'].map((t) => (
            <span key={t} className={styles.ctaTag}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
