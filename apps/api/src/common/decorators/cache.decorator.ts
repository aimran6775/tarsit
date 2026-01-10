import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cacheTTL';

/**
 * Cache decorator for method-level caching
 * @param ttl Time to live in seconds (default: 300 = 5 minutes)
 */
export const Cache = (ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, true)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_KEY, ttl)(target, propertyKey, descriptor);
  };
};
