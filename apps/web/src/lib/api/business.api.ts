import { apiClient } from './client';

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  verified: boolean;
  featured: boolean;
  photos: Array<{
    id: string;
    url: string;
    featured: boolean;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
  }>;
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessData {
  name: string;
  description: string;
  categoryId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  priceRange?: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
}

export const businessApi = {
  getById: async (id: string): Promise<Business> => {
    const response = await apiClient.get<Business>(`/businesses/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Business> => {
    const response = await apiClient.get<Business>(`/businesses/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateBusinessData): Promise<Business> => {
    const response = await apiClient.post<Business>('/businesses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateBusinessData>): Promise<Business> => {
    const response = await apiClient.patch<Business>(`/businesses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/businesses/${id}`);
  },

  getMyBusinesses: async (): Promise<Business[]> => {
    const response = await apiClient.get<Business[]>('/businesses/my');
    return response.data;
  },

  getFeatured: async (): Promise<Business[]> => {
    const response = await apiClient.get<Business[]>('/businesses/featured');
    return response.data;
  },
};
