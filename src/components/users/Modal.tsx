import React from 'react';
import { X } from 'lucide-react';

interface QuickAction {
  name: string;
  icon: React.ElementType;
  key: string;
}

interface UserProfile {
  accounts: {
    status: string;
  }[];
}

interface Translation {
  close?: string;
  cancel?: string;
  proceed?: string;
  proceedMessage?: string;
  accountDisabled?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: QuickAction | null;
  t: Translation;
  userProfile: UserProfile;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, action, t, userProfile }) => {
  if (!isOpen || !action) return null;

  const primaryAccount = userProfile?.accounts?.[0];
  const isAccountDisabled = primaryAccount?.status === 'disabled';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={t.close || 'Close'}
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-center py-6">
          <action.icon size={48} className="text-green-600 mx-auto mb-4" />

          {isAccountDisabled ? (
            <>
              <p className="text-red-600 mb-6 font-medium">
                {t.accountDisabled || 'Your account is disabled. Please contact support.'}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.close || 'Close'}
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                {t.proceedMessage || `You are about to access ${action.name}. Would you like to proceed?`}
              </p>

              <form onSubmit={(e) => { e.preventDefault(); alert("Form submitted!") }}>
                <input
                  type="text"
                  placeholder="Recipient"
                  className="w-full border rounded p-2 mb-3"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full border rounded p-2 mb-4"
                  required
                />

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t.cancel || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t.proceed || 'Proceed'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
