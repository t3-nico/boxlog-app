'use client';

import { useCallback } from 'react';

import { Menu } from '@headlessui/react';
import { Check, ChevronDown, Globe } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getAccessibilityLabels } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface LanguageOption {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
];

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSwitcher = ({ variant = 'compact', className }: LanguageSwitcherProps) => {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const a11yLabels = getAccessibilityLabels(currentLocale);
  const currentOption =
    languageOptions.find((option) => option.code === currentLocale) ?? languageOptions[0];

  const handleLanguageChange = useCallback(
    (newLocale: Locale) => {
      // next-intl's router handles locale switching automatically
      // It will update the cookie and navigate to the new locale path
      const segments = (pathname || '/').split('/');
      const currentLocaleFromPath = routing.locales.find((locale) => segments[1] === locale);

      let newPathname: string;
      if (currentLocaleFromPath) {
        segments[1] = newLocale;
        newPathname = segments.join('/');
      } else {
        newPathname = `/${newLocale}${pathname}`;
      }

      router.push(newPathname);
      router.refresh();
    },
    [pathname, router],
  );

  return (
    <Menu as="div" className={cn('relative', className)}>
      <Menu.Button
        className={cn(
          'flex items-center gap-2 rounded-lg p-2 transition-colors',
          'hover:bg-state-hover',
          'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
        )}
        aria-label={a11yLabels.languageSwitch}
      >
        <Globe className="h-4 w-4" />
        {variant === 'full' && (
          <>
            <span className="text-sm">{currentOption?.nativeName}</span>
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </Menu.Button>

      <Menu.Items
        className={cn(
          'absolute top-full right-0 z-20 mt-2 min-w-48 overflow-hidden',
          'bg-popover text-popover-foreground',
          'border-border rounded-lg border shadow-lg',
          'focus:outline-none',
        )}
      >
        {languageOptions.map((option) => (
          <Menu.Item key={option.code}>
            {({ active }) => (
              <button
                type="button"
                onClick={() => handleLanguageChange(option.code)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                  active && 'bg-surface-container',
                  option.code === currentLocale && 'bg-surface-container',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" role="img" aria-label={option.name}>
                    {option.flag}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-foreground text-sm font-medium">{option.nativeName}</span>
                    <span className="text-muted-foreground text-xs">{option.name}</span>
                  </div>
                </div>
                {option.code === currentLocale && <Check className="text-primary h-4 w-4" />}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};
