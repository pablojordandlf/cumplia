import styles from '@/styles/ticker.module.css';

const ITEMS = [
  'EU AI Act en vigor desde febrero 2025',
  'Sanciones activas agosto 2026',
  'Hasta 7% de facturación global',
  '458 artículos · Aplica a toda empresa que opere en la UE',
  'GPAI Models regulados desde agosto 2025',
  'Registro técnico obligatorio para alto riesgo',
  'FRIA — Evaluación de impacto en derechos fundamentales',
];

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.sep}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
