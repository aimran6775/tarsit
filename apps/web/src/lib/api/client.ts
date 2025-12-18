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
      message:
        axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred',
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

// Response interceptor to handle error normalization
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // We rely on Supabase client to handle token refresh via onAuthStateChange
    // which updates localStorage.
    return Promise.reject(error);
  }
);
