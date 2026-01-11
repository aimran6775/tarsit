'use client';

import { ar, en, ur, type TranslationKeys } from './translations';

// All available translations
const translations: Record<string, TranslationKeys> = {
  en,
  ar: ar as unknown as TranslationKeys,
  ur: ur as unknown as TranslationKeys,
};

// Supported languages metadata
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// RTL languages
export const RTL_LANGUAGES: LanguageCode[] = ['ar', 'ur'];

/**
 * Check if a language is RTL
 */
export function isRTL(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang as LanguageCode);
}

/**
 * Get language direction
 */
export function getDirection(lang: string): 'ltr' | 'rtl' {
  return isRTL(lang) ? 'rtl' : 'ltr';
}

/**
 * Get language info
 */
export function getLanguageInfo(code: string) {
  return LANGUAGES[code as LanguageCode] || LANGUAGES.en;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages() {
  return Object.values(LANGUAGES);
}

// Type for nested object paths
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? R extends string[]
          ? `${F}${D}${Join<R, D>}`
          : never
        : never
      : string;

export type TranslationPath = Join<PathsToStringProps<TranslationKeys>, '.'>;

/**
 * Get nested value from object by path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return path as fallback if not found
    }
  }

  return typeof result === 'string' ? result : path;
}

/**
 * Interpolate variables in translation string
 * Supports {{variable}} syntax
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Get translation for a key
 */
export function t(
  lang: string,
  key: TranslationPath | string,
  params?: Record<string, string | number>
): string {
  const translation = translations[lang] || translations[DEFAULT_LANGUAGE];
  const text = getNestedValue(translation as unknown as Record<string, unknown>, key);
  return interpolate(text, params);
}

/**
 * Create a translator function for a specific language
 */
export function createTranslator(lang: string) {
  return (key: TranslationPath | string, params?: Record<string, string | number>) =>
    t(lang, key, params);
}

/**
 * Get all translations for a language
 */
export function getTranslations(lang: string): TranslationKeys {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}

// Export type
export type { TranslationKeys };
