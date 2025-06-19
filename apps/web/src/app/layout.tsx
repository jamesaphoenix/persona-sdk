import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Persona SDK Web App',
  description: 'Test and explore the Persona SDK capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-xl font-semibold">Persona SDK</h1>
                <nav className="flex gap-4">
                  <a href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </a>
                  <a href="/builder" className="text-gray-600 hover:text-gray-900">
                    Builder
                  </a>
                  <a href="/group" className="text-gray-600 hover:text-gray-900">
                    Groups
                  </a>
                  <a href="/ai" className="text-gray-600 hover:text-gray-900">
                    AI Features
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}