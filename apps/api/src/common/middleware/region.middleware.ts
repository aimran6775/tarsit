import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Extend Express Request to include region info
declare global {
  namespace Express {
    interface Request {
      regionCode?: string;
      regionId?: string;
      languageCode?: string;
      currencyCode?: string;
    }
  }
}

/**
 * Middleware to extract region, language, and currency preferences from request headers
 * Headers:
 * - X-Region-Code: Region code (e.g., 'US', 'UAE', 'UK')
 * - X-Language-Code: Language code (e.g., 'en', 'ar', 'ur')
 * - X-Currency-Code: Currency code (e.g., 'USD', 'AED', 'PKR')
 * - Accept-Language: Standard HTTP header for language preference
 */
@Injectable()
export class RegionMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    // Extract region from headers
    const regionCode =
      (req.headers['x-region-code'] as string) ||
      (req.headers['x-region'] as string) ||
      null;

    // Extract language from headers (prefer X-Language-Code, fallback to Accept-Language)
    const languageCode =
      (req.headers['x-language-code'] as string) ||
      (req.headers['x-language'] as string) ||
      this.parseAcceptLanguage(req.headers['accept-language'] as string) ||
      'en';

    // Extract currency from headers
    const currencyCode =
      (req.headers['x-currency-code'] as string) ||
      (req.headers['x-currency'] as string) ||
      null;

    // Set on request
    req.regionCode = regionCode || undefined;
    req.languageCode = languageCode;
    req.currencyCode = currencyCode || undefined;

    // If region code provided, look up the region ID
    if (regionCode) {
      try {
        const region = await this.prisma.region.findUnique({
          where: { code: regionCode.toUpperCase() },
          select: {
            id: true,
            defaultLanguage: true,
            currency: {
              select: { code: true },
            },
          },
        });

        if (region) {
          req.regionId = region.id;

          // Use region defaults if not explicitly set
          if (!req.languageCode || req.languageCode === 'en') {
            req.languageCode = region.defaultLanguage;
          }
          if (!req.currencyCode && region.currency) {
            req.currencyCode = region.currency.code;
          }
        }
      } catch {
        // Ignore errors - region is optional
      }
    }

    next();
  }

  /**
   * Parse Accept-Language header to get primary language
   * e.g., "en-US,en;q=0.9,ar;q=0.8" -> "en"
   */
  private parseAcceptLanguage(header: string | undefined): string | null {
    if (!header) return null;

    // Split by comma and get the first language
    const languages = header.split(',').map((lang) => {
      const [code] = lang.trim().split(';');
      // Get just the language code, not the locale (e.g., "en" from "en-US")
      return code.split('-')[0].toLowerCase();
    });

    // Return first valid language code
    const validLanguages = ['en', 'ar', 'ur', 'hi', 'es', 'fr', 'de'];
    return languages.find((lang) => validLanguages.includes(lang)) || null;
  }
}
