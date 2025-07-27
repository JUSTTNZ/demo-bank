import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  X, 
  Headphones, 
  LogOut 
} from 'lucide-react';
import { Translation, UserProfile } from '@/types/userTypes';
import { languages } from '../../utils/constants';

interface HeaderProps {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  isMenuOpen: boolean;
  onSignOut: () => void;
  setIsMenuOpen: (open: boolean) => void;
  t: Translation;
  userProfile: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentLanguage, 
  setCurrentLanguage, 
  isMenuOpen, 
  setIsMenuOpen,
  onSignOut,
  t,
  userProfile
}) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const avatarUrl = userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-bold text-lg">
              DemoBank
            </div>
          </div>

          {/* User Info & Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/userprofile" className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200">
              <div className="relative w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-300 transition-all duration-200">
                <Image 
                  src={avatarUrl}
                  alt="User Avatar" 
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {userProfile?.full_name}
              </span>
            </Link>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                <span>{languages.find(lang => lang.code === currentLanguage)?.name}</span>
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <Link href={'/chatpage'} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                <Headphones size={16} />
                <span>{t.support}</span>
            </Link>
        
            <button onClick={onSignOut} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <LogOut size={16} />
              <span>{t.logout}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User info */}
            <div className="flex items-center space-x-3 px-3 py-2 mb-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image 
                  src={avatarUrl}
                  alt="User Avatar" 
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{userProfile?.full_name}</span>
            </div>

            {/* Language selector */}
            <div className="border-b border-gray-200 pb-2 mb-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Language</div>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      currentLanguage === lang.code 
                        ? 'bg-green-50 text-green-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Menu items */}
            <Link href={"/chatpage"} className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <Headphones size={20} />
              <span>{t.support}</span>
            </Link>
            
            <button onClick={onSignOut} className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <LogOut size={20} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};