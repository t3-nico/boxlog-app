'use client'

import { useCallback } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { Menu } from '@headlessui/react'
import { Check, ChevronDown, Globe } from 'lucide-react'

import { locales, setLocaleCookie } from '@/features/i18n/lib'
import { useCurrentLocale } from '@/features/i18n/lib/hooks'
import { getAccessibilityLabels } from '@/lib/accessibility'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types/i18n'

interface LanguageOption {
  code: Locale
  name: string
  nativeName: string
  flag: string
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
]

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full'
  className?: string
}

export const LanguageSwitcher = ({ variant = 'compact', className }: LanguageSwitcherProps) => {
  const currentLocale = useCurrentLocale()
  const pathname = usePathname()
  const router = useRouter()

  const a11yLabels = getAccessibilityLabels(currentLocale)
  const currentOption = languageOptions.find((option) => option.code === currentLocale) ?? languageOptions[0]

  const handleLanguageChange = useCallback(
    (newLocale: Locale) => {
      setLocaleCookie(newLocale)

      const segments = (pathname || '/').split('/')
      const currentLocaleFromPath = locales.find((locale) => segments[1] === locale)

      let newPathname: string
      if (currentLocaleFromPath) {
        segments[1] = newLocale
        newPathname = segments.join('/')
      } else {
        newPathname = `/${newLocale}${pathname}`
      }

      router.push(newPathname)
      router.refresh()
    },
    [pathname, router]
  )

  return (
    <Menu as="div" className={cn('relative', className)}>
      <Menu.Button
        className={cn(
          'flex items-center gap-2 rounded-lg p-2 transition-colors',
          'hover:bg-neutral-200 dark:hover:bg-neutral-700',
          'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
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
          'bg-white dark:bg-neutral-800',
          'rounded-lg border border-neutral-200 shadow-lg dark:border-neutral-700',
          'focus:outline-none'
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
                  active && 'bg-neutral-100 dark:bg-neutral-700',
                  option.code === currentLocale && 'bg-blue-50 dark:bg-blue-900/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" role="img" aria-label={option.name}>
                    {option.flag}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {option.nativeName}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{option.name}</span>
                  </div>
                </div>
                {option.code === currentLocale && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  )
}
