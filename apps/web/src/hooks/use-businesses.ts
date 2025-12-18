import { businessApi, CreateBusinessData } from '@/lib/api/business.api';
import { searchApi } from '@/lib/api/search.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses', 'my'],
    queryFn: () => businessApi.getMyBusinesses(),
  });
};

export const useBusinessBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['business', slug],
    queryFn: () => businessApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useFeaturedBusinesses = () => {
  return useQuery({
    queryKey: ['businesses', 'featured'],
    queryFn: () => businessApi.getFeatured(),
  });
};

export const useNearbyBusinesses = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ['businesses', 'nearby', lat, lng],
    queryFn: () => searchApi.search({ latitude: lat, longitude: lng, radius: 10 }),
    enabled: !!lat && !!lng,
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
