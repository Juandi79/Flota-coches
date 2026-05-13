import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nunsys Flota',
  description: 'Gestión de flota de vehículos Nunsys Sevilla',
  manifest: '/manifest.json',
    appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nunsys Flota',
  },
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b5bdb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
