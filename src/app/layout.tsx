// src/app/layout.tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SIPKG NTT - Sistem Informasi Perhitungan Kebutuhan Guru',
  description: 'Sistem Informasi Perhitungan Kebutuhan Guru Pemerintah Provinsi Nusa Tenggara Timur',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.variable} font-sans antialiased bg-ntt-gradient bg-fixed`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}