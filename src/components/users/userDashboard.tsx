import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  FileText, 
  CreditCard, 
  DollarSign, 
  PiggyBank, 
  Building, 
  Wallet,
  Phone,
  Globe,
  Shield,
  Settings,
  User,
  Headphones,
  Info,
  LogOut,
  LucideIcon,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Types
interface Language {
  code: string;
  name: string;
  flag: string;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  trend: 'up' | 'down';
}

interface QuickAction {
  icon: LucideIcon;
  name: string;
  key: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

interface Account {
  id: string;
  account_number: string;
  balance: number;
  currency: string;
  type: 'savings' | 'checking' | 'investment';
  status: 'active' | 'disabled' | 'suspended';
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  accounts: Account[];
  transactions: Transaction[];
}

interface Translation {
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

// Mock API functions
const mockUserApi = {
  getUserProfile: async (): Promise<UserProfile> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: 'user_123',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
      accounts: [
        {
          id: 'acc_1',
          account_number: '123456789',
          balance: 25750.00,
          currency: 'USD',
          type: 'checking',
          status: 'active'
        },
        {
          id: 'acc_2',
          account_number: '987654321',
          balance: 15000.00,
          currency: 'USD',
          type: 'savings',
          status: 'active'
        }
      ],
      transactions: [
        {
          id: 'txn_1',
          type: 'credit',
          amount: 2500.00,
          description: 'Salary Credit',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          category: 'Income'
        },
        {
          id: 'txn_2',
          type: 'debit',
          amount: 150.00,
          description: 'Grocery Shopping',
          date: '2024-01-14T14:20:00Z',
          status: 'completed',
          category: 'Shopping'
        },
        {
          id: 'txn_3',
          type: 'debit',
          amount: 89.99,
          description: 'Netflix Subscription',
          date: '2024-01-13T09:15:00Z',
          status: 'completed',
          category: 'Entertainment'
        },
        {
          id: 'txn_4',
          type: 'credit',
          amount: 500.00,
          description: 'Freelance Payment',
          date: '2024-01-12T16:45:00Z',
          status: 'completed',
          category: 'Income'
        },
        {
          id: 'txn_5',
          type: 'debit',
          amount: 75.00,
          description: 'Utility Bill',
          date: '2024-01-11T11:30:00Z',
          status: 'pending',
          category: 'Bills'
        }
      ]
    };
  },

  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      { currency: 'USD', rate: 1.0000, change: 0.0012, trend: 'up' },
      { currency: 'EUR', rate: 0.8456, change: -0.0023, trend: 'down' },
      { currency: 'GBP', rate: 0.7834, change: 0.0045, trend: 'up' },
      { currency: 'JPY', rate: 149.23, change: -0.34, trend: 'down' },
      { currency: 'CAD', rate: 1.3456, change: 0.0078, trend: 'up' }
    ];
  }
};

// Language options with flags
const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
];

