// src/pages/login.tsx
import Head from 'next/head'
import { LoginForm } from '@/components/loginForm'

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Demo Bank</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoginForm />
      </main>
    </>
  )
}
