// Export API client
export { apiClient } from './client';

// Export all APIs
export { authApi, type User, type LoginData, type SignupData, type AuthResponse } from './auth.api';
export { businessApi, type Business, type CreateBusinessData } from './business.api';
export { categoriesApi, type Category } from './categories.api';
export { searchApi, type SearchParams, type SearchResponse, type AutocompleteResult } from './search.api';
export { reviewApi, type Review, type CreateReviewData } from './review.api';
export { appointmentApi, type Appointment, type CreateAppointmentData } from './appointment.api';
export { uploadApi, type UploadedImage, type UploadFolder, validateImageFile } from './upload.api';

// Combined API object for convenience
import { authApi } from './auth.api';
import { businessApi } from './business.api';
import { categoriesApi } from './categories.api';
import { searchApi } from './search.api';
import { reviewApi } from './review.api';
import { appointmentApi } from './appointment.api';
import { uploadApi } from './upload.api';

export const api = {
  auth: authApi,
  business: businessApi,
  categories: categoriesApi,
  search: searchApi,
  reviews: reviewApi,
  appointments: appointmentApi,
  upload: uploadApi,
};
