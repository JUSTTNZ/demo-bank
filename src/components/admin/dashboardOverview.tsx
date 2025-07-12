// components/admin/dashboardOverview.tsx
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  MessageSquare, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react'
import { DashboardStats, User } from '@/types/adminTypes'
import Image from 'next/image'
import StatCard from '@/components/admin/statCard'

interface DashboardOverviewProps {
  stats: DashboardStats
  users: User[]
}

const DashboardOverview = ({ stats, users }: DashboardOverviewProps) => {
  // Filter out admins from users for calculations
  const regularUsers = users?.filter(user => user.role !== 'admin') || []
  const recentUsers = users?.slice(0, 5) || []

  // Helper function to format trend
  const formatTrend = (rate: number) => {
    const sign = rate >= 0 ? '+' : ''
    return `${sign}${rate.toFixed(1)}%`
  }

  // Helper function to get trend icon
  const getTrendIcon = (rate: number) => {
    return rate >= 0 ? TrendingUp : TrendingDown
  }

  // Helper function to get trend color
  const getTrendColor = (rate: number) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600'
  }

  // Calculate activity metrics (excluding admins)
  const activeUsers = regularUsers.filter(user => {
    const lastActivity = user.last_sign_in_at
    if (!lastActivity) return false
    const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceActivity <= 7
  }).length || 0

  const newUsersThisWeek = regularUsers.filter(user => {
    const createdAt = new Date(user.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdAt >= weekAgo
  }).length || 0

  // Calculate adjusted stats excluding admins
  const adjustedStats = {
    ...stats,
    totalUsers: regularUsers.length, // Only count regular users
    growthRate: stats.growthRate || 0 // Keep original growth rate calculation
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                Admin Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Welcome back! Here's what's happening with your platform today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Last updated</p>
              <p className="text-white font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={adjustedStats.totalUsers || 0}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={formatTrend(adjustedStats.growthRate || 0)}
          description="Active users (excluding admins)"
          trendIcon={getTrendIcon(adjustedStats.growthRate || 0)}
          trendColor={getTrendColor(adjustedStats.growthRate || 0)}
        />
        <StatCard
          title="Active Accounts"
          value={stats.totalAccounts || 0}
          icon={CreditCard}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend={formatTrend(stats.accountGrowthRate || 0)}
          description="Connected accounts"
          trendIcon={getTrendIcon(stats.accountGrowthRate || 0)}
          trendColor={getTrendColor(stats.accountGrowthRate || 0)}
        />
        <StatCard
          title="Total Value"
          value={`$${(stats.totalValue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={formatTrend(stats.revenueGrowthRate || 0)}
          description="Assets under management"
          trendIcon={getTrendIcon(stats.revenueGrowthRate || 0)}
          trendColor={getTrendColor(stats.revenueGrowthRate || 0)}
        />
        <StatCard
          title="Support Chats"
          value={stats.totalChats || 0}
          icon={MessageSquare}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend="+5%"
          description="Active conversations"
          trendIcon={TrendingUp}
          trendColor="text-green-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend={formatTrend((stats.monthlyRevenue || 0) > 0 ? 22 : 0)}
          description="Revenue this month"
          trendIcon={getTrendIcon((stats.monthlyRevenue || 0) > 0 ? 22 : 0)}
          trendColor={getTrendColor((stats.monthlyRevenue || 0) > 0 ? 22 : 0)}
        />
        <StatCard
          title="Active This Week"
          value={activeUsers}
          icon={Activity}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          trend={`+${newUsersThisWeek}`}
          description="Regular users active in last 7 days"
          trendIcon={TrendingUp}
          trendColor="text-green-600"
        />
        <StatCard
          title="Growth Rate"
          value={`${(adjustedStats.growthRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-pink-500 to-rose-600"
          trend={formatTrend(adjustedStats.growthRate || 0)}
          description="Monthly growth rate"
          trendIcon={getTrendIcon(adjustedStats.growthRate || 0)}
          trendColor={getTrendColor(adjustedStats.growthRate || 0)}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500 mt-1">Latest user registrations and activity</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live updates</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200/50">
          {recentUsers.length > 0 ? (
            recentUsers.map((user, index) => (
              <div key={user.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      {index < 3 && user.role !== 'admin' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {user.full_name || 'No name provided'}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {user.accounts?.length || 0} accounts • Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {user.last_sign_in_at ? (
                        <>
                          <Clock className="w-3 h-3" />
                          Last active {new Date(user.last_sign_in_at).toLocaleDateString()}
                        </>
                      ) : (
                        'Never signed in'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-sm">User activity will appear here once you have registered users.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <span className="text-sm font-medium text-blue-900">Create New User</span>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <span className="text-sm font-medium text-green-900">Export Data</span>
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <span className="text-sm font-medium text-purple-900">System Settings</span>
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response</span>
              <span className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Fast
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage</span>
              <span className="flex items-center gap-2 text-sm text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                78% Used
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview