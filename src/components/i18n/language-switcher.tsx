'use client'

import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { ChevronDownIcon, GlobeIcon } from 'lucide-react'

import { animations, colors, rounded, spacing, typography } from '@/config/theme'
import { setLocaleCookie } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'

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

export function LanguageSwitcher({ currentLocale, dictionary }: LanguageSwitcherProps) {
  const router = useRouter()
  const _params = useParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0]

  const switchLanguage = (locale: Locale): void => {
    // 言語をクッキーに保存
    setLocaleCookie(locale)

    // 現在のパスを新しい言語でナビゲート
    const currentPath = window.location.pathname
    const newPath = currentPath.replace(/^\/[a-z]{2}(\/|$)/, `/${locale}$1`)

    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${colors.surface.secondary} ${colors.text.primary} hover:${colors.surface.tertiary} focus:ring-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${spacing.padding.sm} ${rounded.component.button.sm} `}
        aria-label={dictionary?.language?.switch || 'Switch Language'}
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
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            role="button"
            tabIndex={-1}
            aria-hidden="true"
          />

          {/* メニュー */}
          <div
            className={`absolute right-0 mt-2 w-48 py-2 ${colors.background.elevated} ${colors.border.primary} z-20 rounded-md border shadow-lg ${rounded.component.menu} ${animations.transitions.smooth} `}
            role="listbox"
            aria-label={dictionary?.language?.current || 'Current Language'}
          >
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => switchLanguage(language.code)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150 ${
                  language.code === currentLocale
                    ? `${colors.primary.DEFAULT} text-white`
                    : `${colors.text.primary} hover:${colors.surface.secondary}`
                } focus:outline-none focus:${colors.surface.secondary} `}
                role="option"
                aria-selected={language.code === currentLocale}
              >
                <span className="text-lg">{language.flag}</span>
                <span className={typography.body.base}>{language.name}</span>
                {language.code === currentLocale && <span className="ml-auto text-sm opacity-75">✓</span>}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default LanguageSwitcher
