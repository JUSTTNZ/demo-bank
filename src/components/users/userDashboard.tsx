import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../../../assets/images/hero.png';
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
  LucideIcon
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

interface Translation {
  goodMorning: string;
  accountDisabled: string;
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
}

interface HeaderProps {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  t: Translation;
}

interface MenuButtonProps {
  icon: LucideIcon;
  text: string;
}

interface MobileMenuItemProps {
  icon: LucideIcon;
  text: string;
}

interface WelcomeSectionProps {
  t: Translation;
}

interface BalanceSectionProps {
  t: Translation;
}

interface ExchangeRatesProps {
  t: Translation;
}

interface QuickActionsProps {
  t: Translation;
  setShowModal: (action: QuickAction | null) => void;
}

interface RecentActivityProps {
  t: Translation;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: QuickAction | null;
  t: Translation;
}

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
    accountDisabled: 'Account Disabled',
    availableBalance: 'Available Balance',
    ledgerBalance: 'Ledger Balance',
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
    notifications: 'Notifications'
  },
  fr: {
    goodMorning: 'Bonjour',
    accountDisabled: 'Compte Désactivé',
    availableBalance: 'Solde Disponible',
    ledgerBalance: 'Solde du Grand Livre',
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
    notifications: 'Notifications'
  },
  es: {
    goodMorning: 'Buenos Días',
    accountDisabled: 'Cuenta Deshabilitada',
    availableBalance: 'Saldo Disponible',
    ledgerBalance: 'Saldo del Libro Mayor',
    exchangeRates: 'Tipos de Cambio',
    quickActions: 'Acciones Rápidas',
    recentActivity: 'Actividad Reciente',
    noRecentActivity: 'No hay actividad reciente en este momento',
    profile: 'Perfil',
    settings: 'Configuración',
    customerCare: 'Atención al Cliente',
    about: 'Acerca de',
    logout: 'Cerrar Sesión',
    sendMoney: 'Enviar Dinero',
    transactionDetails: 'Detalles Transacción',
    payBills: 'Pagar Facturas',
    wealthManagement: 'Gestión Patrimonial',
    chequesCards: 'Cheques y Tarjetas',
    loans: 'Préstamos',
    investments: 'Inversiones',
    insurance: 'Seguros',
    forex: 'Trading Forex',
    savings: 'Ahorros',
    deposits: 'Depósitos Fijos',
    mobile: 'Banca Móvil',
    statements: 'Estados de Cuenta',
    support: 'Soporte',
    security: 'Seguridad',
    notifications: 'Notificaciones'
  },
  pt: {
    goodMorning: 'Bom Dia',
    accountDisabled: 'Conta Desabilitada',
    availableBalance: 'Saldo Disponível',
    ledgerBalance: 'Saldo do Razão',
    exchangeRates: 'Taxas de Câmbio',
    quickActions: 'Ações Rápidas',
    recentActivity: 'Atividade Recente',
    noRecentActivity: 'Nenhuma atividade recente no momento',
    profile: 'Perfil',
    settings: 'Configurações',
    customerCare: 'Atendimento ao Cliente',
    about: 'Sobre',
    logout: 'Sair',
    sendMoney: 'Enviar Dinheiro',
    transactionDetails: 'Detalhes da Transação',
    payBills: 'Pagar Contas',
    wealthManagement: 'Gestão Patrimonial',
    chequesCards: 'Cheques e Cartões',
    loans: 'Empréstimos',
    investments: 'Investimentos',
    insurance: 'Seguros',
    forex: 'Trading Forex',
    savings: 'Poupança',
    deposits: 'Depósitos Fixos',
    mobile: 'Banco Móvel',
    statements: 'Extratos',
    support: 'Suporte',
    security: 'Segurança',
    notifications: 'Notificações'
  },
  nl: {
    goodMorning: 'Goedemorgen',
    accountDisabled: 'Account Uitgeschakeld',
    availableBalance: 'Beschikbaar Saldo',
    ledgerBalance: 'Grootboeksaldo',
    exchangeRates: 'Wisselkoersen',
    quickActions: 'Snelle Acties',
    recentActivity: 'Recente Activiteit',
    noRecentActivity: 'Geen recente activiteit op dit moment',
    profile: 'Profiel',
    settings: 'Instellingen',
    customerCare: 'Klantenservice',
    about: 'Over',
    logout: 'Uitloggen',
    sendMoney: 'Geld Verzenden',
    transactionDetails: 'Transactie Details',
    payBills: 'Rekeningen Betalen',
    wealthManagement: 'Vermogensbeheer',
    chequesCards: 'Cheques & Kaarten',
    loans: 'Leningen',
    investments: 'Investeringen',
    insurance: 'Verzekeringen',
    forex: 'Forex Trading',
    savings: 'Spaarrekening',
    deposits: 'Vaste Deposito',
    mobile: 'Mobiel Bankieren',
    statements: 'Afschriften',
    support: 'Ondersteuning',
    security: 'Beveiliging',
    notifications: 'Meldingen'
  },
  ar: {
    goodMorning: 'صباح الخير',
    accountDisabled: 'الحساب معطل',
    availableBalance: 'الرصيد المتاح',
    ledgerBalance: 'رصيد دفتر الأستاذ',
    exchangeRates: 'أسعار الصرف',
    quickActions: 'إجراءات سريعة',
    recentActivity: 'النشاط الأخير',
    noRecentActivity: 'لا توجد أنشطة حديثة في الوقت الحالي',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    customerCare: 'خدمة العملاء',
    about: 'حول',
    logout: 'تسجيل الخروج',
    sendMoney: 'إرسال نقود',
    transactionDetails: 'تفاصيل المعاملة',
    payBills: 'دفع الفواتير',
    wealthManagement: 'إدارة الثروة',
    chequesCards: 'الشيكات والبطاقات',
    loans: 'القروض',
    investments: 'الاستثمارات',
    insurance: 'التأمين',
    forex: 'تداول العملات',
    savings: 'المدخرات',
    deposits: 'الودائع الثابتة',
    mobile: 'الخدمات المصرفية المحمولة',
    statements: 'الكشوفات',
    support: 'الدعم',
    security: 'الأمان',
    notifications: 'الإشعارات'
  }
};

