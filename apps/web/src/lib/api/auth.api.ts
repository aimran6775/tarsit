import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  verified: boolean;
}

export interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

export interface SignupData {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'CUSTOMER' | 'BUSINESS_OWNER';
}

export interface BusinessData {
  name: string;
  description: string;
  categoryId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone: string;
  email?: string;
  website?: string;
  priceRange?: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  latitude?: number;
  longitude?: number;
}

export interface SignupBusinessData {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  business: BusinessData;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface BusinessAuthResponse extends AuthResponse {
  business: {
    id: string;
    name: string;
    slug: string;
    category: { id: string; name: string; slug: string };
    city: string;
    state: string;
    verified: boolean;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  username?: string;
}

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  async signupBusiness(data: SignupBusinessData): Promise<BusinessAuthResponse> {
    const response = await apiClient.post<BusinessAuthResponse>('/auth/signup-business', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.patch<User>('/auth/me', data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  },

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification');
  },
};
