import { apiClient } from './client';

export interface UploadedImage {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface MultiUploadResponse {
  images: UploadedImage[];
  count: number;
}

export type UploadFolder = 'businesses' | 'profiles' | 'reviews' | 'covers' | 'logos' | 'messages';

/**
 * Upload API client for handling image uploads
 */
export const uploadApi = {
  /**
   * Upload a single image
   */
  uploadImage: async (file: File, folder: UploadFolder = 'businesses'): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `tarsit/${folder}`);

    const response = await apiClient.post<UploadedImage>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload multiple images (max 10)
   */
  uploadImages: async (
    files: File[],
    folder: UploadFolder = 'businesses'
  ): Promise<MultiUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', `tarsit/${folder}`);

    const response = await apiClient.post<MultiUploadResponse>('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete an image by public ID
   */
  deleteImage: async (publicId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/uploads/image',
      {
        data: { publicId },
      }
    );
    return response.data;
  },
};

/**
 * Helper to validate file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.map((t) => t.split('/')[1]).join(', ')}`,
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Helper to create preview URLs for files
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Helper to revoke preview URLs (call when done with preview)
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
