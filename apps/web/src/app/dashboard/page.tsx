'use client';

import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AppointmentsTab,
  AvatarSelectionModal,
  DashboardHeader,
  DashboardTabs,
  FavoritesTab,
  LoadingState,
  MessagesTab,
  OverviewTab,
} from './components';
import { Appointment, Chat, Favorite, TabId } from './types';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Get tab from URL query param
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Avatar state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  // Update avatar when user loads
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleAvatarSelect = (newAvatar: string) => {
    setAvatar(newAvatar);
    setIsAvatarModalOpen(false);
    // TODO: Persist avatar change to backend
  };

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ['overview', 'appointments', 'favorites', 'messages'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [appointmentsRes, favoritesRes, chatsRes] = await Promise.allSettled([
          apiClient.get('/appointments/my'),
          apiClient.get('/favorites'),
          apiClient.get('/chats'),
        ]);

        if (appointmentsRes.status === 'fulfilled') {
          setAppointments(appointmentsRes.value.data || []);
        }
        if (favoritesRes.status === 'fulfilled') {
          // Handle both array and paginated response
          const data = favoritesRes.value.data as any;
          setFavorites(Array.isArray(data) ? data : data?.favorites || []);
        }
        if (chatsRes.status === 'fulfilled') {
          // Handle both array and paginated response
          const data = chatsRes.value.data as any;
          setChats(Array.isArray(data) ? data : data?.chats || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setCancellingId(appointmentId);
    try {
      await apiClient.post(`/appointments/${appointmentId}/cancel`, {
        reason: 'Cancelled by customer',
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
      );
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert('Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, businessId: string) => {
    try {
      await apiClient.delete(`/favorites/business/${businessId}`);
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  // Filter appointments
  const upcomingAppointments = appointments.filter(
    (a) =>
      (a.status === 'pending' || a.status === 'confirmed') &&
      new Date(a.appointmentDate) >= new Date(new Date().setHours(0, 0, 0, 0))
  );
  const pastAppointments = appointments.filter(
    (a) =>
      a.status === 'completed' ||
      a.status === 'cancelled' ||
      a.status === 'no_show' ||
      new Date(a.appointmentDate) < new Date(new Date().setHours(0, 0, 0, 0))
  );

  const unreadCount = chats.filter((c) => c.unreadCount > 0).length;

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      {/* Header */}
      <DashboardHeader
        firstName={user?.firstName}
        email={user?.email}
        avatar={avatar}
        onAvatarClick={() => setIsAvatarModalOpen(true)}
      />

      {/* Tabs */}
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        upcomingCount={upcomingAppointments.length}
        favoritesCount={favorites.length}
        unreadCount={unreadCount}
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            upcomingAppointments={upcomingAppointments}
            favorites={favorites}
            chats={chats}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'appointments' && (
          <AppointmentsTab
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
            cancellingId={cancellingId}
            onCancelAppointment={handleCancelAppointment}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesTab favorites={favorites} onRemoveFavorite={handleRemoveFavorite} />
        )}

        {activeTab === 'messages' && <MessagesTab chats={chats} />}
      </div>

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={avatar}
      />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
