import React from 'react';
import { FileText } from 'lucide-react';

interface RecentActivityProps {
  title: string;
  emptyMessage: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  title = "Recent Activity", 
  emptyMessage = "No recent activity at the moment" 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <FileText size={48} className="mx-auto" />
        </div>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    </div>
  );
};