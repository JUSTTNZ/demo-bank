export interface User {
  id: string
  email: string
  full_name?: string
  role: string
  accounts?: unknown[]
  created_at: string
  last_sign_in_at?: string
  avatar_url?: string
  phone?: string
  [key: string]: unknown
}

export interface DashboardStats {
  totalUsers?: number
  totalAccounts?: number
  totalValue?: number
  totalChats?: number
  activeUsers?: number
  pendingChats?: number
  monthlyRevenue?: number
  growthRate?: number
}

export interface Account {
  id: string
  user_id: string
  account_type: string
  balance: number
  created_at: string
  updated_at: string
  status: 'active' | 'inactive' | 'suspended'
  user?: User
}

export interface Chat {
  id: string
  user_id: string
  title: string
  status: 'active' | 'closed' | 'pending'
  created_at: string
  updated_at: string
  messages_count: number
  user?: User
}

export interface NewUser {
  email: string
  password: string
  fullName: string
  role: string
  createAccount: boolean
  initialBalance: number
}

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  trend?: string
  description?: string
}