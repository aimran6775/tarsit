import apiClient from './api-client';

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'BUSINESS_OWNER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  profileImage?: string;
  phone?: string;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', {
      ...data,
      role: data.role || 'CUSTOMER',
    });

    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Sign in an existing user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);

    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', {
      token,
      password: newPassword,
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/api/auth/verify-email', { token });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email?: string): Promise<void> {
    await apiClient.post('/api/auth/resend-verification', { email });
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post<{ accessToken: string }>('/api/auth/refresh', {
      refreshToken,
    });

    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/api/auth/profile', data);
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
}

export const authService = new AuthService();
export default authService;
