import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark route as public (bypass auth)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
