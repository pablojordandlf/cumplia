import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cumplia - AI Compliance for Humans',
  description: 'AI compliance for humans. Not for lawyers.',
  openGraph: {
    title: 'Cumplia - AI Compliance for Humans',
    description: 'AI compliance for humans. Not for lawyers.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth dark">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
