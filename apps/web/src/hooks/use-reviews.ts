import { CreateReviewData, reviewApi } from '@/lib/api/review.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useReviews = (businessId?: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['reviews', businessId, page, limit],
    queryFn: () => {
      if (businessId) {
        return reviewApi.getByBusinessId(businessId, page, limit);
      }
      return reviewApi.getMyReviews();
    },
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.business.slug] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReviewData> }) =>
      reviewApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewApi.markHelpful(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
