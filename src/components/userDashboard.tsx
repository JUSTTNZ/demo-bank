import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/users/Modal';
import { Header } from '@/components/users/Header';
import { WelcomeSection } from '@/components/users/WelcomeSection';
import { BalanceSection } from '@/components/users/BalanceSection';
import { ExchangeRates } from '@/components/users/ExchangeRates';
import { QuickActions } from '@/components/users/QuickActions';
import { RecentActivity } from '@/components/users/RecentActivity';

import { mockUserApi } from '@/pages/api/users/userApi';
import { translations } from '../utils/translations';
import { UserProfile } from '@/types/userTypes';

export default function UserDashboard() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[currentLanguage];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await mockUserApi.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
          {/* Error state */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        t={t}
        userProfile={userProfile}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection t={t} userProfile={userProfile} />
        <BalanceSection t={t} userProfile={userProfile} />
        <ExchangeRates t={t} />
        <QuickActions t={t} setShowModal={setShowModal} />
        <RecentActivity t={t} transactions={userProfile.transactions} />
      </main>

      <Modal 
        isOpen={showModal !== null}
        onClose={() => setShowModal(null)}
        action={showModal}
        t={t}
      />
    </div>
  );
}