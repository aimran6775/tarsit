'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Sparkles, Search, Info, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Logo } from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
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

function LanguageSelector() {
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
        className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Choose language and region"
      >
        <span className="text-xl">{selectedRegion.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl shadow-black/50 animate-fade-in z-50">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Choose a language and region</h3>
          </div>
          <div className="p-2">
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => {
                  setSelectedRegion(region);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${selectedRegion.code === region.code
                    ? 'bg-purple-500/20 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-2xl">{region.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{region.name}</p>
                  <p className="text-xs text-white/50">{region.language}</p>
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''
        }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" className="text-white" />

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-full ${pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {/* Surprise Me Button */}
            <button
              onClick={handleSurpriseMe}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Surprise Me
            </button>
          </div>

          {/* Right Side - Globe Selector + User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Globe/Language Selector - Airbnb Style */}
            <LanguageSelector />

            {/* User Menu Dropdown */}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 animate-fade-in">
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}

              <button
                onClick={() => {
                  handleSurpriseMe();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Surprise Me
              </button>

              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Messages
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
