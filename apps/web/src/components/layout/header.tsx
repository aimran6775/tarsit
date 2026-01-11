'use client';

import { Logo } from '@/components/shared';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Check, Info, Menu, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { UserMenu } from './user-menu';

// Language/Region data
const regions = [
  { code: 'US', name: 'United States', flag: '🇺🇸', language: 'English' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', language: 'English' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', language: 'English' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', language: 'English' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', language: 'Deutsch' },
  { code: 'FR', name: 'France', flag: '🇫🇷', language: 'Français' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', language: 'Español' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', language: 'Italiano' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', language: '日本語' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', language: '한국어' },
  { code: 'CN', name: 'China', flag: '🇨🇳', language: '中文' },
  { code: 'IN', name: 'India', flag: '🇮🇳', language: 'English' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', language: 'Português' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', language: 'Español' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', language: 'العربية' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', language: 'العربية' },
];

function LanguageSelector({ isDark = true }: { isDark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
          isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
        }`}
        aria-label="Choose language and region"
      >
        <span className="text-xl">{selectedRegion.flag}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl animate-fade-in z-50 ${
            isDark
              ? 'bg-neutral-900 border border-white/10 shadow-black/50'
              : 'bg-white border border-slate-200 shadow-slate-200/50'
          }`}
        >
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Choose a language and region
            </h3>
          </div>
          <div className="p-2">
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => {
                  setSelectedRegion(region);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  selectedRegion.code === region.code
                    ? isDark
                      ? 'bg-purple-500/20 text-white'
                      : 'bg-purple-500/20 text-purple-700'
                    : isDark
                      ? 'text-white/70 hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="text-2xl">{region.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{region.name}</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                    {region.language}
                  </p>
                </div>
                {selectedRegion.code === region.code && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
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
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all active:scale-[0.98] ${
                        pathname === '/dashboard'
                          ? isDark
                            ? 'bg-purple-500/20 text-white'
                            : 'bg-purple-500/10 text-purple-700'
                          : isDark
                            ? 'text-white/80 hover:bg-white/5 active:bg-white/10'
                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <span className="font-medium">Dashboard</span>
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
