import styles from '@/styles/sections.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Registra tus sistemas de IA',
    desc: 'Añade cada sistema de IA: nombre, sector, descripción y contexto de uso. En minutos tienes tu inventario completo centralizado.',
    tag: 'Formulario guiado + importación masiva',
  },
  {
    num: '02',
    title: 'IA clasifica y analiza riesgos',
    desc: 'Nuestro asistente IA lee la descripción de tu sistema, lo clasifica según el AI Act y propone los factores de riesgo aplicables del catálogo de 50+ riesgos.',
    tag: 'Clasificación automática + análisis IA',
  },
  {
    num: '03',
    title: 'Gestiona obligaciones y genera documentos',
    desc: 'Sigue el progreso artículo por artículo, mitiga riesgos, sube evidencias y genera informes PDF de cumplimiento listos para auditores.',
    tag: 'Informes PDF automáticos + exportación',
  },
];

const OBLIGATIONS = [
  'Sistema de clasificación bajo Anexo III punto 5(b)',
  'Requiere FRIA (Art. 27) antes del despliegue',
  'Gestión de riesgos documentada (Art. 9)',
  'Registro técnico y log de auditoría (Art. 12)',
  'Supervisión humana activa (Art. 14)',
];

export default function HowItWorksSection() {
  return (
    <div className={styles.darkBg} id="how-it-works">
      <section className={styles.section}>
        <div className={styles.tag} data-fade>Cómo funciona</div>
        <h2 data-fade>
          De cero a cumplimiento<br />en <em>3 pasos</em>
        </h2>
        <p className={styles.sub} data-fade>
          Sin consultores externos ni hojas de cálculo. Solo un flujo guiado con IA que hace el trabajo pesado por ti.
        </p>

        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={styles.step}
              data-fade
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepTitle}>{s.title}</div>
              <div className={styles.stepDesc}>{s.desc}</div>
              <div className={styles.stepTag}>{s.tag}</div>
            </div>
          ))}
        </div>

        {/* App mockup */}
        <div className={styles.mockup} data-fade>
          <div className={styles.mockupBar}>
            <div className={styles.dot} style={{ background: '#FF5F57' }} />
            <div className={styles.dot} style={{ background: '#FFBD2E' }} />
            <div className={styles.dot} style={{ background: '#28CA41' }} />
            <span className={styles.mockupUrl}>app.cumplia.com/dashboard/inventory/nuevo</span>
          </div>
          <div className={styles.mockupBody}>
            <div className={styles.mockupForm}>
              <div className={styles.formTitle}>Nuevo sistema de IA</div>
              {[
                { label: 'Nombre',  val: 'Scoring de Crédito v2', type: 'text' },
                { label: 'Sector',  val: 'Finanzas y seguros',     type: 'text' },
              ].map((f) => (
                <div key={f.label} className={styles.field}>
                  <div className={styles.fieldLabel}>{f.label}</div>
                  <div className={styles.fieldVal}>{f.val}</div>
                </div>
              ))}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Descripción</div>
                <div className={styles.fieldTextarea}>
                  Modelo que evalúa la solvencia de personas para la concesión de préstamos personales basado en historial crediticio y datos socioeconómicos.
                </div>
              </div>
              <button className={styles.classifyBtn}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L9 5H13L10 8L11 12L7 10L3 12L4 8L1 5H5L7 1Z" stroke="#0A0A0A" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                Clasificar con IA
              </button>
            </div>

            <div className={styles.mockupResult}>
              <div className={styles.resultLabel}>Resultado del análisis</div>
              <div className={styles.riskBadge}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#FF7070" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                Alto Riesgo — Anexo III
              </div>
              <div className={styles.oblList}>
                {OBLIGATIONS.map((o) => (
                  <div key={o} className={styles.oblItem}>
                    <div className={styles.oblCheck}>
                      <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                        <path d="M2 5L4 7L8 3" stroke="#E8FF47" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
