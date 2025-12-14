/**
 * HTTP Error Messages
 */
export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  USER_INACTIVE: 'User account is inactive',
  
  // Business
  BUSINESS_NOT_FOUND: 'Business not found',
  BUSINESS_ALREADY_EXISTS: 'Business already exists',
  NOT_BUSINESS_OWNER: 'You are not authorized to manage this business',
  
  // Appointment
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  INVALID_APPOINTMENT_TIME: 'Invalid appointment time',
  APPOINTMENT_NOT_AVAILABLE: 'This time slot is not available',
  CANNOT_CANCEL_APPOINTMENT: 'Cannot cancel appointment at this time',
  
  // General
  INVALID_INPUT: 'Invalid input data',
  RESOURCE_NOT_FOUND: 'Resource not found',
  PERMISSION_DENIED: 'Permission denied',
  INTERNAL_ERROR: 'Internal server error',
  
  // Validation
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  REQUIRED_FIELD: 'This field is required',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SIGNUP_SUCCESS: 'Account created successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET: 'Password reset successfully',
  
  // User
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // Business
  BUSINESS_CREATED: 'Business created successfully',
  BUSINESS_UPDATED: 'Business updated successfully',
  BUSINESS_DELETED: 'Business deleted successfully',
  
  // Appointment
  APPOINTMENT_CREATED: 'Appointment booked successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  APPOINTMENT_UPDATED: 'Appointment updated successfully',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
};
