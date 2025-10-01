'use client'

import { useCallback, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { Check, ChevronDown, Globe } from 'lucide-react'

import { colors, typography } from '@/config/ui/theme'
import { getAccessibilityLabels } from '@/lib/accessibility'
import { locales, setLocaleCookie } from '@/lib/i18n'
import { useCurrentLocale } from '@/lib/i18n/hooks'
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
  const [isOpen, setIsOpen] = useState(false)
  const currentLocale = useCurrentLocale()
  const pathname = usePathname()
  const router = useRouter()

  const a11yLabels = getAccessibilityLabels(currentLocale)
  const currentOption = languageOptions.find((option) => option.code === currentLocale) || languageOptions[0]

  const handleLanguageChange = useCallback(
    (newLocale: Locale) => {
      // Cookie に言語設定を保存
      setLocaleCookie(newLocale)

      // 現在のパスから言語プレフィックスを取得
      const segments = (pathname || '/').split('/')
      const currentLocaleFromPath = locales.find((locale) => segments[1] === locale)

      let newPathname: string
      if (currentLocaleFromPath) {
        // 既存の言語プレフィックスを置換
        segments[1] = newLocale
        newPathname = segments.join('/')
      } else {
        // 言語プレフィックスを追加
        newPathname = `/${newLocale}${pathname}`
      }

      setIsOpen(false)
      router.push(newPathname)
      router.refresh()
    },
    [pathname, router]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, locale: Locale) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleLanguageChange(locale)
      }
    },
    [handleLanguageChange]
  )

  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          onClick={toggleDropdown}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          className={cn(
            'flex items-center gap-2 rounded-lg p-2 transition-colors',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
          aria-label={a11yLabels.languageSwitch}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="h-4 w-4" />
          {variant === 'full' && (
            <>
              <span className="text-sm">{currentOption.nativeName}</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>

        {isOpen ? (
          <>
            {/* オーバーレイ */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
              tabIndex={-1}
              aria-hidden="true"
            />

            {/* ドロップダウンメニュー */}
            <div
              role="listbox"
              aria-label={a11yLabels.languageSwitch}
              className={cn(
                'absolute right-0 top-full z-20 mt-2 min-w-48 overflow-hidden',
                'bg-white dark:bg-neutral-800',
                'border-neutral-200 dark:border-neutral-700 rounded-lg border shadow-lg'
              )}
            >
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  role="option"
                  aria-selected={option.code === currentLocale}
                  onClick={() => handleLanguageChange(option.code)}
                  onKeyDown={(e) => handleKeyDown(e, option.code)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 focus:outline-none',
                    option.code === currentLocale && 'bg-blue-50 dark:bg-blue-900/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" role="img" aria-hidden="true">
                      {option.flag}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{option.nativeName}</div>
                      {option.nativeName !== option.name && <div className="text-xs text-neutral-600 dark:text-neutral-400">{option.name}</div>}
                    </div>
                  </div>
                  {option.code === currentLocale && <Check className="text-primary h-4 w-4" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
          colors.background.hover,
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
        aria-label={a11yLabels.languageSwitch}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg" role="img" aria-hidden="true">
          {currentOption.flag}
        </span>
        <span className={typography.body.sm}>{currentOption.nativeName}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          <div
            role="listbox"
            className={cn(
              'absolute left-0 top-full z-20 mt-2 min-w-full overflow-hidden',
              colors.background.surface,
              'border-border rounded-lg border shadow-lg'
            )}
          >
            {languageOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={option.code === currentLocale}
                onClick={() => handleLanguageChange(option.code)}
                onKeyDown={(e) => handleKeyDown(e, option.code)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-accent focus:bg-accent focus:outline-none',
                  option.code === currentLocale && colors.primary.light
                )}
              >
                <span className="text-lg" role="img" aria-hidden="true">
                  {option.flag}
                </span>
                <div className="flex-1">
                  <div className={cn(typography.body.sm, 'font-medium')}>{option.nativeName}</div>
                  {option.nativeName !== option.name && (
                    <div className={cn(typography.body.xs, 'text-muted-foreground')}>{option.name}</div>
                  )}
                </div>
                {option.code === currentLocale && <Check className="text-primary h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
