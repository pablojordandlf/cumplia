import Link from 'next/link';
import LogoMark from './LogoMark';
import styles from '@/styles/footer.module.css';

const COLS = [
  {
    title: 'Producto',
    links: [
      { label: 'El Riesgo',  href: '/#who-applies' },
      { label: 'Solución',   href: '/#how-it-works' },
      { label: 'Precios',    href: '/pricing' },
      { label: 'Guía AI Act', href: '/guia-ai-act' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: '¿Qué es el AI Act?',   href: '/blog/que-es-ai-act' },
      { label: 'Sanciones del AI Act', href: '/blog/sanciones-ai-act' },
      { label: 'Checklist',            href: '/recursos/checklist-ai-act' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad',          href: '/privacidad' },
      { label: 'Términos de Servicio', href: '/terminos-servicio' },
      { label: 'Cookies',             href: '/cookies' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <LogoMark />
            Cumpl<span className={styles.logoIa}>IA</span>
          </Link>
          <p className={styles.tagline}>
            Simplificamos el cumplimiento del AI Act para empresas europeas.
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title} className={styles.col}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <span>© 2026 CumplIA. Todos los derechos reservados.</span>
        <span className={styles.mono}>EU AI Act Compliance Platform</span>
      </div>
    </footer>
  );
}
