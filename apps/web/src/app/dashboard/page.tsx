'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Appointment, Favorite, Chat, TabId } from './types';
import {
  DashboardHeader,
  QuickStats,
  DashboardTabs,
  AppointmentsTab,
  FavoritesTab,
  MessagesTab,
  SettingsTab,
  LoadingState,
} from './components';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Get tab from URL query param
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ['appointments', 'favorites', 'messages', 'settings'].includes(tabFromUrl)) {
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
          setFavorites(favoritesRes.value.data || []);
        }
        if (chatsRes.status === 'fulfilled') {
          setChats(chatsRes.value.data || []);
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
      await apiClient.post(`/appointments/${appointmentId}/cancel`, { reason: 'Cancelled by customer' });
      setAppointments(prev =>
        prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a)
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
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  // Filter appointments
  const upcomingAppointments = appointments.filter(a =>
    (a.status === 'pending' || a.status === 'confirmed') &&
    new Date(a.appointmentDate) >= new Date(new Date().setHours(0, 0, 0, 0))
  );
  const pastAppointments = appointments.filter(a =>
    a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show' ||
    new Date(a.appointmentDate) < new Date(new Date().setHours(0, 0, 0, 0))
  );

  const unreadCount = chats.filter(c => c.unreadCount > 0).length;

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <DashboardHeader
        firstName={user?.firstName}
        email={user?.email}
        onLogout={logout}
      />

      {/* Quick Stats */}
      <QuickStats
        upcomingCount={upcomingAppointments.length}
        favoritesCount={favorites.length}
        messagesCount={chats.length}
        completedCount={pastAppointments.filter(a => a.status === 'completed').length}
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
        {activeTab === 'appointments' && (
          <AppointmentsTab
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
            cancellingId={cancellingId}
            onCancelAppointment={handleCancelAppointment}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesTab
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesTab chats={chats} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
