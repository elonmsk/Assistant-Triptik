import type { Metadata } from 'next'
import './globals.css'
import { ChatProvider } from '@/contexts/ChatContext'
import ClientLayout from './ClientLayout'

export const metadata: Metadata = {
  title: 'Assistant Triptik',
  description: 'Assistant intelligent pour l\'accompagnement social - V1 au 28 Juillet',
  generator: 'Next.js',
  keywords: ['assistant', 'accompagnement', 'social', 'emmaus', 'v1'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning={true}>
        <ClientLayout>
          <ChatProvider>
            {children}
          </ChatProvider>
        </ClientLayout>
      </body>
    </html>
  )
}
