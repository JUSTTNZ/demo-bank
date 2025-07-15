import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, Translation } from '@/types/userTypes';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RecentActivityProps {
  t: Translation;
  transactions: Transaction[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ t, transactions }) => {
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