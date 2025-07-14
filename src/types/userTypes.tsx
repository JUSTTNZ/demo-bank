import { LucideIcon } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  trend: 'up' | 'down';
}

export interface QuickAction {
  icon: LucideIcon;
  name: string;
  key: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

export interface Account {
  id: string;
  account_number: string;
  balance: number;
  currency: string;
  type: 'savings' | 'checking' | 'investment';
  status: 'active' | 'disabled' | 'suspended';
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  accounts: Account[];
  transactions: Transaction[];
}

export interface Translation {
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  accountDisabled: string;
  accountActive: string;
  availableBalance: string;
  ledgerBalance: string;
  exchangeRates: string;
  quickActions: string;
  recentActivity: string;
  noRecentActivity: string;
  profile: string;
  settings: string;
  customerCare: string;
  about: string;
  logout: string;
  sendMoney: string;
  transactionDetails: string;
  payBills: string;
  wealthManagement: string;
  chequesCards: string;
  loans: string;
  investments: string;
  insurance: string;
  forex: string;
  savings: string;
  deposits: string;
  mobile: string;
  statements: string;
  support: string;
  security: string;
  notifications: string;
  viewAll: string;
  loading: string;
  error: string;
  retry: string;
}