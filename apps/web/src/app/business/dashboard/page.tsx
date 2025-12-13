'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { useSearchParams } from 'next/navigation';
import {
  DashboardHeader,
  LoadingState,
  NoBusinessState,
  BusinessHeader,
  DashboardTabs,
  OverviewTab,
  AppointmentsTab,
  ReviewsTab,
  PhotosTab,
  TeamTab,
  InviteModal,
  HoursTab,
  SettingsTab,
  OnboardingChecklist,
} from './components';
import type {
  Tab,
  Business,
  BusinessStats,
  Appointment,
  TeamMember,
  BusinessHours,
  Review,
  AppointmentSettings,
  InvitePermissions,
} from './types';

function Dashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [, setBusinessHours] = useState<BusinessHours[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Appointments state
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Team invite state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [invitePermissions, setInvitePermissions] = useState<InvitePermissions>({
    canManageAppointments: true,
    canManageChat: true,
    canEditBusiness: false,
    canManageTeam: false,
  });
  const [isInviting, setIsInviting] = useState(false);
  
  // Hours editing state
  const [editedHours, setEditedHours] = useState<BusinessHours[]>([]);
  const [isSavingHours, setIsSavingHours] = useState(false);
  
  // Settings state
  const [appointmentSettings, setAppointmentSettings] = useState<AppointmentSettings>({
    appointmentsEnabled: false,
    appointmentDuration: 60,
    appointmentBuffer: 15,
    advanceBookingDays: 30,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/business/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch business data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const businessRes = await apiClient.get('/businesses/my-business');
        const businessData = businessRes.data;
        setBusiness(businessData);
        
        if (businessData?.id) {
          const [appointmentsRes, teamRes, hoursRes, reviewsRes] = await Promise.allSettled([
            apiClient.get(`/appointments/business/${businessData.id}`),
            apiClient.get(`/team/business/${businessData.id}/members`),
            apiClient.get(`/businesses/${businessData.id}/hours`),
            apiClient.get(`/reviews/business/${businessData.id}`),
          ]);
          
          if (appointmentsRes.status === 'fulfilled') {
            setAppointments(appointmentsRes.value.data || []);
          }
          if (teamRes.status === 'fulfilled') {
            setTeamMembers(teamRes.value.data || []);
          }
          if (hoursRes.status === 'fulfilled') {
            const hours = hoursRes.value.data || [];
            setBusinessHours(hours);
            setEditedHours(hours);
          }
          if (reviewsRes.status === 'fulfilled') {
            setReviews(reviewsRes.value.data || []);
          }
          
          const pendingCount = appointments.filter(a => a.status === 'pending').length;
          setStats({
            totalViews: 0,
            totalAppointments: appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data?.length || 0 : 0,
            pendingAppointments: pendingCount,
            totalReviews: businessData.reviewCount || 0,
            averageRating: businessData.rating || 0,
          });
          
          setAppointmentSettings({
            appointmentsEnabled: businessData.appointmentsEnabled || false,
            appointmentDuration: businessData.appointmentDuration || 60,
            appointmentBuffer: businessData.appointmentBuffer || 15,
            advanceBookingDays: businessData.advanceBookingDays || 30,
          });
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Appointment actions
  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await apiClient.post(`/appointments/${appointmentId}/confirm`);
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'confirmed' } : a));
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      alert('Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiClient.post(`/appointments/${appointmentId}/cancel`, { reason: 'Cancelled by business' });
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a));
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await apiClient.post(`/appointments/${appointmentId}/complete`);
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'completed' } : a));
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      alert('Failed to mark as complete');
    }
  };

  // Team actions
  const handleInviteMember = async () => {
    if (!inviteEmail || !business) return;
    
    setIsInviting(true);
    try {
      await apiClient.post(`/team/business/${business.id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
        ...invitePermissions,
      });
      
      const teamRes = await apiClient.get(`/team/business/${business.id}/members`);
      setTeamMembers(teamRes.data || []);
      
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('staff');
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Failed to invite member:', error);
      const errMsg = error instanceof Error ? error.message : 'Failed to send invitation';
      alert(errMsg);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    if (!business) return;
    
    try {
      await apiClient.delete(`/team/business/${business.id}/members/${memberId}`);
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove team member');
    }
  };

  // Hours actions
  const handleSaveHours = async () => {
    if (!business) return;
    
    setIsSavingHours(true);
    try {
      await apiClient.post(`/businesses/${business.id}/hours`, {
        hours: editedHours.map(h => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })),
      });
      setBusinessHours(editedHours);
      alert('Business hours saved!');
    } catch (error) {
      console.error('Failed to save hours:', error);
      alert('Failed to save business hours');
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleInitializeHours = async () => {
    if (!business) return;
    try {
      const res = await apiClient.post(`/businesses/${business.id}/hours/initialize`);
      setBusinessHours(res.data || []);
      setEditedHours(res.data || []);
    } catch (error) {
      console.error('Failed to initialize hours:', error);
    }
  };

  // Settings actions
  const handleSaveSettings = async () => {
    if (!business) return;
    
    setIsSavingSettings(true);
    try {
      await apiClient.put(`/businesses/${business.id}/appointment-settings`, appointmentSettings);
      setBusiness(prev => prev ? { ...prev, ...appointmentSettings } : null);
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="min-h-screen bg-neutral-950">
      <DashboardHeader userName={userName} onLogout={handleLogout} />

      {!business ? (
        <NoBusinessState />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <BusinessHeader business={business} />
          
          {/* Onboarding Checklist for new businesses */}
          <OnboardingChecklist
            businessId={business.id}
            hasDescription={!!business.description && business.description.length > 50}
            hasPhotos={(business.photos?.length || 0) > 0}
            hasHours={(business.businessHours?.length || 0) > 0}
            hasServices={(business.services?.length || 0) > 0}
            isVerified={business.verified}
            onSetTab={(tab) => setActiveTab(tab as Tab)}
          />
          
          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              appointments={appointments}
              reviews={reviews}
              teamMembersCount={teamMembers.length}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab
              appointments={appointments}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onConfirm={handleConfirmAppointment}
              onCancel={handleCancelAppointment}
              onComplete={handleCompleteAppointment}
            />
          )}

          {activeTab === 'reviews' && business && (
            <ReviewsTab
              reviews={reviews}
              businessName={business.name}
              onReviewUpdated={async () => {
                // Refetch reviews
                try {
                  const reviewsRes = await apiClient.get(`/reviews?businessId=${business.id}`);
                  setReviews(reviewsRes.data.data || []);
                } catch {
                  // Ignore errors
                }
              }}
            />
          )}

          {activeTab === 'photos' && business && (
            <PhotosTab
              businessId={business.id}
              photos={business.photos || []}
              coverImage={business.coverImage}
              logoImage={business.logoImage}
              onPhotosUpdated={async () => {
                // Refetch business data
                try {
                  const res = await apiClient.get('/businesses/my');
                  setBusiness(res.data);
                } catch {
                  // Ignore errors
                }
              }}
            />
          )}

          {activeTab === 'team' && (
            <TeamTab
              teamMembers={teamMembers}
              ownerName={userName}
              ownerEmail={user?.email || ''}
              onInviteClick={() => setShowInviteModal(true)}
              onRemoveMember={handleRemoveMember}
            />
          )}

          {activeTab === 'hours' && (
            <HoursTab
              editedHours={editedHours}
              setEditedHours={setEditedHours}
              isSavingHours={isSavingHours}
              onSaveHours={handleSaveHours}
              onInitializeHours={handleInitializeHours}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              appointmentSettings={appointmentSettings}
              setAppointmentSettings={setAppointmentSettings}
              isSavingSettings={isSavingSettings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      )}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
        invitePermissions={invitePermissions}
        setInvitePermissions={setInvitePermissions}
        isInviting={isInviting}
        onInvite={handleInviteMember}
      />
    </div>
  );
}

export default Dashboard;
