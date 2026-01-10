'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type Category } from '@/lib/api';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(id: string) {
  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await categoriesApi.getById(id);
      return response;
    },
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery<Category>({
    queryKey: ['category', 'slug', slug],
    queryFn: async () => {
      const response = await categoriesApi.getBySlug(slug);
      return response;
    },
    enabled: !!slug,
  });
}
