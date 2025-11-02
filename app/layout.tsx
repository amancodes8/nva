import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nutri-Vision AI',
  description: 'AI-powered nutrition analysis with medical condition awareness',
  manifest: '/manifest.json',
  themeColor: '#0066CC',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    generator: 'aman1067'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
<body className={inter.className}>
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <AuthProvider>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Nutri-Vision AI</span>
      </header>
      {children}
      <Toaster />
    </AuthProvider>
  </ThemeProvider>
</body>
    </html>
  )
}
