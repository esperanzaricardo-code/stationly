import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stationly — Share Your Setup',
  description: 'La red social para streamers y creadores. Comparte tu setup, etiqueta tus componentes y descubre los mejores escritorios.',
  openGraph: {
    title: 'Stationly',
    description: 'La red social de setups para streamers y creadores',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
