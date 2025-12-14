// Admin Dashboard Types - Comprehensive Enterprise-Grade Definitions

// ============================================================================
// TAB TYPES
// ============================================================================

export type TabType =
  | 'overview'
  | 'users'
  | 'businesses'
  | 'verifications'
  | 'reviews'
  | 'categories'
  | 'tars'
  | 'system'
  | 'reports'
  | 'audit-logs'
  | 'settings';

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'CUSTOMER' | 'USER';
  status: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  verified?: boolean;
  active?: boolean;
  provider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
  lastLoginAt?: string;
  createdAt: string;
  businessCount?: number;
  reviewCount?: number;
  messageCount?: number;
  _count?: {
    businesses: number;
    reviews: number;
    appointments: number;
    favorites: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

// ============================================================================
// BUSINESS MANAGEMENT
// ============================================================================

export interface Business {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  tagline?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ownerName?: string;
  ownerEmail?: string;
  category: string | { id: string; name: string };
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  isVerified: boolean;
  verified?: boolean;
  active?: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  teamSize?: number;
  serviceCount?: number;
  photoCount?: number;
  appointmentsEnabled?: boolean;
  createdAt: string;
  logo?: string;
  logoImage?: string;
  coverPhoto?: string;
  coverImage?: string;
  _count?: {
    reviews: number;
    appointments: number;
    services: number;
    photos: number;
  };
}

export interface BusinessesResponse {
  businesses: Business[];
  pagination: Pagination;
}

// ============================================================================
// VERIFICATION REQUESTS
// ============================================================================

export interface VerificationRequest {
  id: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoImage?: string;
    owner: { firstName: string; lastName: string; email: string };
  };
  type: 'BUSINESS_LICENSE' | 'IDENTITY' | 'ADDRESS' | 'PROFESSIONAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: string[];
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  adminNotes?: string;
}

// ============================================================================
// REVIEWS & CONTENT
// ============================================================================

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  business: {
    id: string;
    name: string;
    slug: string;
  };
  response?: string;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  order: number;
  active: boolean;
  _count?: {
    businesses: number;
  };
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  adminId: string;
  admin: { firstName: string; lastName: string; email: string };
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: Pagination;
}

// ============================================================================
// SYSTEM & MONITORING
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  nodeVersion: string;
  environment: string;
  timestamp: string;
}

export interface AIInsights {
  businessTrends: {
    growing: string[];
    declining: string[];
  };
  customerSentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  recommendations: string[];
  growthPrediction: number;
}

// ============================================================================
// REAL-TIME STATS
// ============================================================================

export interface RealTimeStats {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalReviews: number;
    totalAppointments: number;
  };
  realTime: {
    activeUsers24h: number;
    newBusinesses24h: number;
    newUsers24h: number;
    activeChats: number;
    pendingVerifications: number;
    onlineUsers: number;
  };
  recentActivities: {
    newUsers: any[];
    newBusinesses: any[];
    recentReviews: any[];
    recentAppointments: any[];
  };
  growth: {
    userGrowth: number;
    businessGrowth: number;
    revenueGrowth: number;
    reviewGrowth: number;
  };
  timestamp: string;
}

// ============================================================================
// ADMIN STATS (Dashboard Overview)
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  pendingVerifications: number;
  totalReviews: number;
  totalRevenue?: number;
  activeUsers?: number;
  newUsersToday?: number;
  newBusinessesToday?: number;
  pendingReviews?: number;
  reportedContent?: number;
}

// ============================================================================
// VERIFICATIONS RESPONSE
// ============================================================================

export interface VerificationsResponse {
  requests: VerificationRequest[];
  pagination: Pagination;
}

// ============================================================================
// BROADCAST MESSAGING
// ============================================================================

export interface BroadcastMessage {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  recipients: 'all' | 'businesses' | 'customers' | 'admins';
}

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

export interface PlatformSettings {
  requireEmailVerification: boolean;
  autoApproveBusinesses: boolean;
  enableBookingFeature: boolean;
  enableChatFeature: boolean;
  maintenanceMode: boolean;
  maxUploadSize: number;
  defaultResultsPerPage: number;
  siteName: string;
  siteDescription: string;
  supportEmail: string;
}

export interface NotificationSettings {
  newUserRegistrations: boolean;
  newBusinessRegistrations: boolean;
  verificationRequests: boolean;
  reportedContent: boolean;
  systemAlerts: boolean;
  lowDiskSpace: boolean;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityItem {
  id: string;
  type: 'user' | 'business' | 'review' | 'appointment' | 'verification' | 'system';
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'BUSINESS_OWNER': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'CUSTOMER': return 'bg-white/10 text-white/70 border-white/20';
    default: return 'bg-white/10 text-white/50 border-white/20';
  }
};

export const getStatusColor = (status: string, isActive?: boolean): string => {
  if (isActive === false) return 'bg-red-500/20 text-red-400 border-red-500/30';
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'VERIFIED':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'SUSPENDED':
    case 'REJECTED':
    case 'INACTIVE':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-white/10 text-white/50 border-white/20';
  }
};

export const getHealthColor = (status: string): string => {
  switch (status) {
    case 'healthy': return 'text-emerald-400';
    case 'degraded': return 'text-amber-400';
    case 'unhealthy': return 'text-red-400';
    default: return 'text-white/50';
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
};

export const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'user': return '👤';
    case 'business': return '🏢';
    case 'review': return '⭐';
    case 'appointment': return '📅';
    case 'verification': return '✅';
    case 'system': return '⚙️';
    default: return '📌';
  }
};
