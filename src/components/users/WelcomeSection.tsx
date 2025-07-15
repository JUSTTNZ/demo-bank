import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getGreeting } from '@/utils/formatters';

interface Account {
  status: 'active' | 'disabled' | 'suspended';
  // Add other account properties as needed
}

interface UserProfile {
  full_name: string;
  email: string;
  accounts?: Account[];
  // Add other profile properties as needed
}

interface Translation {
  accountDisabled: string;
  accountActive: string;
  // Add other translation keys as needed
}

interface WelcomeSectionProps {
  t: Translation;
  userProfile: UserProfile;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ t, userProfile }) => {
  const primaryAccount = userProfile?.accounts?.[0];
  const isAccountDisabled = primaryAccount?.status === 'disabled';

  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting(t)},
          </h1>
          <p className="text-xl text-gray-700 font-semibold">{userProfile.full_name}</p>
          <p className="text-sm text-gray-600 mt-1">{userProfile.email}</p>
        </div>
        
        {/* Account Status Indicator */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
          isAccountDisabled 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {!isAccountDisabled ? (
            <>
              <AlertTriangle size={20} className="text-red-600" />
              <span className="font-medium">{t.accountDisabled}</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-medium">{t.accountActive}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Disabled Account Warning (only shows when disabled) */}
      {isAccountDisabled && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p>Your account is currently disabled. Please contact support.</p>
        </div>
      )}
    </div>
  );
};