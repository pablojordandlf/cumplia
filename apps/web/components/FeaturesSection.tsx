import styles from '@/styles/sections.module.css';

const FEATURES = [
  { title: 'Inventario centralizado de IA',     desc: 'Registra y gestiona todos tus sistemas de IA en un único lugar. Sector, responsable, proveedor, estado — todo controlado.', icon: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z' },
  { title: 'Clasificación automática con IA',   desc: 'El asistente lee la descripción de tu sistema y lo clasifica en segundos según los 4 niveles del AI Act.', icon: 'M10 3l3 4h4l-3 3 1 4-5-2-5 2 1-4-3-3h4l3-4z' },
  { title: 'Catálogo de 50+ riesgos',           desc: 'Base de conocimiento con todos los factores de riesgo del AI Act, categorizados por criticidad y nivel de riesgo.', icon: 'M10 2a8 8 0 100 16A8 8 0 0010 2zM10 6v4l3 3' },
  { title: 'Análisis de riesgos con IA',        desc: 'El asistente IA analiza tu sistema, hace preguntas, propone factores de riesgo aplicables y los justifica. Tú solo revisas.', icon: 'M4 10h12M4 6h8M4 14h6' },
  { title: 'Seguimiento de obligaciones',       desc: 'Cada artículo del AI Act traducido a acciones concretas. Marca progreso, sube evidencias, ve el % de cumplimiento.', icon: 'M5 4h10a1 1 0 011 1v11l-3-2H5a1 1 0 01-1-1V5a1 1 0 011-1z' },
  { title: 'Informes PDF automáticos',          desc: 'Genera informes de cumplimiento listos para auditores externos con un clic. Incluye riesgos, obligaciones y evidencias.', icon: 'M5 3h10l2 2v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zM8 10h4M8 13h4M10 7V3' },
  { title: 'Timeline regulatorio',              desc: 'Visualiza las fechas clave del AI Act y mantén a tu equipo al día de los plazos que aplican a tu organización.', icon: 'M3 10h14M6 6l4-3 4 3M6 14l4 3 4-3' },
  { title: 'Gestión de equipos y roles',        desc: 'Colabora con admin, compliance officer, auditor y viewer. Cada rol ve solo lo que necesita y puede hacer lo que le corresponde.', icon: 'M7 8a3 3 0 100-6 3 3 0 000 6zM13 8a3 3 0 100-6 3 3 0 000 6zM1 18c0-3 3-5 6-5s6 2 6 5' },
  { title: 'Registro de actividad (Audit Log)', desc: 'Trazabilidad completa de cada cambio en la plataforma. Quién hizo qué y cuándo — imprescindible para auditorías.', icon: 'M3 5h14M3 10h14M3 15h8M16 13a3 3 0 110 4' },
];

export default function FeaturesSection() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.tag} data-fade>Funcionalidades</div>
      <h2 data-fade>
        Todo lo que necesitas,<br /><em>nada que no necesitas</em>
      </h2>
      <p className={styles.sub} data-fade>
        Cada funcionalidad está construida para el caso de uso real del compliance del AI Act.
      </p>

      <div className={styles.featGrid}>
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={styles.featCard}
            data-fade
            style={{ transitionDelay: `${(i % 3) * 0.07}s` }}
          >
            <div className={styles.featIcon}>
              <svg viewBox="0 0 20 20" fill="none" width="20" height="20"
                stroke="var(--y)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={f.icon} />
              </svg>
            </div>
            <div className={styles.featTitle}>{f.title}</div>
            <div className={styles.featDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
