'use client';

import {
  getOptimizedImageUrl,
  getThumbnailUrl,
  IMAGE_PRESETS,
  ImageTransformOptions,
  isSupabaseStorageUrl,
} from '@/lib/image-optimization';
import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image';
import { useCallback, useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  fallbackSrc?: string;
  preset?: keyof typeof IMAGE_PRESETS;
  transformOptions?: ImageTransformOptions;
  showSkeleton?: boolean;
}

/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image that:
 * - Automatically applies Supabase image transformations
 * - Shows loading skeleton/blur
 * - Handles fallback on error
 * - Optimizes for performance
 */
export function OptimizedImage({
  src,
  fallbackSrc = '/placeholder-business.png',
  preset,
  transformOptions,
  showSkeleton = true,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Apply optimizations based on preset or custom options
  const getOptimizedSrc = useCallback(
    (imageSrc: string) => {
      if (!isSupabaseStorageUrl(imageSrc)) {
        return imageSrc;
      }

      if (preset) {
        return getOptimizedImageUrl(imageSrc, IMAGE_PRESETS[preset]);
      }

      if (transformOptions) {
        return getOptimizedImageUrl(imageSrc, transformOptions);
      }

      // Default optimization for Supabase images
      return getOptimizedImageUrl(imageSrc, {
        quality: 80,
        format: 'webp',
      });
    },
    [preset, transformOptions]
  );

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  }, [currentSrc, fallbackSrc]);

  const optimizedSrc = error ? fallbackSrc : getOptimizedSrc(currentSrc);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      <Image
        {...props}
        src={optimizedSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          props.fill ? 'object-cover' : ''
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={props.priority ? undefined : 'lazy'}
      />
    </div>
  );
}

/**
 * Thumbnail variant optimized for lists/grids
 */
export function ThumbnailImage({
  src,
  size = 150,
  className,
  alt,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'preset'> & { size?: number }) {
  const thumbnailSrc = isSupabaseStorageUrl(src) ? getThumbnailUrl(src, size) : src;

  return (
    <OptimizedImage
      {...props}
      src={thumbnailSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-lg', className)}
      transformOptions={{ width: size, height: size, resize: 'cover' }}
    />
  );
}

/**
 * Avatar variant optimized for user/business avatars
 */
export function AvatarImage({
  src,
  size = 40,
  className,
  alt,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'preset'> & { size?: number }) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      width={size}
      height={size}
      preset="avatar"
      className={cn('rounded-full', className)}
    />
  );
}

/**
 * Card image variant for business cards
 */
export function CardImage({ src, className, alt, ...props }: Omit<OptimizedImageProps, 'preset'>) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      preset="card"
      className={cn('w-full h-48 object-cover', className)}
    />
  );
}

/**
 * Hero image variant for large banner images
 */
export function HeroImage({
  src,
  className,
  alt,
  priority = true,
  ...props
}: Omit<OptimizedImageProps, 'preset'>) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      preset="hero"
      priority={priority}
      className={cn('w-full h-full object-cover', className)}
    />
  );
}

export default OptimizedImage;
