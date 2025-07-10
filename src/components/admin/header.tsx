import { Menu, Bell, Search } from 'lucide-react'
import Image from 'next/image'

interface UserData {
  full_name?: string
  email?: string
  avatar_url?: string
}

interface HeaderProps {
  activeTab: string
  currentUser?: UserData | null
  setSidebarOpen: (open: boolean) => void
}

const Header = ({ activeTab, currentUser = {}, setSidebarOpen }: HeaderProps) => {
  const getTabTitle = (tab: string) => {
    const titles = {
      dashboard: 'Dashboard Overview',
      users: 'User Management',
      accounts: 'Account Management',
      chats: 'Support Chats',
      settings: 'Settings',
      activity: 'Activity Logs'
    }
    return titles[tab as keyof typeof titles] || 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
    
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'dashboard' && 'Monitor your system performance and metrics'}
              {activeTab === 'users' && 'Manage user accounts and permissions'}
              {activeTab === 'accounts' && 'Oversee financial accounts and transactions'}
              {activeTab === 'chats' && 'Handle customer support conversations'}
              {activeTab === 'settings' && 'Configure system settings and preferences'}
              {activeTab === 'activity' && 'View system activity and audit logs'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
        
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors w-64"
              />
            </div>
          </div>

        
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </div>

      
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.full_name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser?.email || 'admin@example.com'}
              </p>
            </div>
            <div className="relative">
              {currentUser?.avatar_url ? (
                <Image
                  src={currentUser.avatar_url}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.full_name?.charAt(0).toUpperCase() ||
                      currentUser?.email?.charAt(0).toUpperCase() ||
                      'A'}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
