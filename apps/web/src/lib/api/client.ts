import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/**
 * Normalize API error into a consistent format
 */
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred',
      statusCode: axiosError.response?.status || 500,
      error: axiosError.response?.data?.error,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}

/**
 * Check if error is a specific HTTP status
 */
export function isHttpError(error: unknown, status: number): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === status;
  }
  return false;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and error normalization
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Don't retry for certain endpoints
    const noRetryEndpoints = ['/auth/login', '/auth/signup', '/auth/refresh'];
    const isNoRetryEndpoint = noRetryEndpoints.some(ep => originalRequest?.url?.includes(ep));

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest?._retry && !isNoRetryEndpoint) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Only redirect if not already on auth pages
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
              window.location.href = '/auth/login?session=expired';
            }
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, redirect to login if not on auth pages
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
