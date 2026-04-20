'use client';

import { useState } from 'react';
import styles from '@/styles/sections.module.css';

const FAQS = [
  {
    q: '¿El AI Act ya está en vigor? ¿Tengo que cumplir ahora?',
    a: 'Sí, el AI Act está en vigor desde febrero 2025. Las obligaciones para sistemas de alto riesgo entran en aplicación plena en agosto 2026. Ya es el momento de actuar: identificar tus sistemas, clasificarlos y empezar a preparar la documentación.',
  },
  {
    q: '¿Cómo sé si mi sistema de IA es de alto riesgo?',
    a: 'El AI Act define en el Anexo III los sistemas de alto riesgo: aquellos usados en sectores como salud, empleo, educación, crédito, justicia o infraestructuras críticas. CumplIA clasifica automáticamente tus sistemas en segundos.',
  },
  {
    q: '¿Qué es una FRIA y por qué la necesito?',
    a: 'La FRIA (Fundamental Rights Impact Assessment) es una evaluación obligatoria para ciertos sistemas de alto riesgo bajo el Art. 27. Analiza el impacto del sistema en los derechos fundamentales de las personas. CumplIA la genera automáticamente.',
  },
  {
    q: '¿CumplIA sustituye a un consultor legal?',
    a: 'CumplIA automatiza el 90% del trabajo operativo de compliance: inventario, clasificación, análisis de riesgos y documentación. Para casos muy complejos puede ser útil un asesor legal — pero CumplIA les ahorra semanas de trabajo.',
  },
  {
    q: '¿Mis datos están seguros? ¿Cumplís el RGPD?',
    a: 'Sí. CumplIA está alojado en servidores dentro de la UE, cumple el RGPD y aplica cifrado en tránsito y en reposo. Somos una empresa de compliance — la seguridad no es opcional para nosotros.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={styles.section} style={{ paddingTop: 0 }}>
      <div className={styles.tag} data-fade>FAQ</div>
      <h2 data-fade>Preguntas frecuentes</h2>

      <div className={styles.faqList} data-fade>
        {FAQS.map((f, i) => (
          <div
            key={i}
            className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}
          >
            <div className={styles.faqQ} onClick={() => setOpen(open === i ? null : i)}>
              {f.q}
              <span className={styles.faqIcon}>+</span>
            </div>
            <div className={styles.faqA}>{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
