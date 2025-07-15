import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Language } from '@/types/userTypes';
import { languages } from '../../utils/constants';

interface HeaderProps {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  isMenuOpen: boolean;
  onSignOut: () => void;
  setIsMenuOpen: (open: boolean) => void;
  t: any;
  userProfile: any;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentLanguage, 
  setCurrentLanguage, 
  isMenuOpen, 
  setIsMenuOpen,
  onSignOut,
  t,
  userProfile,
  isLoggedIn
}) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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

          {/* Desktop Navigation - Only show when logged in */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                  <span>{languages.find(lang => lang.code === currentLanguage)?.name}</span>
                  {isLangDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                          className={`flex items-center space-x-3 w-full text-left px-4 py-2 text-sm ${
                            currentLanguage === lang.code 
                              ? 'bg-green-50 text-green-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                <Settings size={16} />
                <span>{t.settings}</span>
              </button>
              
              {/* Logout */}
              <button 
                onClick={onSignOut} 
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
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
            {/* Only show user profile when logged in */}
            {isLoggedIn && (
              <>
                {/* User info */}
                <div className="flex items-center space-x-3 px-3 py-2 rounded-md bg-gray-50 mb-2">
                  <img 
                    src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'} 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{userProfile?.full_name}</div>
                    <div className="text-xs text-gray-500">{userProfile?.email}</div>
                  </div>
                </div>

                {/* Language selector */}
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <div className="text-sm font-medium text-gray-700 mb-2 px-3">{t.language}</div>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                          currentLanguage === lang.code 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Settings */}
                <button className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                  <Settings size={20} />
                  <span>{t.settings}</span>
                </button>
              </>
            )}

            {/* Logout (if logged in) or Login (if logged out) */}
            <button
              onClick={onSignOut}
              className={`flex items-center space-x-3 w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isLoggedIn 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              <LogOut size={20} />
              <span>{isLoggedIn ? t.logout : t.login}</span>
            </button>
          </div>
        </div>
      )}

      {/* User profile after logout (Web only) */}
      {!isLoggedIn && (
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <img 
              src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{userProfile?.full_name}</div>
              <div className="text-xs text-gray-500">Last active: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};