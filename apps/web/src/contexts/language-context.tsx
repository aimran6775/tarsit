'use client';

import {
    createTranslator,
    DEFAULT_LANGUAGE,
    getDirection,
    getLanguageInfo,
    isRTL,
    LANGUAGES,
    type LanguageCode,
    type TranslationPath,
} from '@/lib/i18n';
import { getFontFamily } from '@/lib/i18n/rtl';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

// Storage key
const LANGUAGE_STORAGE_KEY = 'tarsit-language';

// Context type
interface LanguageContextType {
  // Current language
  language: LanguageCode;
  languageInfo: (typeof LANGUAGES)[LanguageCode];

  // Direction
  direction: 'ltr' | 'rtl';
  isRTL: boolean;

  // Available languages
  languages: typeof LANGUAGES;

  // Actions
  setLanguage: (lang: LanguageCode) => void;

  // Translation function
  t: (key: TranslationPath | string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
}

export function LanguageProvider({
  children,
  defaultLanguage = DEFAULT_LANGUAGE,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && saved in LANGUAGES) {
      setLanguageState(saved as LanguageCode);
    }
  }, []);

  // Update document attributes when language changes
  useEffect(() => {
    if (!mounted) return;

    const dir = getDirection(language);
    const fontFamily = getFontFamily(language);

    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = dir;

    // Update font family
    document.documentElement.style.setProperty('--font-family', fontFamily);

    // Add RTL class for easier CSS targeting
    if (isRTL(language)) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [language, mounted]);

  // Set language handler
  const setLanguage = useCallback((lang: LanguageCode) => {
    if (lang in LANGUAGES) {
      setLanguageState(lang);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  }, []);

  // Create translator
  const t = useMemo(() => createTranslator(language), [language]);

  // Compute derived values
  const direction = getDirection(language);
  const languageInfo = getLanguageInfo(language);
  const isRTLLanguage = isRTL(language);

  const value = useMemo(
    () => ({
      language,
      languageInfo,
      direction,
      isRTL: isRTLLanguage,
      languages: LANGUAGES,
      setLanguage,
      t,
    }),
    [language, languageInfo, direction, isRTLLanguage, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for just the translation function
export function useT() {
  const { t } = useLanguage();
  return t;
}

// Hook for direction utilities
export function useDirection() {
  const { direction, isRTL } = useLanguage();
  return { direction, isRTL };
}
