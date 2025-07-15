import supabase from '@/utils/supabaseClient';
import { UserProfile, ExchangeRate } from '@/types/userTypes';

export const userApi = {
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    // Fetch user profile with account
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        accounts:accounts(
          id,
          account_number,
          balance,
          currency,
          status
        )
      `)
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    

    return {
      ...profile,
    };
  },

  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    // Simplified version that matches your needs
    return [
      { currency: 'USD', rate: 1.0000, change: 0.0012, trend: 'up' },
      { currency: 'EUR', rate: 0.8456, change: -0.0023, trend: 'down' },
      { currency: 'GBP', rate: 0.7834, change: 0.0045, trend: 'up' }
    ];
  }
};