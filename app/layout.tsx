import type { Metadata } from 'next'
import './globals.css'
import { ChatProvider } from '@/contexts/ChatContext'

export const metadata: Metadata = {
  title: 'Assistant Triptik',
  description: 'Assistant intelligent pour l\'accompagnement social',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  )
}
