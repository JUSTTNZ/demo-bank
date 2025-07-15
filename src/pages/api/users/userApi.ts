import { UserProfile, ExchangeRate } from '@/types/userTypes';

export const mockUserApi = {
  getUserProfile: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: 'user_123',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
      accounts: [
        {
          id: 'acc_1',
          account_number: '123456789',
          balance: 25750.00,
          currency: 'USD',
          type: 'checking',
          status: 'active'
        },
        {
          id: 'acc_2',
          account_number: '987654321',
          balance: 15000.00,
          currency: 'USD',
          type: 'savings',
          status: 'active'
        }
      ],
      transactions: [
        {
          id: 'txn_1',
          type: 'credit',
          amount: 2500.00,
          description: 'Salary Credit',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          category: 'Income'
        },
        {
          id: 'txn_2',
          type: 'debit',
          amount: 150.00,
          description: 'Grocery Shopping',
          date: '2024-01-14T14:20:00Z',
          status: 'completed',
          category: 'Shopping'
        },
        {
          id: 'txn_3',
          type: 'debit',
          amount: 89.99,
          description: 'Netflix Subscription',
          date: '2024-01-13T09:15:00Z',
          status: 'completed',
          category: 'Entertainment'
        },
        {
          id: 'txn_4',
          type: 'credit',
          amount: 500.00,
          description: 'Freelance Payment',
          date: '2024-01-12T16:45:00Z',
          status: 'completed',
          category: 'Income'
        },
        {
          id: 'txn_5',
          type: 'debit',
          amount: 75.00,
          description: 'Utility Bill',
          date: '2024-01-11T11:30:00Z',
          status: 'pending',
          category: 'Bills'
        }
      ]
    };
  },

  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      { currency: 'USD', rate: 1.0000, change: 0.0012, trend: 'up' },
      { currency: 'EUR', rate: 0.8456, change: -0.0023, trend: 'down' },
      { currency: 'GBP', rate: 0.7834, change: 0.0045, trend: 'up' },
      { currency: 'JPY', rate: 149.23, change: -0.34, trend: 'down' },
      { currency: 'CAD', rate: 1.3456, change: 0.0078, trend: 'up' }
    ];
  }
};