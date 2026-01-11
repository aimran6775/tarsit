import { apiClient } from './client';

// Types
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
  decimalPlaces: number;
}

export interface Region {
  id: string;
  code: string;
  name: string;
  flagEmoji?: string;
  flag?: string; // Alias for flagEmoji for backwards compatibility
  defaultLanguage: string;
  supportedLangs: string[];
  timezone: string;
  isRTL: boolean;
  active: boolean;
  currency: Currency;
  businessCount?: number;
  // Computed helpers
  defaultCurrency?: string;
}

export interface RegionLanguage {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  isDefault: boolean;
}

export interface FeaturedBusiness {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string | null;
  logoImage: string | null;
  rating: number;
  reviewCount: number;
  city: string;
  address: string;
}

export interface PopularCategory {
  slug: string;
  name: string;
  icon: string;
  color: string;
  businessCount: number;
}

export interface RegionStats {
  totalBusinesses: number;
  verifiedBusinesses: number;
  totalReviews: number;
  totalServices: number;
  averageRating: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
}

// API Functions

/**
 * Get all active regions
 */
export async function getAllRegions(): Promise<{ regions: Region[]; total: number }> {
  const response = await apiClient.get('/regions');
  return response.data;
}

/**
 * Get all regions with business counts
 */
export async function getRegionsWithCounts(): Promise<{ regions: Region[]; total: number }> {
  const response = await apiClient.get('/regions/with-counts');
  return response.data;
}

/**
 * Detect region from user's IP
 */
export async function detectRegion(): Promise<{
  regionCode: string;
  detectedIP: string;
  region: Region;
}> {
  const response = await apiClient.get('/regions/detect');
  return response.data;
}

/**
 * Get a specific region by code
 */
export async function getRegionByCode(code: string): Promise<Region> {
  const response = await apiClient.get(`/regions/${code}`);
  return response.data;
}

/**
 * Get supported languages for a region
 */
export async function getRegionLanguages(code: string): Promise<{
  regionCode: string;
  regionName: string;
  defaultLanguage: string;
  languages: RegionLanguage[];
}> {
  const response = await apiClient.get(`/regions/${code}/languages`);
  return response.data;
}

/**
 * Get featured businesses for a region
 */
export async function getFeaturedBusinesses(
  regionCode: string,
  limit: number = 6
): Promise<{
  regionCode: string;
  regionName: string;
  businesses: FeaturedBusiness[];
  total: number;
}> {
  const response = await apiClient.get(`/regions/${regionCode}/featured`, {
    params: { limit },
  });
  return response.data;
}

/**
 * Get popular categories for a region
 */
export async function getPopularCategories(
  regionCode: string,
  limit: number = 8
): Promise<{
  regionCode: string;
  regionName: string;
  categories: PopularCategory[];
  total: number;
}> {
  const response = await apiClient.get(`/regions/${regionCode}/popular-categories`, {
    params: { limit },
  });
  return response.data;
}

/**
 * Get statistics for a region
 */
export async function getRegionStats(regionCode: string): Promise<{
  regionCode: string;
  regionName: string;
  currency: Currency;
  stats: RegionStats;
}> {
  const response = await apiClient.get(`/regions/${regionCode}/stats`);
  return response.data;
}

/**
 * Get recently added businesses in a region
 */
export async function getRecentBusinesses(
  regionCode: string,
  limit: number = 10
): Promise<{
  regionCode: string;
  regionName: string;
  businesses: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    coverImage: string | null;
    logoImage: string | null;
    city: string;
    createdAt: string;
  }>;
  total: number;
}> {
  const response = await apiClient.get(`/regions/${regionCode}/recent`, {
    params: { limit },
  });
  return response.data;
}

// React Query hooks would go in a separate hooks file