// Mock exchange rate data - replace with real API
const mockExchangeRates: ExchangeRate[] = [
  { currency: 'USD', rate: 1.0000, change: 0.0012, trend: 'up' },
  { currency: 'EUR', rate: 0.8456, change: -0.0023, trend: 'down' },
  { currency: 'GBP', rate: 0.7834, change: 0.0045, trend: 'up' },
  { currency: 'JPY', rate: 149.23, change: -0.34, trend: 'down' },
  { currency: 'CAD', rate: 1.3456, change: 0.0078, trend: 'up' }
];

// Header Component
const Header: React.FC<HeaderProps> = ({ currentLanguage, setCurrentLanguage, isMenuOpen, setIsMenuOpen, t }) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center">
            <div className=" text-white px-3 py-2 rounded-lg font-bold text-lg">
                <Image src={logo} alt="Demo Bank Logo" width={90} height={90} className="inline-block mr-2" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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

            {/* Desktop Menu Items */}
            <div className="flex items-center space-x-1">
              <MenuButton icon={User} text={t.profile} />
              <MenuButton icon={Settings} text={t.settings} />
              <MenuButton icon={Headphones} text={t.customerCare} />
              <MenuButton icon={Info} text={t.about} />
              <MenuButton icon={LogOut} text={t.logout} />
            </div>
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
            {/* Language selector for mobile */}
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
            
            {/* Mobile menu items */}
            <MobileMenuItem icon={User} text={t.profile} />
            <MobileMenuItem icon={Settings} text={t.settings} />
            <MobileMenuItem icon={Headphones} text={t.customerCare} />
            <MobileMenuItem icon={Info} text={t.about} />
            <MobileMenuItem icon={LogOut} text={t.logout} />
          </div>
        </div>
      )}
    </header>
  );
};

const MenuButton: React.FC<MenuButtonProps> = ({ icon: Icon, text }) => (
  <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
    <Icon size={16} />
    <span>{text}</span>
  </button>
);

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ icon: Icon, text }) => (
  <button className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
    <Icon size={20} />
    <span>{text}</span>
  </button>
);

// Welcome Section Component
const WelcomeSection: React.FC<WelcomeSectionProps> = ({ t }) => (
  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6 animate-fadeIn">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t.goodMorning},
        </h1>
        <p className="text-xl text-gray-700 font-semibold">John Doe</p>
      </div>
      <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
        <AlertTriangle size={20} className="text-red-500" />
        <span className="font-medium">{t.accountDisabled}</span>
      </div>
    </div>
  </div>
);

// Balance Section Component
const BalanceSection: React.FC<BalanceSectionProps> = ({ t }) => {
  const [showAvailableBalance, setShowAvailableBalance] = useState(false);
  const [showLedgerBalance, setShowLedgerBalance] = useState(false);

  const availableBalance = 25750.00;
  const ledgerBalance = 28350.00;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.availableBalance}</h3>
          <button
            onClick={() => setShowAvailableBalance(!showAvailableBalance)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showAvailableBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="text-3xl font-bold text-green-600">
          {showAvailableBalance ? `$${availableBalance.toLocaleString()}` : '••••••'}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.ledgerBalance}</h3>
          <button
            onClick={() => setShowLedgerBalance(!showLedgerBalance)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showLedgerBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="text-3xl font-bold text-green-600">
          {showLedgerBalance ? `$${ledgerBalance.toLocaleString()}` : '••••••'}
        </div>
      </div>
    </div>
  );
};

// Exchange Rates Component
const ExchangeRates: React.FC<ExchangeRatesProps> = ({ t }) => {
  const [rates, setRates] = useState(mockExchangeRates);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRates(prevRates => 
        prevRates.map(rate => ({
          ...rate,
          change: (Math.random() - 0.5) * 0.01,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {rates.map((rate) => (
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
const QuickActions: React.FC<QuickActionsProps> = ({ t, setShowModal }) => {
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
const RecentActivity: React.FC<RecentActivityProps> = ({ t }) => (
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

// Modal Component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, action, t }) => {
  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
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

  const t = translations[currentLanguage];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        t={t}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection t={t} />
        <BalanceSection t={t} />
        <ExchangeRates t={t} />
        <QuickActions t={t} setShowModal={setShowModal} />
        <RecentActivity t={t} />
      </main>

      <Modal 
        isOpen={showModal !== null}
        onClose={() => setShowModal(null)}
        action={showModal}
        t={t}
      />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
