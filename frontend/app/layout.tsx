import './globals.css'
import { Saira, Audiowide } from 'next/font/google'

const saira = Saira({ subsets: ['latin'] })
const audiowide = Audiowide({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide'
})

export const metadata = {
  title: 'Best SAAS Kit Pro',
  description: 'The ultimate starter kit for your SAAS project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${saira.className} ${audiowide.variable} min-h-screen antialiased`} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
