'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
// FontAwesome language icon for international language
import { FaLanguage } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const handleLanguageChange = (lng: string) => {
    document.cookie = `language=${lng}; path=/; max-age=31536000`;
    i18n.changeLanguage(lng);
    setLang(lng);
    setShowLangMenu(false);
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    router.push('/login');
  };

  const handleSignUpClick = () => {
    setIsMenuOpen(false);
    router.push('/register');
  };

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    router.push('/dashboard');
  };

  const handleNavItemClick = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };


  // Lock scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[9999] drop-shadow-xl"
    >
      {/* Main NavBar */}
  <div className="mx-auto max-w-7xl px-4 md:px-8 py-5 mt-4 h-24 md:h-auto rounded-2xl bg-white shadow-lg relative flex items-center justify-between z-[9999]">
        {/* Left - Hamburger or X */}
        <div className="md:hidden z-[10000]">
          <button
            className="text-[#ea580c]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-8 w-8 text-[#ea580c]" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-[#ea580c]" />
            )}
          </button>
        </div>

        {/* Center - Logo */}
        <div className="absolute inset-x-0 flex justify-center z-[9999]">
          <Link href="/">
            <Image
              src="/img/logo.png"
              alt="Portokalle Health"
              width={140}
              height={60}
              priority
            />
          </Link>
        </div>

        {/* Right - Mobile Auth Button */}
        <div className="md:hidden z-[10000]">
          {!loading && (
            isAuthenticated ? (
              <button
                className="flex items-center space-x-1 text-[#ea580c] font-medium"
                onClick={handleDashboardClick}
              >
                <i className="fa-solid fa-gauge-high text-lg"></i>
                <span>{t('goToDashboard') || 'Go to Dashboard'}</span>
              </button>
            ) : (
              <button
                className="flex items-center space-x-1 text-[#ea580c] font-medium"
                onClick={handleLoginClick}
              >
                <i className="fa-solid fa-arrow-right text-lg"></i>
                <span>{t('signIn')}</span>
              </button>
            )
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-10 text-[15px] font-medium text-gray-800 z-[9999]">
          <Link
            href="/individuals"
            className="text-black hover:text-[#ea580c] cursor-pointer"
            onClick={() => handleNavItemClick('/individuals')}
          >
            {t('individuals')}
          </Link>
          <Link
            href="/doctors"
            className="text-black hover:text-[#ea580c] cursor-pointer"
            onClick={() => handleNavItemClick('/organizations')}
          >
            {t('doctors')}
          </Link>
          <Link
            href="/clinicians"
            className="text-black hover:text-[#ea580c] cursor-pointer"
            onClick={() => handleNavItemClick('/clinicians')}
          >
            {t('clinicians')}
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4 ml-auto z-[9999]">
          {!loading && (
            isAuthenticated ? (
              <button
                className="bg-[#ea580c] text-white rounded-full px-6 py-2 font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
                onClick={handleDashboardClick}
              >
                {t('goToDashboard') || 'Go to Dashboard'}
              </button>
            ) : (
              <>
                <button
                  className="text-[#ea580c] hover:underline font-medium cursor-pointer"
                  onClick={handleLoginClick}
                >
                  {t('signIn')}
                </button>
                <button
                  className="bg-[#ea580c] text-white rounded-full px-6 py-2 font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
                  onClick={handleSignUpClick}
                >
                  {t('registerNow')}
                </button>
              </>
            )
          )}
          {/* Modern Globe Icon Language Switcher */}
          <div className="flex items-center ml-4 relative">
            <button
              className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 transition-colors shadow focus:outline-none ${showLangMenu ? 'ring-2 ring-[#ea580c]' : ''}`}
              style={{ transition: 'background 0.2s' }}
              onClick={() => setShowLangMenu((v) => !v)}
              aria-label="Select language"
              type="button"
            >
              <FaLanguage className={`w-5 h-5 ${showLangMenu ? 'text-white' : 'text-[#ea580c]'}`} style={{ color: showLangMenu ? '#fff' : '#ea580c', transition: 'color 0.2s' }} />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col py-2 animate-fade-in">
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-orange-50 transition-colors ${lang === 'en' ? 'font-bold text-[#ea580c]' : 'text-gray-700'}`}
                  onClick={() => handleLanguageChange('en')}
                  aria-label="Switch to English"
                >
                  <span role="img" aria-label="English">🇬🇧</span> {t('english')}
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-orange-50 transition-colors ${lang === 'al' ? 'font-bold text-[#ea580c]' : 'text-gray-700'}`}
                  onClick={() => handleLanguageChange('al')}
                  aria-label="Switch to Albanian"
                >
                  <span role="img" aria-label="Albanian">🇦🇱</span> {t('albanian')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Full Screen with White Background - Matching Screenshot */}
      {isMenuOpen && (
  <div className="absolute top-full left-0 w-full bg-white shadow-md z-[10001] flex flex-col rounded-b-2xl overflow-hidden">
          {/* Menu Items */}
          <nav className="flex flex-col">
            <Link
              href="/individuals"
              className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer"
              onClick={() => handleNavItemClick('/individuals')}
            >
              {t('individuals')}
            </Link>
            <Link
              href="/doctors"
              className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer"
              onClick={() => handleNavItemClick('/organizations')}
            >
              {t('doctors')}
            </Link>
            <Link
              href="/clinicians"
              className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer"
              onClick={() => handleNavItemClick('/clinicians')}
            >
              {t('clinicians')}
            </Link>
          </nav>

          {/* Mobile Bottom Button */}
          <div className="p-4 border-t border-gray-100">
            {!loading && (
              isAuthenticated ? (
                <button
                  className="bg-[#ea580c] text-white rounded-full py-3 px-6 w-full font-semibold cursor-pointer"
                  onClick={handleDashboardClick}
                >
                  {t('goToDashboard') || 'Go to Dashboard'}
                </button>
              ) : (
                <button
                  className="bg-[#ea580c] text-white rounded-full py-3 px-6 w-full font-semibold cursor-pointer"
                  onClick={handleSignUpClick}
                >
                  {t('registerNow')}
                </button>
              )
            )}
          </div>
        </div>
      )}

    </header>
  );
}