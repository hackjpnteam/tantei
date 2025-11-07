import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import Providers from './providers'
import WorkingNavigation from '@/components/common/WorkingNavigation'
import Footer from '@/components/common/Footer'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DOCOTAN探偵スクール | 現役プロ・警察OBから学ぶ民間探偵の実践教育',
  description: '現役プロ・警察OBから学ぶ民間探偵スクール。オンライン×OJTで基礎からプロまで、認定バッジ（DCD）を発行。',
  openGraph: {
    title: 'DOCOTAN探偵スクール',
    description: '現役プロ・警察OBから学ぶ民間探偵スクール。オンライン×OJTで基礎からプロまで、認定バッジ（DCD）を発行。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOCOTAN探偵スクール',
    description: '現役プロ・警察OBから学ぶ民間探偵スクール。オンライン×OJTで基礎からプロまで、認定バッジ（DCD）を発行。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <Providers>
          <WorkingNavigation />
          <main className="pt-16 flex-1">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}