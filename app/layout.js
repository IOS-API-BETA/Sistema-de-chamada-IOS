import './globals.css'

export const metadata = {
  title: 'Sistema de Chamada - IOS',
  description: 'Sistema de gestão de frequência dos alunos do Instituto da Oportunidade Social',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  )
}