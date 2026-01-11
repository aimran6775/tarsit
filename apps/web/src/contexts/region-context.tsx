'use client';

import { apiClient } from '@/lib/api/client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// ==========================================
// TYPES
// ==========================================

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
  exchangeRateToUSD: number;
}

export interface Region {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  defaultLanguage: string;
  supportedLangs: string[];
  timezone: string;
  isRTL: boolean;
  flagEmoji?: string;
  phoneCode?: string;
  order: number;
  currency: Currency;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  isDefault: boolean;
}

interface RegionContextType {
  // State
  region: Region | null;
  language: string;
  languages: Language[];
  regions: Region[];
  currencies: Currency[];
  isLoading: boolean;
  isDetecting: boolean;
  
  // Actions
  setRegion: (regionCode: string) => Promise<void>;
  setLanguage: (languageCode: string) => void;
  detectRegion: () => Promise<void>;
  
  // Utilities
  formatPrice: (amount: number, currencyCode?: string) => string;
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  getDirection: () => 'ltr' | 'rtl';
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

// Storage keys
const REGION_STORAGE_KEY = 'tarsit-region';
const LANGUAGE_STORAGE_KEY = 'tarsit-language';

// Language metadata
const LANGUAGE_INFO: Record<string, { name: string; nativeName: string; isRTL: boolean }> = {
  en: { name: 'English', nativeName: 'English', isRTL: false },
  ar: { name: 'Arabic', nativeName: 'العربية', isRTL: true },
  ur: { name: 'Urdu', nativeName: 'اردو', isRTL: true },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', isRTL: false },
  es: { name: 'Spanish', nativeName: 'Español', isRTL: false },
  fr: { name: 'French', nativeName: 'Français', isRTL: false },
  de: { name: 'German', nativeName: 'Deutsch', isRTL: false },
};

// ==========================================
// PROVIDER
// ==========================================

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region | null>(null);
  const [language, setLanguageState] = useState<string>('en');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ==========================================
  // FETCH DATA
  // ==========================================

  // Fetch all regions
  const fetchRegions = useCallback(async () => {
    try {
      const response = await apiClient.get('/regions');
      setRegions(response.data.regions || []);
      return response.data.regions || [];
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      return [];
    }
  }, []);

