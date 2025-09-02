import './globals.css'
import { Saira, Audiowide } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'
import { StagewiseWrapper } from '@/components/StagewiseWrapper'

const saira = Saira({ subsets: ['latin'] })
const audiowide = Audiowide({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide'
})

export const metadata = {
  title: 'BookAIMark',
  description: 'AI-powered bookmark management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${saira.className} ${audiowide.variable} min-h-screen antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          {/* Global toast notifications */}
          <Toaster />
          {/* Stagewise toolbar for AI-powered editing */}
          <StagewiseWrapper />
        </ThemeProvider>
      </body>
    </html>
  )
}
