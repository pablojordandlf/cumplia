import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checklist AI Act España 2026 — Descarga gratuita | CumplIA',
  description:
    '20 preguntas para saber si tu empresa cumple el AI Act antes de agosto 2026. Descarga gratuita, sin tarjeta de crédito.',
};

export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
