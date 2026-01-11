'use client';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Home, LayoutDashboard, MessageCircle, Search, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageCircle, requiresAuth: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAdmin = user?.role === 'ADMIN';

  // Filter nav items based on auth status and replace dashboard for admins
  const visibleItems = navItems
    .filter((item) => !item.requiresAuth || isAuthenticated)
    .map((item) => {
      // Replace dashboard with admin dashboard for admin users
      if (item.href === '/dashboard' && isAdmin) {
        return { ...item, href: '/admin', label: 'Admin', icon: Shield };
      }
      return item;
    });

  // Don't show on certain pages
  const hiddenPaths = ['/auth/', '/business/register', '/business/login'];
  const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-bottom ${
        isDark
          ? 'bg-neutral-900/95 border-t border-white/10'
          : 'bg-white/95 border-t border-slate-200'
      } backdrop-blur-xl`}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? isDark
                    ? 'text-purple-400'
                    : 'text-purple-600'
                  : isDark
                    ? 'text-white/50 hover:text-white/80'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Profile/Login Button */}
        <Link
          href={isAuthenticated ? '/settings' : '/auth/login'}
          className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-xl transition-all active:scale-95 ${
            pathname.startsWith('/settings') || pathname.startsWith('/auth')
              ? isDark
                ? 'text-purple-400'
                : 'text-purple-600'
              : isDark
                ? 'text-white/50 hover:text-white/80'
                : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User
            className={`h-5 w-5 ${pathname.startsWith('/settings') ? 'scale-110' : ''} transition-transform`}
          />
          <span className="text-[10px] font-medium">{isAuthenticated ? 'Profile' : 'Login'}</span>
        </Link>
      </div>
    </nav>
  );
}
