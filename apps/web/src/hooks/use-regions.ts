import {
    detectRegion,
    getAllRegions,
    getFeaturedBusinesses,
    getPopularCategories,
    getRecentBusinesses,
    getRegionByCode,
    getRegionLanguages,
    getRegionStats,
    getRegionsWithCounts,
} from '@/lib/api/regions';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get all active regions
 */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getAllRegions,
    staleTime: 1000 * 60 * 60, // 1 hour - regions rarely change
  });
}

/**
 * Hook to get regions with business counts
 */
export function useRegionsWithCounts() {
  return useQuery({
    queryKey: ['regions', 'with-counts'],
    queryFn: getRegionsWithCounts,
    staleTime: 1000 * 60 * 5, // 5 minutes - counts might change
  });
}

/**
 * Hook to detect user's region from IP
 */
export function useDetectRegion() {
  return useQuery({
    queryKey: ['regions', 'detect'],
    queryFn: detectRegion,
    staleTime: 1000 * 60 * 60, // 1 hour - IP-based detection
    retry: 1, // Only retry once on failure
  });
}

/**
 * Hook to get a specific region by code
 */
export function useRegion(code: string | null | undefined) {
  return useQuery({
    queryKey: ['regions', code],
    queryFn: () => getRegionByCode(code!),
    enabled: !!code,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get supported languages for a region
 */
export function useRegionLanguages(regionCode: string | null | undefined) {
  return useQuery({
    queryKey: ['regions', regionCode, 'languages'],
    queryFn: () => getRegionLanguages(regionCode!),
    enabled: !!regionCode,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get featured businesses for a region
 */
export function useFeaturedBusinesses(regionCode: string | null | undefined, limit?: number) {
  return useQuery({
    queryKey: ['regions', regionCode, 'featured', limit],
    queryFn: () => getFeaturedBusinesses(regionCode!, limit),
    enabled: !!regionCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get popular categories for a region
 */
export function usePopularCategories(regionCode: string | null | undefined, limit?: number) {
  return useQuery({
    queryKey: ['regions', regionCode, 'popular-categories', limit],
    queryFn: () => getPopularCategories(regionCode!, limit),
    enabled: !!regionCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get statistics for a region
 */
export function useRegionStats(regionCode: string | null | undefined) {
  return useQuery({
    queryKey: ['regions', regionCode, 'stats'],
    queryFn: () => getRegionStats(regionCode!),
    enabled: !!regionCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get recently added businesses in a region
 */
export function useRecentBusinesses(regionCode: string | null | undefined, limit?: number) {
  return useQuery({
    queryKey: ['regions', regionCode, 'recent', limit],
    queryFn: () => getRecentBusinesses(regionCode!, limit),
    enabled: !!regionCode,
    staleTime: 1000 * 60 * 2, // 2 minutes - recent data changes often
  });
}
