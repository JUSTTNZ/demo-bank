'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/users/Header';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import toast from 'react-hot-toast';
import { userApi } from '@/pages/api/users/userApi';
import { translations } from '@/utils/translations';
import { UserProfile } from '@/types/userTypes';
import { 
  Camera, 
  User, 
  CreditCard, 
  DollarSign, 
  LogOut, 
  ArrowUp, 
  HelpCircle,
  Shield,
  Mail,
  Calendar,
} from 'lucide-react';

export default function UserProfilePage() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const t = translations[currentLanguage];

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('user-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference whenever it changes
  useEffect(() => {
    localStorage.setItem('user-language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast.error(t.errorPleaseLogin);
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const profile = await userApi.getUserProfile(user.id);
        setUserProfile(profile);
      } catch (error) {
        toast.error(t.errorLoadProfile);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, t.errorPleaseLogin, t.errorLoadProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t.errorInvalidImage);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.errorImageSize);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userProfile?.id || '');

      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUserProfile(prev => prev ? { ...prev, avatar_url: result.avatar_url } : null);
        toast.success(t.successProfilePicture);
      } else {
        toast.error(result.error || t.errorUploadImage);
      }
    } catch (error) {
      toast.error(t.errorUploadImage);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpgradeAccount = () => {
    toast.error(t.errorAccountDisabled);
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
          <p className="text-lg font-semibold mb-4">{t.errorLoadProfile}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  const account = userProfile.accounts?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentLanguage={currentLanguage}
        setCurrentLanguage={handleLanguageChange}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        t={t}
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <Image
                  src={userProfile.avatar_url || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'} 
                  alt="Profile Avatar" 
                  width={32}
                  height={32}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          <div className="pt-20 pb-6 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userProfile.full_name}</h1>
                <p className="text-gray-600 mt-1">{userProfile.email}</p>
                <div className="flex items-center mt-2">
                  <Shield className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    {account?.status === 'disabled' ? t.verifiedAccount : t.pendingVerification}
                  </span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={handleUpgradeAccount}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowUp size={16} />
                  <span>{t.upgradeAccount}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              {t.accountDetails}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">{t.accountNumber}</span>
                <span className="font-mono text-gray-900">{account?.account_number}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">{t.currentBalance}</span>
                <span className="font-semibold text-2xl text-green-600">
                  ${account?.balance?.toLocaleString()} {account?.currency}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">{t.accountStatus}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  account?.status === 'disabled' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-red-800'
                }`}>
                  {account?.status === 'disabled' ? t.active : t.pending}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">{t.currency}</span>
                <span className="font-medium text-gray-900">{account?.currency}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.quickActions}</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/user')}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.dashboard}</p>
                  <p className="text-sm text-gray-600">{t.viewDashboard}</p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (account?.status === 'disabled') {
                    router.push('/transactions');
                  } else {
                    toast.error(t.errorAccountDisabled);
                  }
                }}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.transactions}</p>
                  <p className="text-sm text-gray-600">{t.viewTransactions}</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/faq')}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HelpCircle size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.faq}</p>
                  <p className="text-sm text-gray-600">{t.getHelp}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.profileInformation}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-900">{userProfile.full_name}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailAddress}</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-900">{userProfile.email}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.accountType}</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Shield size={16} className="text-gray-400" />
                  <span className="text-gray-900">{t.standardAccount}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.memberSince}</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-900">January 2024</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2">
              <HelpCircle size={16} className="text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {t.profileEditNotice}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}