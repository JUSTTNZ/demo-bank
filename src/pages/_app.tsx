import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
// 👇 Import font
import { Inter } from 'next/font/google'
import { AuthProvider } from '../../contexts/auth'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../../store';
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Optional
  variable: '--font-inter',             // Optional for Tailwind
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white text-sm text-gray-900 border border-gray-200 shadow-lg rounded-lg',
          success: {
            className: 'bg-green-50 text-green-700 border-green-200',
          },
          error: {
            className: 'bg-red-50 text-red-700 border-red-200',
          },
        }}
      />
      <AuthProvider>
        <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
         </PersistGate>
    </Provider>
      </AuthProvider>

    </main>
  )
}
