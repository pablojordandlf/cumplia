import styles from '@/styles/sections.module.css';

const CARDS = [
  { num: '7%',  unit: 'sanción máxima',    title: 'Incertidumbre jurídica',  desc: 'El AI Act son 458 artículos de requisitos técnicos y legales. Las sanciones llegan al 7% de facturación global — y la fecha límite ya está encima.' },
  { num: '6–8', unit: 'semanas perdidas',   title: 'Tiempo desperdiciado',    desc: 'Clasificar manualmente cada sistema, identificar obligaciones y redactar documentación consume semanas de trabajo de tu equipo de compliance y legal.' },
  { num: '20+', unit: 'documentos por sistema', title: 'Documentación imposible', desc: 'FRIA, registro técnico, análisis de riesgos, supervisión humana… Cada sistema de IA requiere docenas de documentos diferentes y actualizados.' },
];

export default function ProblemaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.tag} data-fade>El problema real</div>
      <h2 data-fade>
        El AI Act es complejo.<br />
        Sin las herramientas adecuadas,<br />
        <em>es un calvario.</em>
      </h2>
      <p className={styles.sub} data-fade>
        Miles de empresas en Europa luchan con los mismos problemas.
      </p>

      <div className={styles.probGrid}>
        {CARDS.map((c, i) => (
          <div
            key={c.title}
            className={styles.probCard}
            data-fade
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div className={styles.probNum}>{c.num}</div>
            <div className={styles.probUnit}>{c.unit}</div>
            <div className={styles.probTitle}>{c.title}</div>
            <div className={styles.probDesc}>{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
