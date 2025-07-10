import { Users, CreditCard, DollarSign, MessageSquare, Activity, Clock } from 'lucide-react'
import StatCard from '@/components/admin/statCard'
import { DashboardStats, User } from '@/types/adminTypes'

interface DashboardOverviewProps {
  stats: DashboardStats
  users: User[]
}

const DashboardOverview = ({ stats, users }: DashboardOverviewProps) => {
  const recentUsers = users.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
          description="Active users this month"
        />
        <StatCard
          title="Active Accounts"
          value={stats.totalAccounts || 0}
          icon={CreditCard}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend="+8%"
          description="Connected accounts"
        />
        <StatCard
          title="Total Value"
          value={`$${(stats.totalValue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="+15%"
          description="Assets under management"
        />
        <StatCard
          title="Support Chats"
          value={stats.totalChats || 0}
          icon={MessageSquare}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend="+5%"
          description="Active conversations"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend="+22%"
          description="Revenue this month"
        />
        <StatCard
          title="Growth Rate"
          value={`${(stats.growthRate || 0).toFixed(1)}%`}
          icon={Activity}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          trend="+3.2%"
          description="Monthly growth rate"
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
              <Clock className="w-4 h-4 text-gray-400" />
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
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      {index < 3 && (
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
                    <p className="text-xs text-gray-500">
                      {user.last_sign_in_at ? 
                        `Last active ${new Date(user.last_sign_in_at).toLocaleDateString()}` : 
                        'Never signed in'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview