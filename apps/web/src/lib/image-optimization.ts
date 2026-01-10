/**
 * Supabase Image Optimization Utilities
 *
 * Provides functions to generate optimized image URLs using Supabase Storage transformations
 * and implement lazy loading with blur placeholders.
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transform a Supabase Storage URL to use image transformations
 * Supabase supports on-the-fly image transformations via URL parameters
 *
 * NOTE: Using direct URLs for faster loading. Supabase render API can be slow.
 * The browser and Next.js Image component handle optimization.
 */
export function getOptimizedImageUrl(url: string, _options: ImageTransformOptions = {}): string {
  // Return original URL directly for faster loading
  // Next.js Image component handles optimization client-side
  return url || '';
}

/**
 * Generate a tiny blur placeholder URL (20px wide for LQIP)
 */
export function getBlurPlaceholderUrl(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 20,
    quality: 20,
    format: 'webp',
  });
}

/**
 * Get optimized thumbnail URL
 */
export function getThumbnailUrl(url: string, size: number = 200): string {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    quality: 70,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get responsive image srcSet for different breakpoints
 */
export function getResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string {
  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(url, { width, quality: 80 });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Image size presets for common use cases
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  card: { width: 400, height: 300, quality: 80 },
  hero: { width: 1200, height: 600, quality: 85 },
  avatar: { width: 100, height: 100, quality: 80 },
  gallery: { width: 800, height: 600, quality: 85 },
  fullWidth: { width: 1920, quality: 90 },
} as const;

/**
 * Get optimized URL using a preset
 */
export function getPresetImageUrl(url: string, preset: keyof typeof IMAGE_PRESETS): string {
  return getOptimizedImageUrl(url, IMAGE_PRESETS[preset]);
}

/**
 * Check if URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url?.includes('supabase.co/storage');
}

/**
 * Extract file path from Supabase Storage URL
 */
export function extractSupabasePath(url: string): string | null {
  if (!isSupabaseStorageUrl(url)) return null;

  const match = url.match(/\/storage\/v1\/(?:object|render\/image)\/public\/(.+?)(?:\?|$)/);
  return match ? match[1] : null;
}
