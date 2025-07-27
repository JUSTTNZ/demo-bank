'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { translations } from '@/utils/translations';
import { Header } from '@/components/users/Header';
import { Search, ChevronDown, ChevronUp, HelpCircle, CreditCard, DollarSign, Shield, User, Smartphone } from 'lucide-react';
import supabase from '@/utils/supabaseClient';
import { userApi } from '@/pages/api/users/userApi';
import { UserProfile } from '@/types/userTypes';
import toast from 'react-hot-toast';

export default function FAQPage() {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  
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


  // FAQ categories and questions
  const faqCategories = [
    {
      id: 1,
      title: t.accountManagement,
      icon: <User className="w-5 h-5 mr-2" />,
      questions: [
        {
          id: 101,
          question: t.howToOpenAccount,
          answer: t.howToOpenAccountAnswer
        },
        {
          id: 102,
          question: t.howToCloseAccount,
          answer: t.howToCloseAccountAnswer
        },
        {
          id: 103,
          question: t.accountDisabledWhy,
          answer: t.accountDisabledWhyAnswer
        }
      ]
    },
    {
      id: 2,
      title: t.paymentsTransfers,
      icon: <DollarSign className="w-5 h-5 mr-2" />,
      questions: [
        {
          id: 201,
          question: t.howToSendMoney,
          answer: t.howToSendMoneyAnswer
        },
        {
          id: 202,
          question: t.transferLimits,
          answer: t.transferLimitsAnswer
        },
        {
          id: 203,
          question: t.whyTransferFailed,
          answer: t.whyTransferFailedAnswer
        }
      ]
    },
    {
      id: 3,
      title: t.cardServices,
      icon: <CreditCard className="w-5 h-5 mr-2" />,
      questions: [
        {
          id: 301,
          question: t.howToGetCard,
          answer: t.howToGetCardAnswer
        },
        {
          id: 302,
          question: t.cardBlockedWhatToDo,
          answer: t.cardBlockedWhatToDoAnswer
        },
        {
          id: 303,
          question: t.reportLostCard,
          answer: t.reportLostCardAnswer
        }
      ]
    },
    {
      id: 4,
      title: t.security,
      icon: <Shield className="w-5 h-5 mr-2" />,
      questions: [
        {
          id: 401,
          question: t.howToSecureAccount,
          answer: t.howToSecureAccountAnswer
        },
        {
          id: 402,
          question: t.suspiciousActivity,
          answer: t.suspiciousActivityAnswer
        },
        {
          id: 403,
          question: t.changePassword,
          answer: t.changePasswordAnswer
        }
      ]
    },
    {
      id: 5,
      title: t.mobileBanking,
      icon: <Smartphone className="w-5 h-5 mr-2" />,
      questions: [
        {
          id: 501,
          question: t.howToInstallApp,
          answer: t.howToInstallAppAnswer
        },
        {
          id: 502,
          question: t.appNotWorking,
          answer: t.appNotWorkingAnswer
        },
        {
          id: 503,
          question: t.biometricLogin,
          answer: t.biometricLoginAnswer
        }
      ]
    }
  ];

  // Filter questions based on search term
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Toggle FAQ item expansion
  const toggleItem = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

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
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-green-600" />
              {t.faq}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t.searchFAQs}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FAQ Categories */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <div key={category.id} className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {category.icon}
                {category.title}
              </h2>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                {category.questions.map(item => (
                  <div key={item.id} className="border-b border-gray-200 last:border-b-0">
                    <button
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => toggleItem(item.id)}
                    >
                      <span className="font-medium text-gray-900">{item.question}</span>
                      {expandedItems.includes(item.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedItems.includes(item.id) && (
                      <div className="p-4 pt-0 text-gray-600 bg-gray-50">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t.noResultsFound}</h3>
            <p className="mt-1 text-gray-500">{t.tryDifferentSearch}</p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">{t.stillNeedHelp}</h3>
            <p className="mt-2 text-gray-600">
              {t.contactSupportMessage}
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/support')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {t.contactSupport}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}