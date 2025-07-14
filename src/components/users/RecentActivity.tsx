import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, Translation } from './types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RecentActivityProps {
  t: Translation;
  transactions: Transaction[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ t, transactions }) => {
  // Component logic and JSX from original component
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
};