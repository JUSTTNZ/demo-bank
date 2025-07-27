import React from 'react';
import { 
  Send, 
  FileText, 
  DollarSign, 
  PiggyBank, 
  Building, 
  Wallet,
  Phone,
  Globe,
  Shield,
  Settings,
  TrendingUp,
  TrendingDown,
  Headphones,
  CreditCard
} from 'lucide-react';
import { Translation } from '@/types/userTypes';
import { QuickAction } from '@/types/userTypes';


interface QuickActionsProps {
  t: Translation;
  setShowModal: (action: 'deposit' | 'withdraw' | 'transfer' | 'exchange' | null) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ t, setShowModal }) => {
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