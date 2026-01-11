import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

// Supported languages with their native names
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  ur: { name: 'Urdu', nativeName: 'اردو', rtl: true },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  es: { name: 'Spanish', nativeName: 'Español', rtl: false },
  fr: { name: 'French', nativeName: 'Français', rtl: false },
  de: { name: 'German', nativeName: 'Deutsch', rtl: false },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  cached: boolean;
  quality?: number;
}

export interface BatchTranslationResult {
  translations: TranslationResult[];
  totalCached: number;
  totalTranslated: number;
}

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);
  private openai!: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not configured - translations will not work');
    }
  }

  /**
   * Generate MD5 hash for cache lookup
   */
  private generateHash(text: string): string {
    return crypto.createHash('md5').update(text.trim().toLowerCase()).digest('hex');
  }

  /**
   * Check if translation exists in cache
   */
  private async getCachedTranslation(
    sourceHash: string,
    targetLang: string,
  ): Promise<string | null> {
    const cached = await this.prisma.translationCache.findUnique({
      where: {
        sourceHash_targetLang: {
          sourceHash,
          targetLang,
        },
      },
    });

    if (cached) {
      // Increment hit count asynchronously
      this.prisma.translationCache
        .update({
          where: { id: cached.id },
          data: { hitCount: { increment: 1 } },
        })
        .catch(() => {}); // Ignore errors for hit count update

      return cached.translatedText;
    }

    return null;
  }

  /**
   * Save translation to cache
   */
  private async cacheTranslation(
    sourceText: string,
    sourceLang: string,
    targetLang: string,
    translatedText: string,
    entityType?: string,
    entityId?: string,
    quality?: number,
  ): Promise<void> {
    const sourceHash = this.generateHash(sourceText);

    try {
      await this.prisma.translationCache.upsert({
        where: {
          sourceHash_targetLang: {
            sourceHash,
            targetLang,
          },
        },
        update: {
          translatedText,
          quality,
          updatedAt: new Date(),
        },
        create: {
          sourceHash,
          sourceText,
          sourceLang,
          targetLang,
          translatedText,
          entityType,
          entityId,
          quality,
        },
      });
    } catch (error) {
      this.logger.error('Failed to cache translation:', error);
    }
  }

  /**
   * Translate text using OpenAI
   */
  private async translateWithAI(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<{ translatedText: string; quality: number }> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    const sourceLanguage = SUPPORTED_LANGUAGES[sourceLang as LanguageCode]?.name || sourceLang;
    const targetLanguage = SUPPORTED_LANGUAGES[targetLang as LanguageCode]?.name || targetLang;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
Maintain the original meaning, tone, and context. 
For business content, keep it professional and accurate.
Only respond with the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: Math.min(text.length * 3, 4000), // Estimate max tokens needed
    });

    const translatedText = response.choices[0]?.message?.content?.trim() || '';

    // Estimate quality based on response
    const quality = translatedText.length > 0 ? 0.95 : 0;

    return { translatedText, quality };
  }

  /**
   * Translate a single text
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en',
    entityType?: string,
    entityId?: string,
  ): Promise<TranslationResult> {
    // Validate languages
    if (!SUPPORTED_LANGUAGES[targetLang as LanguageCode]) {
      throw new Error(`Unsupported target language: ${targetLang}`);
    }

    // Skip translation if same language
    if (sourceLang === targetLang) {
      return {
        originalText: text,
        translatedText: text,
        sourceLang,
        targetLang,
        cached: false,
      };
    }

    // Check cache first
    const sourceHash = this.generateHash(text);
    const cachedTranslation = await this.getCachedTranslation(sourceHash, targetLang);

    if (cachedTranslation) {
      return {
        originalText: text,
        translatedText: cachedTranslation,
        sourceLang,
        targetLang,
        cached: true,
      };
    }

    // Translate with AI
    try {
      const { translatedText, quality } = await this.translateWithAI(text, sourceLang, targetLang);

      // Cache the translation
      await this.cacheTranslation(
        text,
        sourceLang,
        targetLang,
        translatedText,
        entityType,
        entityId,
        quality,
      );

      return {
        originalText: text,
        translatedText,
        sourceLang,
        targetLang,
        cached: false,
        quality,
      };
    } catch (error) {
      this.logger.error(`Translation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(
    texts: Array<{ text: string; entityType?: string; entityId?: string }>,
    targetLang: string,
    sourceLang: string = 'en',
  ): Promise<BatchTranslationResult> {
    const results: TranslationResult[] = [];
    let totalCached = 0;
    let totalTranslated = 0;

    // Process texts - check cache first for all
    const textsToTranslate: Array<{
      index: number;
      text: string;
      entityType?: string;
      entityId?: string;
    }> = [];

    for (let i = 0; i < texts.length; i++) {
      const { text, entityType, entityId } = texts[i];
      const sourceHash = this.generateHash(text);
      const cachedTranslation = await this.getCachedTranslation(sourceHash, targetLang);

      if (cachedTranslation) {
        results[i] = {
          originalText: text,
          translatedText: cachedTranslation,
          sourceLang,
          targetLang,
          cached: true,
        };
        totalCached++;
      } else {
        textsToTranslate.push({ index: i, text, entityType, entityId });
      }
    }

    // Batch translate remaining texts
    if (textsToTranslate.length > 0 && this.openai) {
      // For efficiency, translate in batches of 5
      const batchSize = 5;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async ({ index, text, entityType, entityId }) => {
            try {
              const result = await this.translate(text, targetLang, sourceLang, entityType, entityId);
              results[index] = result;
              if (!result.cached) totalTranslated++;
            } catch (error) {
              // On error, return original text
              results[index] = {
                originalText: text,
                translatedText: text,
                sourceLang,
                targetLang,
                cached: false,
              };
            }
          }),
        );
      }
    }

    return {
      translations: results,
      totalCached,
      totalTranslated,
    };
  }

  /**
   * Translate a business's content
   */
  async translateBusiness(
    businessId: string,
    targetLang: string,
  ): Promise<{
    name: TranslationResult;
    description: TranslationResult;
    tagline?: TranslationResult;
    services: TranslationResult[];
  }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: {
          where: { active: true },
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    const sourceLang = business.defaultLanguage || 'en';

    // Translate name
    const nameTranslation = await this.translate(
      business.name,
      targetLang,
      sourceLang,
      'business_name',
      businessId,
    );

    // Translate description
    const descriptionTranslation = await this.translate(
      business.description || '',
      targetLang,
      sourceLang,
      'business_description',
      businessId,
    );

    // Translate tagline if exists
    let taglineTranslation: TranslationResult | undefined;
    if (business.tagline) {
      taglineTranslation = await this.translate(
        business.tagline,
        targetLang,
        sourceLang,
        'business_tagline',
        businessId,
      );
    }

    // Translate services
    const serviceTranslations: TranslationResult[] = [];
    for (const service of business.services) {
      const nameResult = await this.translate(
        service.name,
        targetLang,
        sourceLang,
        'service_name',
        service.id,
      );
      serviceTranslations.push(nameResult);

      if (service.description) {
        const descResult = await this.translate(
          service.description,
          targetLang,
          sourceLang,
          'service_description',
          service.id,
        );
        serviceTranslations.push(descResult);
      }
    }

    return {
      name: nameTranslation,
      description: descriptionTranslation,
      tagline: taglineTranslation,
      services: serviceTranslations,
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
      code,
      ...info,
    }));
  }

  /**
   * Detect language of text (simple heuristic + OpenAI fallback)
   */
  async detectLanguage(text: string): Promise<string> {
    // Simple heuristic for common scripts
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic script
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) return 'ur'; // Urdu

    // Use AI for detection if needed
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Detect the language of the following text. Respond with only the ISO 639-1 language code (e.g., "en", "es", "ar").',
            },
            { role: 'user', content: text.substring(0, 500) },
          ],
          temperature: 0,
          max_tokens: 10,
        });

        const detected = response.choices[0]?.message?.content?.trim().toLowerCase();
        if (detected && detected.length === 2) {
          return detected;
        }
      } catch (error) {
        this.logger.error('Language detection failed:', error);
      }
    }

    return 'en'; // Default to English
  }

  /**
   * Clear translation cache for an entity
   */
  async clearCache(entityType: string, entityId: string): Promise<number> {
    const result = await this.prisma.translationCache.deleteMany({
      where: { entityType, entityId },
    });
    return result.count;
  }

  /**
   * Get translation stats
   */
  async getStats(): Promise<{
    totalCached: number;
    byLanguage: Record<string, number>;
    topHits: Array<{ sourceText: string; targetLang: string; hitCount: number }>;
  }> {
    const [totalCached, byLanguageRaw, topHits] = await Promise.all([
      this.prisma.translationCache.count(),
      this.prisma.translationCache.groupBy({
        by: ['targetLang'],
        _count: true,
      }),
      this.prisma.translationCache.findMany({
        orderBy: { hitCount: 'desc' },
        take: 10,
        select: {
          sourceText: true,
          targetLang: true,
          hitCount: true,
        },
      }),
    ]);

    const byLanguage: Record<string, number> = {};
    for (const item of byLanguageRaw) {
      byLanguage[item.targetLang] = item._count;
    }

    return {
      totalCached,
      byLanguage,
      topHits,
    };
  }
}
