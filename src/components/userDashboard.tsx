'use client'
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/users/Modal';
import { Header } from '@/components/users/Header';
import { WelcomeSection } from '@/components/users/WelcomeSection';
import { BalanceSection } from '@/components/users/BalanceSection';
import { ExchangeRates } from '@/components/users/ExchangeRates';
import { QuickActions } from '@/components/users/QuickActions';
import { RecentActivity } from '@/components/users/RecentActivity';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import toast from 'react-hot-toast';
import { userApi } from '@/pages/api/users/userApi';
import { translations } from '../utils/translations';
import { UserProfile, QuickAction } from '@/types/userTypes';
import { useSelector } from 'react-redux';

// Define possible modal actions
type ModalAction = 'deposit' | 'withdraw' | 'transfer' | 'exchange' | null;
 interface Language {
  code: string;
  name: string;
  flag: string;
}
 interface LanguageState {
  currentLanguage: string;
  availableLanguages: Language[];
}

interface RootState {
  language: LanguageState;
}
export default function UserDashboard() {
    const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState<ModalAction>(null);
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const t = translations[currentLanguage];

  useEffect(() => {
    const fetchUserData = async () => {
      // Get the current user session
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast.error('Please login to access this page');
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const profile = await userApi.getUserProfile(user.id);
        setUserProfile(profile);
      } catch (error) {
        toast.error('Failed to load user profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleQuickAction = (action: QuickAction) => {
    setSelectedAction(action);
    
    // Map action keys to modal actions
    switch (action.key) {
      case 'sendMoney':
        setShowModal('transfer');
        break;
      case 'deposits':
        setShowModal('deposit');
        break;
      case 'withdraw':
        setShowModal('withdraw');
        break;
      case 'forex':
        setShowModal('exchange');
        break;
      default:
        toast(`${action.name} feature coming soon!`);
        break;
    }
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setSelectedAction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">Unable to load your profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        // currentLanguage={currentLanguage}
        // setCurrentLanguage={setCurrentLanguage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        t={t}
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection t={t} userProfile={userProfile} />
        <BalanceSection t={t} userProfile={userProfile} />
        <ExchangeRates t={t} />
        <QuickActions t={t} onActionClick={handleQuickAction} />
        <RecentActivity title="Transaction History" emptyMessage="You haven't made any transactions yet" />
      </main>

      <Modal
        isOpen={showModal !== null}
        onClose={handleCloseModal}
        action={selectedAction}
        t={t}
        userProfile={userProfile}  
      />
    </div>
  );
}

