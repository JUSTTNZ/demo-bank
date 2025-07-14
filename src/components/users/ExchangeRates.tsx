import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { Translation } from './types';

interface ExchangeRatesProps {
  t: Translation;
}

export const ExchangeRates: React.FC<ExchangeRatesProps> = ({ t }) => {
  const { exchangeRates, loading, error } = useExchangeRates();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
        <div className="text-center py-4">
          <div className="text-gray-600">{t.loading}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-green-600 hover:text-green-700"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exchangeRates}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {exchangeRates.map((rate) => (
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