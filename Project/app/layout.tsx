import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { CategorySlider } from '@/components/CategorySlider'
import { Header } from '@/components/Header'
import { ChatWidget } from '@/components/ChatWidget'
import { Toaster } from "@/components/ui/sonner"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TripC SuperApp - Category Slider Variant 2.9',
  description: 'TripC Pro - Your all-in-one travel companion',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
        <Header />
        <CategorySlider />
        {children}
        <ChatWidget />
        <Toaster position="bottom-left" toastOptions={{
          classNames: {
            error: 'bg-red-500 text-white border-red-600',
          }
        }} />
      </body>
    </html>
  )
}
