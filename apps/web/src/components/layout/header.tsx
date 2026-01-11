'use client';

import { Logo } from '@/components/shared';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useRegion } from '@/contexts/region-context';
import { useTheme } from '@/contexts/theme-context';
import { Check, ChevronDown, Globe, Languages, Loader2, Menu, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { UserMenu } from './user-menu';

function LanguageSelector({ isDark = true }: { isDark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'regions' | 'languages'>('regions');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    region, 
    language, 
    languages, 
    regions, 
    isLoading, 
    setRegion, 
    setLanguage 
  } = useRegion();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('regions');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle region selection
  const handleRegionSelect = async (regionCode: string) => {
    await setRegion(regionCode);
    setView('languages');
  };

  // Handle language selection
  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
    setView('regions');
  };

  // Get current language name
  const currentLangName = languages.find(l => l.code === language)?.nativeName || 'English';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
          isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
        }`}
        aria-label="Choose language and region"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span className="text-xl">{region?.flagEmoji || '🌍'}</span>
            <span className={`text-xs hidden sm:block ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
              {currentLangName}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/50' : 'text-slate-400'}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden rounded-2xl shadow-2xl animate-fade-in z-50 ${
            isDark
              ? 'bg-neutral-900 border border-white/10 shadow-black/50'
              : 'bg-white border border-slate-200 shadow-slate-200/50'
          }`}
        >
          {/* Tab Header */}
          <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <button
              onClick={() => setView('regions')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                view === 'regions'
                  ? isDark ? 'text-white bg-white/5 border-b-2 border-purple-500' : 'text-slate-900 bg-slate-50 border-b-2 border-purple-500'
                  : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              Region
            </button>
            <button
              onClick={() => setView('languages')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                view === 'languages'
                  ? isDark ? 'text-white bg-white/5 border-b-2 border-purple-500' : 'text-slate-900 bg-slate-50 border-b-2 border-purple-500'
                  : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Languages className="w-4 h-4" />
              Language
            </button>
          </div>

          {/* Region List */}
          {view === 'regions' && (
            <div className="p-2 max-h-80 overflow-y-auto">
              {regions.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Loading regions...</p>
                </div>
              ) : (
                regions.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => handleRegionSelect(r.code)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                      region?.code === r.code
                        ? isDark
                          ? 'bg-purple-500/20 text-white'
                          : 'bg-purple-500/20 text-purple-700'
                        : isDark
                          ? 'text-white/70 hover:bg-white/5 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-2xl">{r.flagEmoji}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                        {r.currency.symbol} {r.currency.code}
                      </p>
                    </div>
                    {region?.code === r.code && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Language List */}
          {view === 'languages' && (
            <div className="p-2 max-h-80 overflow-y-auto">
              {languages.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                  <Languages className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a region first</p>
                </div>
              ) : (
                <>
                  <div className={`px-3 py-2 text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    Languages available in {region?.name}
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                        language === lang.code
                          ? isDark
                            ? 'bg-purple-500/20 text-white'
                            : 'bg-purple-500/20 text-purple-700'
                          : isDark
                            ? 'text-white/70 hover:bg-white/5 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isDark ? 'bg-white/10' : 'bg-slate-100'
                      }`}>
                        {lang.code.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{lang.nativeName}</p>
                        <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                          {lang.name} {lang.isRTL && '• RTL'}
                        </p>
                      </div>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Current Selection Footer */}
          <div className={`p-3 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
            <div className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              Currently: <span className="font-medium">{region?.flagEmoji} {region?.name}</span> • <span className="font-medium">{currentLangName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for glass effect intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/business/login');

  // Don't show header on auth pages
  if (isAuthPage) return null;

  // Surprise Me - Random category or search
  const handleSurpriseMe = () => {
    const surprises = [
      '/search?q=spa',
      '/search?q=restaurant',
      '/search?q=fitness',
      '/search?q=salon',
      '/search?q=cafe',
      '/categories',
    ];
    const random = surprises[Math.floor(Math.random() * surprises.length)];
    router.push(random);
  };

  const navLinks = [
    { href: '/search', label: 'Explore', icon: Search },
    { href: '/about', label: 'About', icon: Info },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
            : 'bg-white/80 backdrop-blur-xl border-b border-slate-200'
          : ''
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" className={isDark ? 'text-white' : 'text-slate-900'} />

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-full ${
                  pathname === link.href
                    ? isDark
                      ? 'text-white bg-white/10'
                      : 'text-slate-900 bg-slate-100'
                    : isDark
                      ? 'text-white/70 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {/* Surprise Me Button */}
            <button
              onClick={handleSurpriseMe}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors ${
                isDark
                  ? 'text-white/70 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Surprise Me
            </button>
          </div>

          {/* Right Side - Theme Toggle + Globe Selector + User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Globe/Language Selector - Airbnb Style */}
            <LanguageSelector isDark={isDark} />

            {/* User Menu Dropdown */}
            <UserMenu />
          </div>

          {/* Mobile Menu Button - Larger touch target */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              className={`p-3 -mr-2 rounded-lg transition-colors active:scale-95 ${
                isDark
                  ? 'text-white/70 hover:text-white active:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Full screen overlay with better UX */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <div
              className={`fixed top-0 right-0 h-full w-[85vw] max-w-sm z-50 md:hidden animate-slide-in-right ${
                isDark
                  ? 'bg-neutral-900 border-l border-white/10'
                  : 'bg-white border-l border-slate-200'
              }`}
            >
              {/* Menu Header */}
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <Logo size="sm" className={isDark ? 'text-white' : 'text-slate-900'} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="px-4 py-6 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all active:scale-[0.98] ${
                      pathname === link.href
                        ? isDark
                          ? 'bg-purple-500/20 text-white'
                          : 'bg-purple-500/10 text-purple-700'
                        : isDark
                          ? 'text-white/80 hover:bg-white/5 active:bg-white/10'
                          : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

                <button
                  onClick={() => {
                    handleSurpriseMe();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full py-4 px-4 rounded-xl transition-all active:scale-[0.98] ${
                    isDark
                      ? 'text-white/80 hover:bg-white/5 active:bg-white/10'
                      : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Surprise Me</span>
                </button>

                {/* Divider */}
                <div className={`my-4 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                {isAuthenticated ? (
                  <>
                    {/* Show Admin Dashboard for admin users, regular dashboard for others */}
                    <Link
                      href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all active:scale-[0.98] ${
                        pathname === '/dashboard' || pathname === '/admin'
                          ? isDark
                            ? 'bg-purple-500/20 text-white'
                            : 'bg-purple-500/10 text-purple-700'
                          : isDark
                            ? 'text-white/80 hover:bg-white/5 active:bg-white/10'
                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <span className="font-medium">{user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}</span>
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all active:scale-[0.98] ${
                        isDark
                          ? 'text-white/80 hover:bg-white/5 active:bg-white/10'
                          : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <span className="font-medium">Messages</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium transition-all active:scale-[0.98] ${
                        isDark
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/business/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center py-4 px-4 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-500 transition-all active:scale-[0.98]"
                    >
                      List Your Business
                    </Link>
                  </>
                )}

                {/* Language Selector in Mobile */}
                <div
                  className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                >
                  <p
                    className={`px-4 mb-2 text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-slate-400'
                    }`}
                  >
                    Language & Region
                  </p>
                  <LanguageSelector isDark={isDark} />
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
