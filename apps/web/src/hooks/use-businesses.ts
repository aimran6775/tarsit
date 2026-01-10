import { businessApi, CreateBusinessData } from '@/lib/api/business.api';
import { searchApi } from '@/lib/api/search.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Cache times for business data
const BUSINESS_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const FEATURED_STALE_TIME = 10 * 60 * 1000; // 10 minutes (changes less frequently)

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses', 'my'],
    queryFn: () => businessApi.getMyBusinesses(),
    staleTime: BUSINESS_STALE_TIME,
  });
};

export const useBusinessBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['business', slug],
    queryFn: () => businessApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: BUSINESS_STALE_TIME,
  });
};

export const useFeaturedBusinesses = () => {
  return useQuery({
    queryKey: ['businesses', 'featured'],
    queryFn: () => businessApi.getFeatured(),
    staleTime: FEATURED_STALE_TIME,
  });
};

export const useNearbyBusinesses = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ['businesses', 'nearby', lat, lng],
    queryFn: () => searchApi.search({ latitude: lat, longitude: lng, radius: 10 }),
    enabled: !!lat && !!lng,
    staleTime: BUSINESS_STALE_TIME,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusinessData) => businessApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBusinessData> }) =>
      businessApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.slug] });
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};