// Translations
const translations: Record<string, Translation> = {
  en: {
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    accountDisabled: 'Account Disabled',
    accountActive: 'Account Active',
    availableBalance: 'Available Balance',
    ledgerBalance: 'Total Balance',
    exchangeRates: 'Exchange Rates',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity at the moment',
    profile: 'Profile',
    settings: 'Settings',
    customerCare: 'Customer Care',
    about: 'About',
    logout: 'Logout',
    sendMoney: 'Send Money',
    transactionDetails: 'Transaction Details',
    payBills: 'Pay Bills',
    wealthManagement: 'Wealth Management',
    chequesCards: 'Cheques & Cards',
    loans: 'Loans',
    investments: 'Investments',
    insurance: 'Insurance',
    forex: 'Forex Trading',
    savings: 'Savings',
    deposits: 'Fixed Deposits',
    mobile: 'Mobile Banking',
    statements: 'Statements',
    support: 'Support',
    security: 'Security',
    notifications: 'Notifications',
    viewAll: 'View All',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry'
  },
  fr: {
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon Après-midi',
    goodEvening: 'Bonsoir',
    accountDisabled: 'Compte Désactivé',
    accountActive: 'Compte Actif',
    availableBalance: 'Solde Disponible',
    ledgerBalance: 'Solde Total',
    exchangeRates: 'Taux de Change',
    quickActions: 'Actions Rapides',
    recentActivity: 'Activité Récente',
    noRecentActivity: 'Aucune activité récente pour le moment',
    profile: 'Profil',
    settings: 'Paramètres',
    customerCare: 'Service Client',
    about: 'À Propos',
    logout: 'Déconnexion',
    sendMoney: 'Envoyer Argent',
    transactionDetails: 'Détails Transaction',
    payBills: 'Payer Factures',
    wealthManagement: 'Gestion Patrimoine',
    chequesCards: 'Chèques & Cartes',
    loans: 'Prêts',
    investments: 'Investissements',
    insurance: 'Assurance',
    forex: 'Trading Forex',
    savings: 'Épargne',
    deposits: 'Dépôts Fixes',
    mobile: 'Banque Mobile',
    statements: 'Relevés',
    support: 'Support',
    security: 'Sécurité',
    notifications: 'Notifications',
    viewAll: 'Voir Tout',
    loading: 'Chargement...',
    error: 'Erreur de chargement',
    retry: 'Réessayer'
  }
};

// Utility functions
const getGreeting = (t: Translation) => {
  const hour = new Date().getHours();
  if (hour < 12) return t.goodMorning;
  if (hour < 17) return t.goodAfternoon;
  return t.goodEvening;
};

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Custom hook for exchange rates
const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rates = await mockUserApi.getExchangeRates();
        setExchangeRates(rates);
      } catch (err) {
        setError('Failed to load exchange rates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { exchangeRates, loading, error };
};

// Header Component
const Header = ({ currentLanguage, setCurrentLanguage, isMenuOpen, setIsMenuOpen, t, userProfile }: any) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-bold text-lg">
              DemoBank
            </div>
          </div>

          {/* User Info & Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Avatar */}
            <div className="flex items-center space-x-3">
              <img 
                src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{userProfile?.full_name}</span>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                <span>{languages.find(lang => lang.code === currentLanguage)?.name}</span>
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <Settings size={16} />
              <span>{t.settings}</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <LogOut size={16} />
              <span>{t.logout}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User info */}
            <div className="flex items-center space-x-3 px-3 py-2 mb-2">
              <img 
                src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{userProfile?.full_name}</span>
            </div>

            {/* Language selector */}
            <div className="border-b border-gray-200 pb-2 mb-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Language</div>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      currentLanguage === lang.code 
                        ? 'bg-green-50 text-green-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Menu items */}
            <button className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <Settings size={20} />
              <span>{t.settings}</span>
            </button>
            <button className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <LogOut size={20} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// Welcome Section Component
const WelcomeSection = ({ t, userProfile }: any) => {
  const primaryAccount = userProfile?.accounts?.[0];
  const isAccountActive = primaryAccount?.status === 'active';

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting(t)},
          </h1>
          <p className="text-xl text-gray-700 font-semibold">{userProfile?.full_name}</p>
          <p className="text-sm text-gray-600 mt-1">{userProfile?.email}</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
          isAccountActive 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {isAccountActive ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">
            {isAccountActive ? t.accountActive : t.accountDisabled}
          </span>
        </div>
      </div>
    </div>
  );
};

