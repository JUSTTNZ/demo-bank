import { 
  BarChart3, 
  Users, 
  CreditCard, 
  MessageSquare, 
  LogOut, 
  X,
  Settings,
  Shield,
  Activity
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout: () => void
}

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  onLogout 
}: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'chats', label: 'Support Chats', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sticky z-30 left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl transform transition-all duration-300 z-50 lg:translate-x-0 lg:static lg:shadow-lg ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Management Console</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-[1.02]'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'
              }`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:scale-105 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar