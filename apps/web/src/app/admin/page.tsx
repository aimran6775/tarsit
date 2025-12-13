'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  LoadingState,
  AdminSidebar,
  TopHeader,
  OverviewTab,
  UsersTab,
  BusinessesTab,
  VerificationsTab,
  ReviewsTab,
  SystemTab,
  ReportsTab,
  CategoriesTab,
  AuditLogsTab,
  SettingsTab,
  BroadcastModal,
  UserDetailModal,
  BusinessDetailModal,
} from './components';
import type {
  TabType,
  User,
  Business,
  VerificationRequest,
  SystemHealth,
  AIInsights,
  PlatformSettings,
  BroadcastMessage,
  RealTimeStats,
  UsersResponse,
  BusinessesResponse,
  ReviewsResponse,
  AuditLogsResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data State
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [businessesData, setBusinessesData] = useState<BusinessesResponse | null>(null);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [auditLogsData, setAuditLogsData] = useState<AuditLogsResponse | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter State - Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);

  // Filter State - Businesses
  const [businessSearch, setBusinessSearch] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState('');
  const [businessPage, setBusinessPage] = useState(1);

  // Filter State - Reviews
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('');
  const [reviewPage, setReviewPage] = useState(1);

  // Filter State - Audit Logs
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditPage, setAuditPage] = useState(1);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // API Helper
  const fetchAPI = useCallback(async (endpoint: string, options?: RequestInit) => {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }, []);

  // Fetch Data Functions
  const fetchStats = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/stats/realtime');
      setStats(data);
    } catch {
      // Use mock data for demo
      setStats({
        overview: {
          totalUsers: 12453,
          totalBusinesses: 3847,
          totalReviews: 45678,
          totalAppointments: 8934,
        },
        realTime: {
          activeUsers24h: 8934,
          newBusinesses24h: 34,
          newUsers24h: 147,
          activeChats: 89,
          pendingVerifications: 23,
          onlineUsers: 456,
        },
        recentActivities: {
          newUsers: [],
          newBusinesses: [],
          recentReviews: [],
          recentAppointments: [],
        },
        growth: {
          userGrowth: 12.5,
          businessGrowth: 8.3,
          revenueGrowth: 15.2,
          reviewGrowth: 22.1,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }, [fetchAPI]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: '10',
        ...(userSearch && { search: userSearch }),
        ...(userRoleFilter && { role: userRoleFilter }),
      });
      const data = await fetchAPI(`/api/admin/users?${params}`);
      setUsersData(data);
    } catch {
      // Mock data
      setUsersData({
        users: [
          {
            id: '1',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
            status: 'active',
            isVerified: true,
            verified: true,
            active: true,
            createdAt: '2024-01-15',
            lastLoginAt: '2024-12-08',
          },
          {
            id: '2',
            email: 'jane@business.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'BUSINESS_OWNER',
            status: 'active',
            isVerified: true,
            verified: true,
            active: true,
            businessCount: 2,
            createdAt: '2024-02-20',
            lastLoginAt: '2024-12-07',
          },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    }
  }, [fetchAPI, userPage, userSearch, userRoleFilter]);

  const fetchBusinesses = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: businessPage.toString(),
        limit: '10',
        ...(businessSearch && { search: businessSearch }),
        ...(businessStatusFilter && { status: businessStatusFilter }),
      });
      const data = await fetchAPI(`/api/admin/businesses?${params}`);
      setBusinessesData(data);
    } catch {
      // Mock data
      setBusinessesData({
        businesses: [
          {
            id: '1',
            name: 'Tech Solutions Inc',
            category: { id: '1', name: 'Technology' },
            status: 'active',
            isVerified: true,
            verified: true,
            active: true,
            rating: 4.8,
            reviewCount: 124,
            city: 'San Francisco',
            state: 'CA',
            createdAt: '2024-01-10',
          },
          {
            id: '2',
            name: 'Green Gardens',
            category: { id: '2', name: 'Home Services' },
            status: 'pending',
            isVerified: false,
            verified: false,
            active: true,
            rating: 4.5,
            reviewCount: 45,
            city: 'Los Angeles',
            state: 'CA',
            createdAt: '2024-03-15',
          },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    }
  }, [fetchAPI, businessPage, businessSearch, businessStatusFilter]);

  const fetchVerifications = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/verifications');
      setVerifications(data.requests || []);
    } catch {
      setVerifications([]);
    }
  }, [fetchAPI]);

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: reviewPage.toString(),
        limit: '10',
        ...(reviewSearch && { search: reviewSearch }),
        ...(reviewRatingFilter && { rating: reviewRatingFilter }),
      });
      const data = await fetchAPI(`/api/admin/reviews?${params}`);
      setReviewsData(data);
    } catch {
      setReviewsData({
        reviews: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
    }
  }, [fetchAPI, reviewPage, reviewSearch, reviewRatingFilter]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: auditPage.toString(),
        limit: '20',
        ...(auditSearch && { search: auditSearch }),
        ...(auditActionFilter && { action: auditActionFilter }),
      });
      const data = await fetchAPI(`/api/admin/audit-logs?${params}`);
      setAuditLogsData(data);
    } catch {
      setAuditLogsData({
        logs: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }
  }, [fetchAPI, auditPage, auditSearch, auditActionFilter]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/system/health');
      setSystemHealth(data);
    } catch {
      // Mock system health
      setSystemHealth({
        status: 'healthy',
        database: {
          status: 'connected',
          responseTime: 12,
        },
        memory: {
          used: 2147483648, // 2GB
          total: 4294967296, // 4GB
          percentage: 50,
        },
        uptime: 864000, // 10 days
        nodeVersion: '20.10.0',
        environment: 'production',
        timestamp: new Date().toISOString(),
      });
    }
  }, [fetchAPI]);

  const fetchAiInsights = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/ai-insights');
      setAiInsights(data);
    } catch {
      setAiInsights({
        businessTrends: {
          growing: ['Health & Wellness', 'Technology', 'Food & Dining'],
          declining: ['Traditional Retail'],
        },
        customerSentiment: {
          overall: 'positive',
          score: 0.78,
        },
        recommendations: [
          'Consider promoting businesses in the Health & Wellness category',
          'Users are requesting more filter options for search',
          'Peak usage hours are between 6-9 PM',
        ],
        growthPrediction: 15.2,
      });
    }
  }, [fetchAPI]);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/settings');
      setSettings(data);
    } catch {
      // Settings not found, use defaults
    }
  }, [fetchAPI]);

  // Initial Data Load
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchSystemHealth(),
          fetchAiInsights(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, authLoading, router, fetchStats, fetchSystemHealth, fetchAiInsights]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    switch (activeTab) {
      case 'users':
        fetchUsers();
        break;
      case 'businesses':
        fetchBusinesses();
        break;
      case 'verifications':
        fetchVerifications();
        break;
      case 'reviews':
        fetchReviews();
        break;
      case 'audit-logs':
        fetchAuditLogs();
        break;
      case 'system':
        fetchSystemHealth();
        fetchAiInsights();
        break;
      case 'settings':
        fetchSettings();
        break;
    }
  }, [activeTab, user, fetchUsers, fetchBusinesses, fetchVerifications, fetchReviews, fetchAuditLogs, fetchSystemHealth, fetchAiInsights, fetchSettings]);

  // Action Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchSystemHealth()]);
    setIsRefreshing(false);
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete' | 'promote') => {
    try {
      switch (action) {
        case 'suspend':
          await fetchAPI(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ active: false }),
          });
          break;
        case 'activate':
          await fetchAPI(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ active: true }),
          });
          break;
        case 'delete':
          await fetchAPI(`/api/admin/users/${userId}`, { method: 'DELETE' });
          break;
        case 'promote':
          await fetchAPI(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ role: 'ADMIN' }),
          });
          break;
      }
      await fetchUsers();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  const handleBusinessAction = async (businessId: string, action: 'verify' | 'suspend' | 'activate' | 'feature' | 'delete') => {
    try {
      switch (action) {
        case 'verify':
          await fetchAPI(`/api/admin/businesses/${businessId}`, {
            method: 'PATCH',
            body: JSON.stringify({ verified: true }),
          });
          break;
        case 'suspend':
          await fetchAPI(`/api/admin/businesses/${businessId}`, {
            method: 'PATCH',
            body: JSON.stringify({ active: false }),
          });
          break;
        case 'activate':
          await fetchAPI(`/api/admin/businesses/${businessId}`, {
            method: 'PATCH',
            body: JSON.stringify({ active: true }),
          });
          break;
        case 'feature':
          await fetchAPI(`/api/admin/businesses/${businessId}`, {
            method: 'PATCH',
            body: JSON.stringify({ featured: true }),
          });
          break;
        case 'delete':
          await fetchAPI(`/api/admin/businesses/${businessId}`, { method: 'DELETE' });
          break;
      }
      await fetchBusinesses();
    } catch (err) {
      console.error(`Failed to ${action} business:`, err);
    }
  };

  const handleVerificationAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      await fetchAPI(`/api/admin/verifications/${requestId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      await fetchVerifications();
      await fetchStats();
    } catch (err) {
      console.error(`Failed to ${action} verification:`, err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await fetchAPI(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      await fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      await fetchAPI('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      });
      await fetchSettings();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleSendBroadcast = async (message: BroadcastMessage) => {
    try {
      await fetchAPI('/api/admin/broadcasts', {
        method: 'POST',
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.error('Failed to send broadcast:', err);
    }
  };

  const handleGenerateReport = async (type: string, startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams({
        type,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const data = await fetchAPI(`/api/admin/reports?${params}`);
      // Download or display report
      console.log('Report generated:', data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return <LoadingState />;
  }

  // Access denied
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        pendingVerifications={stats?.realTime.pendingVerifications || 0}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Page Content */}
        <main className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'users' && (
            <UsersTab
              usersData={usersData}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              userPage={userPage}
              setUserPage={setUserPage}
              onUserAction={handleUserAction}
              onViewUser={setSelectedUser}
            />
          )}

          {activeTab === 'businesses' && (
            <BusinessesTab
              businessesData={businessesData}
              businessSearch={businessSearch}
              setBusinessSearch={setBusinessSearch}
              businessStatusFilter={businessStatusFilter}
              setBusinessStatusFilter={setBusinessStatusFilter}
              businessPage={businessPage}
              setBusinessPage={setBusinessPage}
              onBusinessAction={handleBusinessAction}
              onViewBusiness={setSelectedBusiness}
            />
          )}

          {activeTab === 'verifications' && (
            <VerificationsTab
              verifications={verifications}
              onVerificationAction={handleVerificationAction}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviewsData={reviewsData}
              reviewSearch={reviewSearch}
              setReviewSearch={setReviewSearch}
              reviewRatingFilter={reviewRatingFilter}
              setReviewRatingFilter={setReviewRatingFilter}
              reviewPage={reviewPage}
              setReviewPage={setReviewPage}
              onDeleteReview={handleDeleteReview}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={[]}
              onAddCategory={() => {}}
              onEditCategory={() => {}}
              onDeleteCategory={() => {}}
              onReorderCategory={() => {}}
            />
          )}

          {activeTab === 'system' && (
            <SystemTab
              systemHealth={systemHealth}
              aiInsights={aiInsights}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab onGenerateReport={handleGenerateReport} />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsTab
              auditLogsData={auditLogsData}
              auditSearch={auditSearch}
              setAuditSearch={setAuditSearch}
              auditActionFilter={auditActionFilter}
              setAuditActionFilter={setAuditActionFilter}
              auditPage={auditPage}
              setAuditPage={setAuditPage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <BroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSend={handleSendBroadcast}
      />

      <UserDetailModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdateUser={(userId, data) => {
          fetchAPI(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          }).then(() => fetchUsers());
        }}
        onSuspendUser={(userId) => handleUserAction(userId, 'suspend')}
        onActivateUser={(userId) => handleUserAction(userId, 'activate')}
        onDeleteUser={(userId) => handleUserAction(userId, 'delete')}
        onResetPassword={(userId) => {
          fetchAPI(`/api/admin/users/${userId}/reset-password`, { method: 'POST' });
        }}
      />

      <BusinessDetailModal
        business={selectedBusiness}
        isOpen={!!selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        onUpdateBusiness={(businessId, data) => {
          fetchAPI(`/api/admin/businesses/${businessId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          }).then(() => fetchBusinesses());
        }}
        onVerifyBusiness={(businessId) => handleBusinessAction(businessId, 'verify')}
        onSuspendBusiness={(businessId) => handleBusinessAction(businessId, 'suspend')}
        onActivateBusiness={(businessId) => handleBusinessAction(businessId, 'activate')}
        onDeleteBusiness={(businessId) => handleBusinessAction(businessId, 'delete')}
      />
    </div>
  );
}
