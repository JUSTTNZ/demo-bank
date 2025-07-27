import React from 'react';
import { X } from 'lucide-react';
import { QuickAction, Translation } from '@/types/userTypes';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: QuickAction | null;
  t: Translation;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, action, t }) => {
  if (!isOpen || !action) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
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
            <p className="text-gray-600 mb-6">
              {t.proceedMessage || `You are about to access ${action.name}. Would you like to proceed?`}
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                onClick={() => alert(t.accountDisabled || 'Account disabled at the moment')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {t.proceed || 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};