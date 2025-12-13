/**
 * Application Constants
 */

export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Appointment
  MIN_APPOINTMENT_DURATION: 15, // minutes
  MAX_APPOINTMENT_DURATION: 480, // minutes (8 hours)
  CANCELLATION_WINDOW: 24, // hours before appointment
  
  // Review
  MIN_RATING: 1,
  MAX_RATING: 5,
  
  // Business Hours
  DAYS_OF_WEEK: [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ],
  
  // Rate Limiting
  RATE_LIMIT_TTL: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Token Expiry
  VERIFICATION_TOKEN_EXPIRY: 24, // hours
  RESET_TOKEN_EXPIRY: 1, // hours
  
  // Search
  MAX_SEARCH_RADIUS: 50, // km
  DEFAULT_SEARCH_RADIUS: 10, // km
};

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  ADMIN: 'ADMIN',
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