// Balance Section Component
const BalanceSection = ({ t, userProfile }: any) => {
  const [showBalance, setShowBalance] = useState(false);
  
  const primaryAccount = userProfile?.accounts?.[0];
  const totalBalance = userProfile?.accounts?.reduce((sum: number, account: Account) => sum + account.balance, 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.availableBalance}</h3>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">
          {showBalance ? formatCurrency(primaryAccount?.balance || 0) : '••••••'}
        </div>
        <p className="text-sm text-gray-600">
          Account: {primaryAccount?.account_number ? `****${primaryAccount.account_number.slice(-4)}` : 'N/A'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.ledgerBalance}</h3>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">
          {showBalance ? formatCurrency(totalBalance) : '••••••'}
        </div>
        <p className="text-sm text-gray-600">
          {userProfile?.accounts?.length} Account{userProfile?.accounts?.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

// Exchange Rates Component
const ExchangeRates = ({ t }: { t: Translation }) => {
  const { exchangeRates, loading, error } = useExchangeRates();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
        <div className="text-center py-4">
          <div className="text-gray-600">{t.loading}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-green-600 hover:text-green-700"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {exchangeRates.map((rate) => (
          <div key={rate.currency} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="font-semibold text-gray-900">{rate.currency}</div>
            <div className="text-lg font-bold text-gray-800">{rate.rate}</div>
            <div className={`flex items-center justify-center space-x-1 text-sm ${
              rate.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {rate.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(rate.change).toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ t, setShowModal }: any) => {
  const actions: QuickAction[] = [
    { icon: Send, name: t.sendMoney, key: 'sendMoney' },
    { icon: FileText, name: t.transactionDetails, key: 'transactionDetails' },
    { icon: DollarSign, name: t.payBills, key: 'payBills' },
    { icon: PiggyBank, name: t.wealthManagement, key: 'wealthManagement' },
    { icon: CreditCard, name: t.chequesCards, key: 'chequesCards' },
    { icon: Building, name: t.loans, key: 'loans' },
    { icon: TrendingUp, name: t.investments, key: 'investments' },
    { icon: Shield, name: t.insurance, key: 'insurance' },
    { icon: Globe, name: t.forex, key: 'forex' },
    { icon: Wallet, name: t.savings, key: 'savings' },
    { icon: DollarSign, name: t.deposits, key: 'deposits' },
    { icon: Phone, name: t.mobile, key: 'mobile' },
    { icon: FileText, name: t.statements, key: 'statements' },
    { icon: Headphones, name: t.support, key: 'support' },
    { icon: Shield, name: t.security, key: 'security' },
    { icon: Settings, name: t.notifications, key: 'notifications' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.quickActions}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => setShowModal(action)}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-green-50 hover:shadow-md transition-all duration-200 transform hover:scale-105 group"
          >
            <action.icon size={32} className="text-green-600 mb-2 group-hover:text-green-700" />
            <span className="text-sm font-medium text-gray-700 text-center group-hover:text-green-700">
              {action.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ t, transactions }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'failed': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.recentActivity}</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <FileText size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600">{t.noRecentActivity}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.recentActivity}</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
          {t.viewAll}
        </button>
      </div>
      
      <div className="space-y-4">
        {transactions.slice(0, 5).map((transaction: Transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'credit' ? 
                  <ArrowDownRight size={16} className="text-green-600" /> : 
                  <ArrowUpRight size={16} className="text-red-600" />
                }
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-600">{transaction.category}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              <div className="flex items-center space-x-1 text-sm">
                <span className={getStatusColor(transaction.status)}>
                  {getStatusIcon(transaction.status)}
                </span>
                <span className="text-gray-500">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, action, t }: any) => {
  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="text-center py-6">
          <action.icon size={48} className="text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">
            You are about to access {action.name}. Would you like to proceed?
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => alert('Account disabled at the moment')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function UserDashboard() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState<QuickAction | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[currentLanguage];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await mockUserApi.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading profile</h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        t={t}
        userProfile={userProfile}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection t={t} userProfile={userProfile} />
        <BalanceSection t={t} userProfile={userProfile} />
        <ExchangeRates t={t} />
        <QuickActions t={t} setShowModal={setShowModal} />
        <RecentActivity t={t} transactions={userProfile.transactions} />
      </main>

      <Modal 
        isOpen={showModal !== null}
        onClose={() => setShowModal(null)}
        action={showModal}
        t={t}
      />
    </div>
  );
}