'use client'

import { useCallback, useState } from 'react'

import { ChevronDownIcon, GlobeIcon } from 'lucide-react'

import { useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface LanguageOption {
  code: Locale
  name: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

interface LanguageSwitcherProps {
  currentLocale: Locale
  dictionary: Record<string, unknown>
}

interface LanguageDictionary {
  language?: {
    switch?: string
    current?: string
  }
}

export function LanguageSwitcher({ currentLocale, dictionary }: LanguageSwitcherProps) {
  const typedDictionary = dictionary as LanguageDictionary
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) ??
    languages[0] ?? { code: 'en' as Locale, name: 'English', flag: '🇺🇸' }

  const switchLanguage = useCallback(
    (locale: Locale): void => {
      // next-intl's router handles locale switching and cookie storage automatically
      const currentPath = window.location.pathname
      const newPath = currentPath.replace(/^\/[a-z]{2}(\/|$)/, `/${locale}$1`)

      router.push(newPath)
      setIsOpen(false)
    },
    [router]
  )

  // jsx-no-bind optimization: Toggle dropdown
  const handleToggleDropdown = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  // jsx-no-bind optimization: Close dropdown
  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  // jsx-no-bind optimization: Escape key handler
  const handleEscapeKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  // jsx-no-bind optimization: Language switch handler creator
  const createLanguageSwitchHandler = useCallback(
    (locale: Locale) => {
      return () => switchLanguage(locale)
    },
    [switchLanguage]
  )

  return (
    <div className="relative">
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={handleToggleDropdown}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200',
          'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100',
          'hover:bg-neutral-300 hover:dark:bg-neutral-600',
          'focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 focus:outline-none'
        )}
        aria-label={typedDictionary?.language?.switch || 'Switch Language'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <GlobeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen ? (
        <>
          {/* オーバーレイ（外側クリックで閉じる） */}
          <div
            className="fixed inset-0 z-10"
            onClick={handleCloseDropdown}
            onKeyDown={handleEscapeKey}
            role="button"
            tabIndex={-1}
            aria-hidden="true"
          />

          {/* メニュー */}
          <div
            className={cn(
              'absolute right-0 z-20 mt-2 w-48 rounded-md border py-2 shadow-lg',
              'border-border bg-popover',
              'transition-all duration-200'
            )}
            role="listbox"
            aria-label={typedDictionary?.language?.current || 'Current Language'}
          >
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={createLanguageSwitchHandler(language.code)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150',
                  'focus:outline-none',
                  language.code === currentLocale
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-state-hover focus:bg-secondary/80'
                )}
                role="option"
                aria-selected={language.code === currentLocale}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-base">{language.name}</span>
                {language.code === currentLocale && <span className="ml-auto text-sm opacity-75">✓</span>}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
