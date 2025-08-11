import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HeySalad Tasha - Food Waste Reduction dApp',
  description: 'AI-powered voice assistant for tracking food waste reduction on Polkadot blockchain',
  keywords: 'food waste, blockchain, polkadot, sustainability, AI, voice assistant',
  authors: [{ name: 'HeySalad Team' }],
  openGraph: {
    title: 'HeySalad Tasha - Food Waste Reduction dApp',
    description: 'Track your food waste reduction with AI voice assistant and earn tokens on Polkadot',
    type: 'website',
  }
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
          {children}
        </div>
      </body>
    </html>
  )
}