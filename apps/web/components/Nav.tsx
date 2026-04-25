import Link from 'next/link';
import styles from '@/styles/nav.module.css';
import { CumpliaLogo } from '@/components/ui/cumplia-logo';

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className="flex items-center">
        <CumpliaLogo markSize={30} wordSize={20} variant="dark" gap={10} />
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
