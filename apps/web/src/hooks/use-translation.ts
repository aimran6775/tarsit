'use client';

import { useRegion } from '@/contexts/region-context';
import { apiClient } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

// Supported languages
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

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

// Query keys
export const translationKeys = {
  all: ['translations'] as const,
  languages: () => [...translationKeys.all, 'languages'] as const,
  translate: (text: string, targetLang: string) =>
    [...translationKeys.all, 'translate', text.substring(0, 50), targetLang] as const,
  business: (businessId: string, targetLang: string) =>
    [...translationKeys.all, 'business', businessId, targetLang] as const,
};

// Fetch supported languages
export function useSupportedLanguages() {
  return useQuery<SupportedLanguage[]>({
    queryKey: translationKeys.languages(),
    queryFn: async () => {
      const response = await apiClient.get('/translations/languages');
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - languages don't change often
  });
}

// Translate a single text
export function useTranslateText() {
  const queryClient = useQueryClient();

  return useMutation<TranslationResult, Error, { text: string; targetLang: string; sourceLang?: string }>({
    mutationFn: async ({ text, targetLang, sourceLang = 'en' }) => {
      const response = await apiClient.post('/translations/translate', {
        text,
        targetLang,
        sourceLang,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Cache the translation for future use
      queryClient.setQueryData(
        translationKeys.translate(data.originalText, data.targetLang),
        data
      );
    },
  });
}

// Translate multiple texts in batch
export function useBatchTranslate() {
  return useMutation<
    BatchTranslationResult,
    Error,
    { texts: Array<{ text: string; entityType?: string; entityId?: string }>; targetLang: string; sourceLang?: string }
  >({
    mutationFn: async ({ texts, targetLang, sourceLang = 'en' }) => {
      const response = await apiClient.post('/translations/translate/batch', {
        texts,
        targetLang,
        sourceLang,
      });
      return response.data;
    },
  });
}

// Translate all business content
export function useTranslateBusiness() {
  const queryClient = useQueryClient();

  return useMutation<
    {
      name: TranslationResult;
      description: TranslationResult;
      tagline?: TranslationResult;
      services: TranslationResult[];
    },
    Error,
    { businessId: string; targetLang: string }
  >({
    mutationFn: async ({ businessId, targetLang }) => {
      const response = await apiClient.post('/translations/translate/business', {
        businessId,
        targetLang,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Cache the business translation
      queryClient.setQueryData(
        translationKeys.business(variables.businessId, variables.targetLang),
        data
      );
    },
  });
}

// Detect language
export function useDetectLanguage() {
  return useMutation<{ language: string }, Error, string>({
    mutationFn: async (text) => {
      const response = await apiClient.post('/translations/detect', { text });
      return response.data;
    },
  });
}

// Hook to get translated content with auto-translate based on region
export function useTranslatedContent(
  content: string | null | undefined,
  sourceLang: string = 'en'
) {
  const { region } = useRegion();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const translateMutation = useTranslateText();

  const targetLang = region?.defaultLanguage || 'en';
  const shouldTranslate = targetLang !== sourceLang && content;

  const translate = useCallback(async () => {
    if (!shouldTranslate || !content) {
      setTranslatedContent(null);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateMutation.mutateAsync({
        text: content,
        targetLang,
        sourceLang,
      });
      setTranslatedContent(result.translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatedContent(null);
    } finally {
      setIsTranslating(false);
    }
  }, [content, targetLang, sourceLang, shouldTranslate, translateMutation]);

  return {
    originalContent: content,
    translatedContent,
    isTranslating,
    translate,
    shouldTranslate,
    targetLang,
  };
}

// Hook for translation state management on a page
export function usePageTranslation() {
  const { region } = useRegion();
  const [isTranslated, setIsTranslated] = useState(false);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());

  const targetLang = region?.defaultLanguage || 'en';
  const isRTL = SUPPORTED_LANGUAGES[targetLang as LanguageCode]?.rtl || false;

  const batchTranslate = useBatchTranslate();

  const translatePage = useCallback(
    async (texts: Array<{ key: string; text: string }>, sourceLang: string = 'en') => {
      if (targetLang === sourceLang) {
        setIsTranslated(false);
        setTranslations(new Map());
        return;
      }

      try {
        const result = await batchTranslate.mutateAsync({
          texts: texts.map((t) => ({ text: t.text })),
          targetLang,
          sourceLang,
        });

        const newTranslations = new Map<string, string>();
        texts.forEach((t, index) => {
          if (result.translations[index]) {
            newTranslations.set(t.key, result.translations[index].translatedText);
          }
        });

        setTranslations(newTranslations);
        setIsTranslated(true);
      } catch (error) {
        console.error('Page translation failed:', error);
      }
    },
    [targetLang, batchTranslate]
  );

  const getTranslation = useCallback(
    (key: string, fallback: string) => {
      if (!isTranslated) return fallback;
      return translations.get(key) || fallback;
    },
    [isTranslated, translations]
  );

  const resetTranslation = useCallback(() => {
    setIsTranslated(false);
    setTranslations(new Map());
  }, []);

  return {
    isTranslated,
    isTranslating: batchTranslate.isPending,
    translatePage,
    getTranslation,
    resetTranslation,
    targetLang,
    isRTL,
  };
}

// Get language info helper
export function getLanguageInfo(code: string): SupportedLanguage | null {
  const lang = SUPPORTED_LANGUAGES[code as LanguageCode];
  if (!lang) return null;
  return { code, ...lang };
}

// Check if a language code is RTL
export function isRTLLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES[code as LanguageCode]?.rtl || false;
}
