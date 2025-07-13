import Head from 'next/head'
import UserDashboard from '@/components/users/userDashboard'

export default function AdminPage() {
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