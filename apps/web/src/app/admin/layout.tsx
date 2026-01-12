'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login?redirect=/admin');
        return;
      }
      
      if (user.role !== 'ADMIN') {
        router.replace('/');
        return;
      }
      
      setIsAuthorized(true);
    }
  }, [user, isLoading, router]);

  // Show nothing while checking auth
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  // Render admin content without the main site header/footer
  return <>{children}</>;
}
