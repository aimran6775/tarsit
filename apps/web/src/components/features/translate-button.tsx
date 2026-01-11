'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRegion } from '@/contexts/region-context';
import { SUPPORTED_LANGUAGES, useTranslateBusiness, type LanguageCode } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { Check, Languages, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface TranslateButtonProps {
  businessId: string;
  originalLang?: string;
  onTranslate?: (translations: {
    name: string;
    description: string;
    tagline?: string;
    services: Array<{ name: string; description?: string }>;
  }) => void;
  onReset?: () => void;
  className?: string;
}

export function TranslateButton({
  businessId,
  originalLang = 'en',
  onTranslate,
  onReset,
  className,
}: TranslateButtonProps) {
  const { region } = useRegion();
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const translateBusiness = useTranslateBusiness();

  const handleTranslate = async (targetLang: string) => {
    if (targetLang === originalLang) {
      setActiveLanguage(null);
      onReset?.();
      return;
    }

    if (targetLang === activeLanguage) {
      // Reset to original
      setActiveLanguage(null);
      onReset?.();
      return;
    }

    try {
      const result = await translateBusiness.mutateAsync({
        businessId,
        targetLang,
      });

      setActiveLanguage(targetLang);

      // Parse service translations
      const serviceTranslations: Array<{ name: string; description?: string }> = [];
      let currentService: { name: string; description?: string } | null = null;

      for (const translation of result.services) {
        // Check if this is a name or description based on entity type
        // The service returns alternating name/description pairs
        if (!currentService) {
          currentService = { name: translation.translatedText };
        } else {
          currentService.description = translation.translatedText;
          serviceTranslations.push(currentService);
          currentService = null;
        }
      }

      // Handle case where there's a name without description
      if (currentService) {
        serviceTranslations.push(currentService);
      }

      onTranslate?.({
        name: result.name.translatedText,
        description: result.description.translatedText,
        tagline: result.tagline?.translatedText,
        services: serviceTranslations,
      });
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  // Get available languages (exclude the original language)
  const availableLanguages = Object.entries(SUPPORTED_LANGUAGES)
    .filter(([code]) => code !== originalLang)
    .map(([code, info]) => ({
      code,
      ...info,
    }));

  // Suggest the region's default language first
  const suggestedLang = region?.defaultLanguage;
  const sortedLanguages = [...availableLanguages].sort((a, b) => {
    if (a.code === suggestedLang) return -1;
    if (b.code === suggestedLang) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={activeLanguage ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', className)}
          disabled={translateBusiness.isPending}
        >
          {translateBusiness.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {activeLanguage
            ? SUPPORTED_LANGUAGES[activeLanguage as LanguageCode]?.nativeName
            : 'Translate'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Translate to</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Original language option to reset */}
        <DropdownMenuItem
          onClick={() => handleTranslate(originalLang)}
          className="flex items-center justify-between"
        >
          <span>
            {SUPPORTED_LANGUAGES[originalLang as LanguageCode]?.nativeName || 'Original'}
          </span>
          {!activeLanguage && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Available languages */}
        {sortedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleTranslate(lang.code)}
            className="flex items-center justify-between"
          >
            <span className={lang.rtl ? 'font-arabic' : ''}>
              {lang.nativeName}
              {lang.code === suggestedLang && (
                <span className="ml-2 text-xs text-muted-foreground">(Suggested)</span>
              )}
            </span>
            {activeLanguage === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
