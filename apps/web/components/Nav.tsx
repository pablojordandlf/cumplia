import Link from 'next/link';
import styles from '@/styles/nav.module.css';
import LogoMark from './LogoMark';

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <LogoMark />
        Cumpl<span className={styles.logoIa}>IA</span>
      </Link>

      <ul className={styles.links}>
        <li><a href="#how-it-works">Cómo funciona</a></li>
        <li><a href="#features">Funciones</a></li>
        <li><a href="#who-applies">AI Act</a></li>
        <li><a href="#pricing">Precios</a></li>
      </ul>

      <div className={styles.right}>
        <Link href="/login" className={styles.ghost}>Iniciar Sesión</Link>
        <Link href="/register" className={styles.cta}>Registrarse</Link>
      </div>
    </nav>
  );
}
