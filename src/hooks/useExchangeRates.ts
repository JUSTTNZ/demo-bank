import { useState, useEffect } from 'react';
import { ExchangeRate } from '@/types/userTypes';
import { userApi } from '@/pages/api/users/userApi';

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rates = await userApi.getExchangeRates();
        setExchangeRates(rates);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError('Failed to load exchange rates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { exchangeRates, loading, error };
};