  // Fetch all currencies
  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await apiClient.get('/currencies');
      setCurrencies(response.data.currencies || []);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  }, []);

  // ==========================================
  // REGION MANAGEMENT
  // ==========================================

  // Set region by code
  const setRegion = useCallback(async (regionCode: string) => {
    try {
      const response = await apiClient.get(`/regions/${regionCode}`);
      const newRegion = response.data;
      
      setRegionState(newRegion);
      localStorage.setItem(REGION_STORAGE_KEY, regionCode);
      
      // Update languages for this region
      const langs = (newRegion.supportedLangs || ['en']).map((code: string) => ({
        code,
        ...LANGUAGE_INFO[code] || { name: code, nativeName: code, isRTL: false },
        isDefault: code === newRegion.defaultLanguage,
      }));
      setLanguages(langs);
      
      // If current language not supported in new region, switch to default
      if (!newRegion.supportedLangs?.includes(language)) {
        setLanguageState(newRegion.defaultLanguage || 'en');
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newRegion.defaultLanguage || 'en');
      }
      
      // Apply RTL if needed
      applyDirection(newRegion.isRTL && ['ar', 'ur'].includes(language));
      
    } catch (error) {
      console.error('Failed to set region:', error);
    }
  }, [language]);

  // Set language
  const setLanguage = useCallback((languageCode: string) => {
    setLanguageState(languageCode);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    
    // Apply RTL based on language
    const langInfo = LANGUAGE_INFO[languageCode];
    applyDirection(langInfo?.isRTL || false);
  }, []);

  // Detect region from IP
  const detectRegion = useCallback(async () => {
    setIsDetecting(true);
    try {
      const response = await apiClient.get('/regions/detect');
      const detectedCode = response.data.regionCode;
      
      if (detectedCode) {
        await setRegion(detectedCode);
      }
    } catch (error) {
      console.error('Failed to detect region:', error);
      // Default to US
      await setRegion('US');
    } finally {
      setIsDetecting(false);
    }
  }, [setRegion]);

  // ==========================================
  // UTILITIES
  // ==========================================

  // Apply text direction to document
  const applyDirection = (isRTL: boolean) => {
    const html = document.documentElement;
    if (isRTL) {
      html.setAttribute('dir', 'rtl');
      html.classList.add('rtl');
    } else {
      html.setAttribute('dir', 'ltr');
      html.classList.remove('rtl');
    }
  };

  // Get current direction
  const getDirection = useCallback((): 'ltr' | 'rtl' => {
    const langInfo = LANGUAGE_INFO[language];
    return langInfo?.isRTL ? 'rtl' : 'ltr';
  }, [language]);

  // Format price with currency
  const formatPrice = useCallback((amount: number, currencyCode?: string): string => {
    const currency = currencyCode 
      ? currencies.find(c => c.code === currencyCode) 
      : region?.currency;
    
    if (!currency) {
      return `$${amount.toFixed(2)}`;
    }

    // Format number with separators
    const parts = amount.toFixed(currency.decimalPlaces).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
    const formattedNumber = parts.join(currency.decimalSeparator);

    // Add symbol
    if (currency.symbolPosition === 'before') {
      return `${currency.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber} ${currency.symbol}`;
    }
  }, [region, currencies]);

  // Convert price between currencies
  const convertPrice = useCallback((amount: number, fromCurrency: string, toCurrency?: string): number => {
    const from = currencies.find(c => c.code === fromCurrency);
    const to = toCurrency 
      ? currencies.find(c => c.code === toCurrency)
      : region?.currency;

    if (!from || !to) return amount;

    // Convert through USD
    const amountInUSD = amount * from.exchangeRateToUSD;
    return amountInUSD / to.exchangeRateToUSD;
  }, [region, currencies]);

  // ==========================================
  // INITIALIZATION
  // ==========================================

  useEffect(() => {
    const init = async () => {
      setMounted(true);
      setIsLoading(true);

      try {
        // Fetch all regions and currencies
        const [fetchedRegions] = await Promise.all([
          fetchRegions(),
          fetchCurrencies(),
        ]);

        // Check for saved region
        const savedRegion = localStorage.getItem(REGION_STORAGE_KEY);
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (savedRegion && fetchedRegions.length > 0) {
          // Use saved region
          await setRegion(savedRegion);
          if (savedLanguage) {
            setLanguageState(savedLanguage);
          }
        } else {
          // Auto-detect region on first visit
          await detectRegion();
        }

        // Apply saved language direction
        if (savedLanguage) {
          const langInfo = LANGUAGE_INFO[savedLanguage];
          applyDirection(langInfo?.isRTL || false);
        }
      } catch (error) {
        console.error('Failed to initialize region:', error);
        // Set defaults
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [fetchRegions, fetchCurrencies, setRegion, detectRegion]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value: RegionContextType = {
    region,
    language,
    languages,
    regions,
    currencies,
    isLoading,
    isDetecting,
    setRegion,
    setLanguage,
    detectRegion,
    formatPrice,
    convertPrice,
    getDirection,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <RegionContext.Provider value={{
        ...value,
        region: null,
        isLoading: true,
      }}>
        {children}
      </RegionContext.Provider>
    );
  }

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

// ==========================================
// UTILITIES
// ==========================================

/**
 * Hook to get formatted price with automatic currency conversion
 */
export function useFormattedPrice(amount: number, fromCurrency?: string) {
  const { formatPrice, convertPrice, region } = useRegion();
  
  if (!fromCurrency || !region) {
    return formatPrice(amount);
  }
  
  const convertedAmount = convertPrice(amount, fromCurrency);
  return formatPrice(convertedAmount);
}
