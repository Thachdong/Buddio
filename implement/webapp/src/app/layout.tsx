import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { vi } from '@/shared/i18n/vi'
import { Toaster } from '@/shared/ui/sonner'
import './globals.css'

// Subset 'vietnamese' để hiển thị đủ dấu tiếng Việt (NFR-24)
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
})

export const metadata: Metadata = {
  title: vi.app.name,
  description: vi.app.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
