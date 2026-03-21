import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { LogoLoader } from '@/components/logo-loader'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mealclan Services - Order Delicious Meals Online',
  description: 'Order fresh and delicious meals from Mealclan Services. Fast delivery, quality food, easy ordering.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LogoLoader />
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
