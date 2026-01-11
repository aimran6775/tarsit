import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Parameter decorator to get region info from request
 * Usage: @Region() region: RegionInfo
 */
export interface RegionInfo {
  regionCode?: string;
  regionId?: string;
  languageCode: string;
  currencyCode?: string;
}

export const Region = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RegionInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return {
      regionCode: request.regionCode,
      regionId: request.regionId,
      languageCode: request.languageCode || 'en',
      currencyCode: request.currencyCode,
    };
  },
);

/**
 * Get just the region code
 */
export const RegionCode = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.regionCode;
  },
);

/**
 * Get just the region ID
 */
export const RegionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.regionId;
  },
);

/**
 * Get just the language code
 */
export const LanguageCode = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.languageCode || 'en';
  },
);

/**
 * Get just the currency code
 */
export const CurrencyCode = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.currencyCode;
  },
);
