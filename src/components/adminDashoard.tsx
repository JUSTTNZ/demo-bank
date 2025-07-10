'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import supabase from '@/utils/supabaseClient'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/sidebar'
import Header from '@/components/admin/header'
import DashboardOverview from '@/components/admin/dashboardOverview'
import UsersManagement from '@/components/admin/userManagement'
import AccountsManagement from '@/components/admin/accountsManagement'
import ChatsManagement from '@/components/admin/chatManagement'
import LoadingSpinner from '@/components/admin/loaderSpinner'
import { User, DashboardStats } from '@/types/adminTypes'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({})
  const [users, setUsers] = useState<User[]>([])
  const [accounts, setAccounts] = useState([])
  const [chats, setChats] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchDashboardData()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // if (!user) {
      //   router.push('/login')
      //   return
      // }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setCurrentUser({ ...user, ...profile })
    } catch (error) {
      console.log(error)
      toast.error('Authentication failed')
      // router.push('/login')
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, accountsRes, chatsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/accounts'),
        fetch('/api/admin/chats')
      ])

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      const accountsData = await accountsRes.json()
      const chatsData = await chatsRes.json()

      if (statsData.success) setStats(statsData.stats)
      if (usersData.success) setUsers(usersData.users)
      if (accountsData.success) setAccounts(accountsData.accounts)
      if (chatsData.success) setChats(chatsData.chats)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Logout failed')
      console.log(error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} users={users} />
      case 'users':
        return <UsersManagement users={users} onRefresh={fetchDashboardData} />
      case 'accounts':
        return <AccountsManagement accounts={accounts} onRefresh={fetchDashboardData} />
      case 'chats':
        return <ChatsManagement chats={chats} onRefresh={fetchDashboardData} />
      default:
        return <DashboardOverview stats={stats} users={users} />
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
   <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
  <Sidebar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    onLogout={handleLogout}
  />
  
  <div className="flex-1  min-h-screen">
    {/* Header and main content */}
    <Header
      activeTab={activeTab}
      currentUser={currentUser}
      setSidebarOpen={setSidebarOpen}
    />
    
    <main className="p-4 lg:p-8 pb-8">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </main>
  </div>
</div>
  )
}