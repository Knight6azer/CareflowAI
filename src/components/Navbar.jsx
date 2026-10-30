import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, Shield, Sparkles, ArrowRight, LogIn, Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';
import Modal from './Modal';

export default function Navbar() {
  const { language, setLanguage, languages, currentLanguageObj, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const location = useLocation();

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.scan', 'Scan Report'), path: '/scan' },
    { name: t('nav.reports', 'My Reports'), path: '/reports' },
    { name: t('nav.about', 'About'), path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl p-1"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 group-hover:bg-teal-700 flex items-center justify-center text-white shadow-sm shadow-teal-600/30 transition-all duration-200">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">{t('nav.brand', 'CareFlow')}</span>
                  <span className="font-bold text-teal-600 text-lg sm:text-xl">{t('nav.brandSuffix', 'AI')}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1 hidden sm:block">
                  {t('nav.tagline', 'Patient Health Intelligence')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Side CTA & Language Switcher */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Selector Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Change language"
                  aria-expanded={langDropdownOpen}
                >
                  <span className="text-base leading-none">{currentLanguageObj.flag}</span>
                  <span className="font-medium text-slate-800">{currentLanguageObj.nativeName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-2xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      {t('nav.selectLanguage', 'Select Language')}
                    </div>
                    {languages.map((lang) => {
                      const isSelected = lang.code === language;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                            isSelected 
                              ? 'bg-teal-50 text-teal-700 font-bold' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.nativeName}</div>
                              <div className="text-[10px] text-slate-400">{lang.name}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => openAuth('login')}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors"
              >
                {t('nav.login', 'Login')}
              </button>
              <Button
                variant="primary"
                size="md"
                onClick={() => openAuth('register')}
              >
                {t('nav.getStarted', 'Get Started')}
              </Button>
            </div>

            {/* Mobile Actions: Language + Hamburger Toggle */}
            <div className="flex md:hidden items-center gap-2">
              {/* Compact Mobile Language Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                  aria-label="Change language"
                >
                  <span className="text-sm">{currentLanguageObj.flag}</span>
                  <span className="uppercase text-[11px] font-bold">{currentLanguageObj.code}</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left ${
                          lang.code === language ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-semibold rounded-xl transition-colors ${
                      active
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Language grid in mobile drawer */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('nav.selectLanguage', 'Select Language')}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-colors ${
                      lang.code === language
                        ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => openAuth('login')}
                icon={LogIn}
              >
                {t('nav.login', 'Login')}
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => openAuth('register')}
              >
                {t('nav.getStarted', 'Get Started')}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Authentication Mock Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'login' ? t('auth.welcomeBack', 'Welcome Back to CareFlow AI') : t('auth.getStarted', 'Get Started with CareFlow AI')}
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-500">
            {authMode === 'login' 
              ? t('auth.loginDesc', 'Log in to view your saved medical reports and track your parameters over time.') 
              : t('auth.registerDesc', 'Create a free account to store and understand your lab test results securely.')}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setAuthModalOpen(false); }} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('auth.email', 'Email Address')}</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('auth.password', 'Password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth size="md">
              {authMode === 'login' ? t('auth.signIn', 'Sign In') : t('auth.createAccount', 'Create Free Account')}
            </Button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              {authMode === 'login' 
                ? t('auth.dontHave', "Don't have an account? Sign up") 
                : t('auth.alreadyHave', "Already have an account? Sign in")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
