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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
