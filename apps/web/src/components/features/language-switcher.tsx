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
import { useLanguage } from '@/contexts/language-context';
import { type LanguageCode } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Check, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'outline',
  size = 'default',
  showLabel = true,
  className,
}: LanguageSwitcherProps) {
  const { language, languageInfo, languages, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className={languageInfo.rtl ? 'font-arabic' : ''}>
              {languageInfo.nativeName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(languages).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as LanguageCode)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className={cn(info.rtl && 'font-arabic')}>
              {info.nativeName}
              <span className="ml-2 text-xs text-muted-foreground">({info.name})</span>
            </span>
            {language === code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile/navbar
export function LanguageSwitcherCompact({ className }: { className?: string }) {
  return <LanguageSwitcher variant="ghost" size="icon" showLabel={false} className={className} />;
}

// Inline switcher with flags
export function LanguageSwitcherInline({ className }: { className?: string }) {
  const { language, languages, setLanguage } = useLanguage();

  // Language to flag emoji mapping
  const flags: Record<string, string> = {
    en: '🇺🇸',
    ar: '🇸🇦',
    ur: '🇵🇰',
    hi: '🇮🇳',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Object.entries(languages).map(([code, info]) => (
        <button
          key={code}
          onClick={() => setLanguage(code as LanguageCode)}
          className={cn(
            'px-2 py-1 rounded-md text-sm transition-colors',
            language === code
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground'
          )}
          title={info.name}
        >
          <span className="mr-1">{flags[code]}</span>
          <span className="hidden sm:inline">{info.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
