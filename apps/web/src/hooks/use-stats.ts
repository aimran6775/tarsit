'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface PlatformStats {
  totalBusinesses: number;
  totalReviews: number;
  totalBookings: number;
  totalUsers?: number;
}

const defaultStats: PlatformStats = {
  totalBusinesses: 0,
  totalReviews: 0,
  totalBookings: 0,
};

export function useStats() {
  return useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      try {
        // Try to fetch from API
        const response = await apiClient.get('/stats/public');
        return response.data;
      } catch (error) {
        // If API fails, try to get counts from existing endpoints
        try {
          const [businessesRes] = await Promise.allSettled([
            apiClient.get('/search?limit=1'),
          ]);
          
          let totalBusinesses = 0;
          
          if (businessesRes.status === 'fulfilled') {
            totalBusinesses = businessesRes.value.data?.pagination?.total || 0;
          }
          
          return {
            totalBusinesses,
            totalReviews: 0,
            totalBookings: 0,
          };
        } catch {
          return defaultStats;
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    placeholderData: defaultStats,
  });
}
