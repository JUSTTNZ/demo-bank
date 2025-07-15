import Head from 'next/head'
import UserDashboard from '@/components/userDashboard'

export default function UserPage() {
  return (
    <>
      <Head>
        <title>UserDashboard | Demo Bank</title>
      </Head>
      <main className="min-h-screen">
        <UserDashboard />
      </main>
    </>
  )
}