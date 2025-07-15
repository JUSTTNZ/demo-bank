import { LucideIcon } from 'lucide-react'
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
  accountGrowthRate?: number
  revenueGrowthRate?: number
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
  icon: LucideIcon
  color: string
  trend?: string
  description?: string
}

// types/adminTypes.ts or above the functions
export interface CreateUserPayload {
  email: string
  password: string
  role?: 'user' | 'admin'
  fullName?: string
  createAccount?: boolean
}

export interface CreateUserResponse {
  success: boolean
  user?: any
  profile?: any
  account?: any
  error?: string
}

export interface GetAllUsersResponse {
  success: boolean
  users?: any[]
  error?: string
}



export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  trend?: string
  description?: string
  trendIcon?: LucideIcon
  trendColor?: string
}


export interface Account {
  id: string
  account_number: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  content: string
  sender_type: 'user' | 'admin'
  created_at: string
  profiles?: {
    first_name?: string
    last_name?: string
    email: string
  }
}