'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Lazy-loaded Image Component
 * Only loads images when they're about to enter the viewport
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  if (fill) {
    return (
      <div ref={imgRef} className={cn('relative', className)}>
        {isInView && (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={cn('relative', className)}>
      {isInView && width && height && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {!isLoaded && width && height && (
        <div
          className="bg-neutral-800 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}
