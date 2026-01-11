import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === 'undefined' ? 'http://127.0.0.1:4001/api' : '/api');

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
 * Get region preferences from localStorage
 */
function getRegionPreferences(): { regionCode?: string; languageCode?: string; currencyCode?: string } {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const regionCode = localStorage.getItem('tarsit-region');
    const languageCode = localStorage.getItem('tarsit-language');
    const currencyCode = localStorage.getItem('tarsit-currency');
    
    return {
      regionCode: regionCode || undefined,
      languageCode: languageCode || undefined,
      currencyCode: currencyCode || undefined,
    };
  } catch {
    return {};
  }
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

// Request interceptor to add auth token and region headers
apiClient.interceptors.request.use(
  (config) => {
    // Don't attach token for auth endpoints to avoid issues with stale tokens
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/signup')) {
      return config;
    }

    if (typeof window !== 'undefined') {
      // Add auth token
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add region/language/currency headers
      const { regionCode, languageCode, currencyCode } = getRegionPreferences();
      
      if (regionCode) {
        config.headers['X-Region-Code'] = regionCode;
      }
      if (languageCode) {
        config.headers['X-Language-Code'] = languageCode;
      }
      if (currencyCode) {
        config.headers['X-Currency-Code'] = currencyCode;
      }
      
      // Also set Accept-Language for standard HTTP behavior
      if (languageCode) {
        config.headers['Accept-Language'] = languageCode;
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
