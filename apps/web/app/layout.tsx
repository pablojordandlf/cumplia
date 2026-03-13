import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/providers/toaster';

export const metadata: Metadata = {
  title: 'CumplIA',
  description: 'Panel de cumplimiento del AI Act',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
