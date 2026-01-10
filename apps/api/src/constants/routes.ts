/**
 * API Route Paths
 */
export const API_ROUTES = {
  AUTH: {
    BASE: 'auth',
    LOGIN: 'login',
    SIGNUP: 'signup',
    LOGOUT: 'logout',
    REFRESH: 'refresh',
    ME: 'me',
    VERIFY_EMAIL: 'verify-email',
    RESEND_VERIFICATION: 'resend-verification',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
    CHANGE_PASSWORD: 'change-password',
  },
  
  USERS: {
    BASE: 'users',
    PROFILE: 'profile',
    BY_ID: ':id',
  },
  
  BUSINESSES: {
    BASE: 'businesses',
    BY_ID: ':id',
    PHOTOS: ':id/photos',
    REVIEWS: ':id/reviews',
    SERVICES: ':id/services',
    APPOINTMENTS: ':id/appointments',
  },
  
  APPOINTMENTS: {
    BASE: 'appointments',
    BY_ID: ':id',
    CANCEL: ':id/cancel',
    CONFIRM: ':id/confirm',
  },
  
  CATEGORIES: {
    BASE: 'categories',
    BY_ID: ':id',
  },
  
  SEARCH: {
    BASE: 'search',
    BUSINESSES: 'businesses',
  },
  
  MESSAGES: {
    BASE: 'messages',
    BY_ID: ':id',
  },
  
  CHATS: {
    BASE: 'chats',
    BY_ID: ':id',
  },
  
  REVIEWS: {
    BASE: 'reviews',
    BY_ID: ':id',
  },
  
  NOTIFICATIONS: {
    BASE: 'notifications',
    BY_ID: ':id',
    MARK_READ: ':id/read',
    MARK_ALL_READ: 'read-all',
  },
  
  HEALTH: {
    BASE: 'health',
    DETAILED: 'detailed',
    READY: 'ready',
    LIVE: 'live',
  },
};
