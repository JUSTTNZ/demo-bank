import SignUp from '@/components/signupForm'
import Head from 'next/head'


export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Login | Demo Bank</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <SignUp />
      </main>
    </>
  )
}