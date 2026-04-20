import styles from '@/styles/sections.module.css';

const RISKS = [
  {
    key: 'prohibido',
    tag: 'No desplegable',
    name: 'Prohibido',
    subtitle: 'Art. 5 — Prohibición absoluta',
    desc: 'Sistemas prohibidos en la UE: manipulación subliminal, puntuación social masiva, vigilancia biométrica no autorizada.',
    example: 'Social scoring, manipulación conductual',
  },
  {
    key: 'alto',
    tag: 'Cumplimiento estricto',
    name: 'Alto Riesgo',
    subtitle: 'Anexo III — Máximos requisitos',
    desc: 'Requieren evaluación de conformidad, registro técnico, FRIA, supervisión humana y gestión de riesgos documentada.',
    example: 'Salud, empleo, justicia, infraestructuras críticas',
  },
  {
    key: 'limitado',
    tag: 'Transparencia obligatoria',
    name: 'Riesgo Limitado',
    subtitle: 'Art. 50 — Transparencia',
    desc: 'Obligación de informar al usuario que está interactuando con un sistema de IA. Menos requisitos técnicos.',
    example: 'Chatbots, deepfakes, contenido generado por IA',
  },
  {
    key: 'minimo',
    tag: 'Voluntario',
    name: 'Riesgo Mínimo',
    subtitle: 'Sin obligaciones específicas',
    desc: 'Sin obligaciones específicas del AI Act. Se recomienda seguir buenas prácticas voluntariamente.',
    example: 'Filtros de spam, recomendadores básicos, juegos',
  },
];

export default function RiskSection() {
  return (
    <div className={styles.darkBg} id="who-applies">
      <section className={styles.section}>
        <div className={styles.tag} data-fade>Marco del AI Act</div>
        <h2 data-fade>
          ¿A qué nivel de riesgo<br />pertenece <em>tu sistema</em>?
        </h2>
        <p className={styles.sub} data-fade>
          El AI Act clasifica los sistemas según el riesgo que suponen. CumplIA te ayuda a identificarlo automáticamente.{' '}
          <strong style={{ color: 'var(--text)' }}>Aplica a todas las empresas</strong> que usen o desarrollen IA en la UE — desde agosto 2026 con sanciones activas.
        </p>

        <div className={styles.riskGrid}>
          {RISKS.map((r, i) => (
            <div
              key={r.key}
              className={`${styles.riskCard} ${styles[`risk_${r.key}`]}`}
              data-fade
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <span className={`${styles.riskTag} ${styles[`riskTag_${r.key}`]}`}>{r.tag}</span>
              <div className={styles.riskName}>{r.name}</div>
              <div className={styles.riskSubtitle}>{r.subtitle}</div>
              <div className={styles.riskDesc}>{r.desc}</div>
              <div className={styles.riskExample}>
                <strong>Ej:</strong> {r.example}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
