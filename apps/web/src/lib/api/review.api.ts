import { apiClient } from './client';

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  helpful?: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  business: {
    id: string;
    name: string;
    slug: string;
  };
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  businessId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reviewApi = {
  getByBusinessId: async (businessId: string, page = 1, limit = 20): Promise<ReviewsResponse> => {
    const response = await apiClient.get<ReviewsResponse>('/reviews', {
      params: { businessId, page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateReviewData>): Promise<Review> => {
    const response = await apiClient.patch<Review>(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  respond: async (id: string, response: string): Promise<Review> => {
    const res = await apiClient.post<Review>(`/reviews/${id}/respond`, { response });
    return res.data;
  },

  deleteResponse: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}/respond`);
  },

  getMyReviews: async (): Promise<ReviewsResponse> => {
    const response = await apiClient.get<ReviewsResponse>('/reviews', {
      params: { my: true },
    });
    return response.data;
  },

  markHelpful: async (id: string): Promise<Review> => {
    const response = await apiClient.post<Review>(`/reviews/${id}/helpful`);
    return response.data;
  },
};
