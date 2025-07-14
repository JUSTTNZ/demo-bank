import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getGreeting } from '../../utils/formatters';

interface WelcomeSectionProps {
  t: any;
  userProfile: any;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ t, userProfile }) => {
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