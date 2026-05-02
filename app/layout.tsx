import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReputaFlow — Gestión de Reseñas',
  description: 'SaaS de gestión de reputación online para negocios turísticos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
