import { apiClient } from './client';

export interface SearchParams {
  q?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  priceRange?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export interface BusinessPhoto {
  id: string;
  url: string;
  featured: boolean;
}

export interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: BusinessCategory;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  verified: boolean;
  featured: boolean;
  primaryPhoto: BusinessPhoto | null;
  distance: number | null;
  stats: {
    reviews: number;
    services: number;
    favorites: number;
  };
}

export interface SearchResponse {
  businesses: Business[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    hasLocation: boolean;
    radius: number | null;
  };
}

export interface AutocompleteResult {
  businesses: Array<{ id: string; name: string; slug: string; category: string; logoUrl?: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  suggestions: string[];
}

export const searchApi = {
  search: async (params: SearchParams = {}): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.set('q', params.q);
    if (params.category) queryParams.set('category', params.category);
    if (params.location) queryParams.set('location', params.location);
    if (params.latitude) queryParams.set('latitude', params.latitude.toString());
    if (params.longitude) queryParams.set('longitude', params.longitude.toString());
    if (params.radius) queryParams.set('radius', params.radius.toString());
    if (params.priceRange) queryParams.set('priceRange', params.priceRange);
    if (params.rating) queryParams.set('rating', params.rating.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    
    const response = await apiClient.get<SearchResponse>(`/search?${queryParams.toString()}`);
    return response.data;
  },

  autocomplete: async (query: string): Promise<AutocompleteResult> => {
    try {
      const response = await apiClient.get<AutocompleteResult>(`/search/autocomplete?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch {
      // Return empty results if autocomplete endpoint doesn't exist
      return { businesses: [], categories: [], suggestions: [] };
    }
  },

  getBusinessBySlug: async (slug: string): Promise<Business> => {
    const response = await apiClient.get<Business>(`/businesses/${slug}`);
    return response.data;
  },
};