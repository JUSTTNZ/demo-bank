import type { AppProps } from 'next/app'
import '@/styles/globals.css'

// 👇 Import font
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Optional
  variable: '--font-inter',             // Optional for Tailwind
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className}`}>
      <Component {...pageProps} />
    </main>
  )
}
