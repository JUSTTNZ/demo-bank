import Head from 'next/head'
import AdminDashboard from '@/components/adminDashoard'

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>AdminDashboard | Demo Bank</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <AdminDashboard />
      </main>
    </>
  )
}
