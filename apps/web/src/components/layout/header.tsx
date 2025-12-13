'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, MessageSquare, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
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

  const navLinks = [
    { href: '/search', label: 'Explore' },
    { href: '/categories', label: 'Categories' },
    { href: '/business/register', label: 'For Business' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" className="text-white" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm transition-colors rounded-lg ${
                  pathname === link.href 
                    ? 'text-white bg-white/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/messages"
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.firstName || 'Dashboard'}</span>
                </Link>
                <button 
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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
                  className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/messages" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Messages
                    </Link>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      className="block w-full text-left py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 text-center text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      Get started
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
