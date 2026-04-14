import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAPA - Gerador de Planos de Aula',
  description: 'Sistema de Apoio Pedagógico Inteligente para Professores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-slate-900">{children}</body>
    </html>
  )
}
