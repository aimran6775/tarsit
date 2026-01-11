'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  AdminSidebar,
  AuditLogsTab,
  BroadcastModal,
  BusinessDetailModal,
  BusinessesTab,
  CategoriesTab,
  CurrenciesTab,
  LoadingState,
  OverviewTab,
  RegionsTab,
  ReportsTab,
  ReviewsTab,
  SettingsTab,
  SystemTab,
  TarsTab,
  TopHeader,
  UserDetailModal,
  UsersTab,
  VerificationsTab,
} from './components';
import type {
  AIInsights,
  AuditLogsResponse,
  BroadcastMessage,
  Business,
  BusinessesResponse,
    Category,
    Currency,
    PlatformSettings,
    RealTimeStats,
    Region,
    ReviewsResponse,
    SystemHealth,
    TabType,
    User,
    UsersResponse,
    VerificationRequest,
} from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// Normalize: ensure we have the base URL without trailing /api
const API_BASE = API_URL.replace(/\/api\/?$/, '');

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
  const [tarsActions, setTarsActions] = useState<any[]>([]);
  const [tarsLoading, setTarsLoading] = useState(false);
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

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Regions State
  const [regions, setRegions] = useState<Region[]>([]);
  
  // Currencies State  
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // API Helper - Uses API_BASE to construct full URLs
  const fetchAPI = useCallback(async (endpoint: string, options?: RequestInit) => {
    const token = getToken();
    // Ensure endpoint starts with /api
    const url = endpoint.startsWith('/api') 
      ? `${API_BASE}${endpoint}` 
      : `${API_BASE}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }, []);

  // Fetch Data Functions
  const fetchStats = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/dashboard/real-time');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Keep existing data or set empty
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
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  }, [fetchAPI, businessPage, businessSearch, businessStatusFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/categories?includeInactive=true');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [fetchAPI]);

  const fetchRegions = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/regions');
      setRegions(data.regions || data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  }, [fetchAPI]);

  const fetchCurrencies = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/currencies');
      setCurrencies(data.currencies || data);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  }, [fetchAPI]);

  const fetchVerifications = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/verifications');
      setVerifications(data.requests || data || []);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
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
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
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
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  }, [fetchAPI, auditPage, auditSearch, auditActionFilter]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/system/health');
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  }, [fetchAPI]);

  const fetchAiInsights = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/insights/ai');
      setAiInsights(data);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  }, [fetchAPI]);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await fetchAPI('/api/admin/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, [fetchAPI]);

  // TARS Functions
  const fetchTarsActions = useCallback(async () => {
    setTarsLoading(true);
    try {
      const data = await fetchAPI('/api/tars/admin/actions/pending');
      setTarsActions(data.actions || data || []);
    } catch (error) {
      console.error('Failed to fetch TARS actions:', error);
      setTarsActions([]);
    } finally {
      setTarsLoading(false);
    }
  }, [fetchAPI]);

  const handleTarsApprove = async (actionId: string, notes?: string) => {
    try {
      await fetchAPI(
        `/api/tars/admin/actions/${actionId}/approve${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`,
        {
          method: 'POST',
        }
      );
      await fetchTarsActions();
    } catch (error) {
      console.error('Failed to approve action:', error);
      alert('Failed to approve action');
    }
  };

  const handleTarsReject = async (actionId: string, reason: string) => {
    try {
      await fetchAPI(`/api/tars/admin/actions/${actionId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      await fetchTarsActions();
    } catch (error) {
      console.error('Failed to reject action:', error);
      alert('Failed to reject action');
    }
  };

  const handleTarsBulkReview = async (
    actionIds: string[],
    decision: 'approve' | 'reject',
    notes?: string
  ) => {
    try {
      await fetchAPI('/api/tars/admin/actions/bulk-review', {
        method: 'POST',
        body: JSON.stringify({ actionIds, decision, notes }),
      });
      await fetchTarsActions();
    } catch (error) {
      console.error('Failed to bulk review actions:', error);
      alert('Failed to process bulk review');
    }
  };

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
        await Promise.all([fetchStats(), fetchSystemHealth(), fetchAiInsights()]);
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
      case 'categories':
        fetchCategories();
        break;
      case 'regions':
        fetchRegions();
        fetchCurrencies();
        break;
      case 'currencies':
        fetchCurrencies();
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
      case 'tars':
        fetchTarsActions();
        break;
      case 'system':
        fetchSystemHealth();
        fetchAiInsights();
        break;
      case 'settings':
        fetchSettings();
        break;
    }
  }, [
    activeTab,
    user,
    fetchUsers,
    fetchBusinesses,
    fetchCategories,
    fetchRegions,
    fetchCurrencies,
    fetchVerifications,
    fetchReviews,
    fetchAuditLogs,
    fetchTarsActions,
    fetchSystemHealth,
    fetchAiInsights,
    fetchSettings,
  ]);

  // Action Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchSystemHealth()]);
    setIsRefreshing(false);
  };

  const handleUserAction = async (
    userId: string,
    action: 'suspend' | 'activate' | 'delete' | 'promote'
  ) => {
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

  const handleBusinessAction = async (
    businessId: string,
    action: 'verify' | 'suspend' | 'activate' | 'feature' | 'delete'
  ) => {
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

  const handleVerificationAction = async (
    requestId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
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

  // Category Handlers
  const handleAddCategory = async (data: any) => {
    await fetchAPI('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchCategories();
  };

  const handleEditCategory = async (id: string, data: any) => {
    await fetchAPI(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await fetchCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    await fetchAPI(`/api/admin/categories/${id}`, { method: 'DELETE' });
    await fetchCategories();
  };

  const handleReorderCategory = async (id: string, newOrder: number) => {
    await fetchAPI(`/api/admin/categories/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ order: newOrder }),
    });
    await fetchCategories();
  };

  // Region Handlers
  const handleAddRegion = async (data: any) => {
    await fetchAPI('/api/regions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchRegions();
  };

  const handleEditRegion = async (id: string, data: any) => {
    await fetchAPI(`/api/regions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await fetchRegions();
  };

  const handleDeleteRegion = async (id: string) => {
    await fetchAPI(`/api/regions/${id}`, { method: 'DELETE' });
    await fetchRegions();
  };

  // Currency Handlers
  const handleAddCurrency = async (data: any) => {
    await fetchAPI('/api/currencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchCurrencies();
  };

  const handleEditCurrency = async (id: string, data: any) => {
    await fetchAPI(`/api/currencies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await fetchCurrencies();
  };

  const handleDeleteCurrency = async (id: string) => {
    await fetchAPI(`/api/currencies/${id}`, { method: 'DELETE' });
    await fetchCurrencies();
  };

  const handleUpdateCurrencyRates = async () => {
    await fetchAPI('/api/currencies/update-rates', { method: 'POST' });
    await fetchCurrencies();
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
          {activeTab === 'overview' && <OverviewTab stats={stats} setActiveTab={setActiveTab} />}

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
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onReorderCategory={handleReorderCategory}
            />
          )}

          {activeTab === 'regions' && (
            <RegionsTab
              regions={regions}
              currencies={currencies}
              onAddRegion={handleAddRegion}
              onEditRegion={handleEditRegion}
              onDeleteRegion={handleDeleteRegion}
              onRefresh={fetchRegions}
            />
          )}

          {activeTab === 'currencies' && (
            <CurrenciesTab
              currencies={currencies}
              onAddCurrency={handleAddCurrency}
              onEditCurrency={handleEditCurrency}
              onDeleteCurrency={handleDeleteCurrency}
              onUpdateRates={handleUpdateCurrencyRates}
              onRefresh={fetchCurrencies}
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

          {activeTab === 'reports' && <ReportsTab onGenerateReport={handleGenerateReport} />}

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

          {activeTab === 'tars' && (
            <TarsTab
              actions={tarsActions}
              loading={tarsLoading}
              onApprove={handleTarsApprove}
              onReject={handleTarsReject}
              onBulkReview={handleTarsBulkReview}
              onRefresh={fetchTarsActions}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab settings={settings} onUpdateSettings={handleUpdateSettings} />
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
