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
  date: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Account {
  id: string;
  account_number: string;
  balance: number;
  currency: string;
  status: 'disabled' | 'suspended';
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  accounts: Account[];
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
  verifiedAccount: string;
  pendingVerification: string;
  upgradeAccount: string;
  signOut: string;
  accountDetails: string;
  currentBalance: string;
  accountStatus: string;
  active: string;
  pending: string;
  currency: string;
  accountNumber: string;
  dashboard: string;
  viewDashboard: string;
  transactions: string;
  viewTransactions: string;
  faq: string;
  getHelp: string;
  profileInformation: string;
  fullName: string;
  emailAddress: string;
  accountType: string;
  standardAccount: string;
  memberSince: string;
  profileEditNotice: string;
  errorPleaseLogin: string;
  errorLoadProfile: string;
  errorInvalidImage: string;
  errorImageSize: string;
  successProfilePicture: string;
  errorUploadImage: string;
  errorAccountDisabled: string;
  // FAQ Page Translations
  searchFAQs: string;
  noResultsFound: string;
  tryDifferentSearch: string;
  stillNeedHelp: string;
  contactSupportMessage: string;
  contactSupport: string;
  
  // FAQ Categories
  accountManagement: string;
  paymentsTransfers: string;
  cardServices: string;
  mobileBanking: string;
  
  // FAQ Questions & Answers
  howToOpenAccount: string;
  howToOpenAccountAnswer: string;
  howToCloseAccount: string;
  howToCloseAccountAnswer: string;
  accountDisabledWhy: string;
  accountDisabledWhyAnswer: string;
  howToSendMoney: string;
  howToSendMoneyAnswer: string;
  transferLimits: string;
  transferLimitsAnswer: string;
  whyTransferFailed: string;
  whyTransferFailedAnswer: string;
  howToGetCard: string;
  howToGetCardAnswer: string;
  cardBlockedWhatToDo: string;
  cardBlockedWhatToDoAnswer: string;
  reportLostCard: string;
  reportLostCardAnswer: string;
  howToSecureAccount: string;
  howToSecureAccountAnswer: string;
  suspiciousActivity: string;
  suspiciousActivityAnswer: string;
  changePassword: string;
  changePasswordAnswer: string;
  howToInstallApp: string;
  howToInstallAppAnswer: string;
  appNotWorking: string;
  appNotWorkingAnswer: string;
  biometricLogin: string;
  biometricLoginAnswer: string;
}