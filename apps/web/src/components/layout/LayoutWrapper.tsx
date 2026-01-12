'use client';

import { Footer, Header } from '@/components/layout';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MessagesWidget } from '@/components/messages';
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Admin pages have their own layout, don't show main header/footer
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col min-h-screen page-enter">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <MessagesWidget />
    </div>
  );
}
