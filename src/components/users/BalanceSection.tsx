import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface BalanceSectionProps {
  t: any;
  userProfile: any;
}

export const BalanceSection: React.FC<BalanceSectionProps> = ({ t, userProfile }) => {
  const [showBalance, setShowBalance] = useState(false);
  
  const primaryAccount = userProfile?.accounts?.[0];
  const totalBalance = userProfile?.accounts?.reduce((sum: number, account: any) => sum + account.balance, 0) || 0;

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