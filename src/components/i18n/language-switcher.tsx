'use client'

import { useState } from 'react'

import { useRouter } from 'next/router'

import { ChevronDownIcon, GlobeIcon } from 'lucide-react'
import { useTranslation } from 'next-i18next'

import { animations, colors, rounded, spacing, typography } from '@/config/theme'
import type { Locale } from '@/types/i18n'

// テーマから色とスタイルを取得

interface LanguageOption {
  code: Locale
  name: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === router.locale) || languages[0]

  const switchLanguage = async (locale: Locale) => {
    // 言語をクッキーに保存
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`

    // URLを変更して言語を切り替え
    await router.push(router.asPath, router.asPath, { locale })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* トリガーボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${colors.surface.secondary} ${colors.text.primary} hover:${colors.surface.tertiary} focus:ring-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${spacing.padding.sm} ${rounded.component.button.sm} `}
        aria-label={t('language.switch')}
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
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* メニュー */}
          <div
            className={`absolute right-0 mt-2 w-48 py-2 ${colors.background.elevated} ${colors.border.primary} z-20 rounded-md border shadow-lg ${rounded.component.menu} ${animations.transitions.smooth} `}
            role="listbox"
            aria-label={t('language.current')}
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => switchLanguage(language.code)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150 ${
                  language.code === router.locale
                    ? `${colors.primary.DEFAULT} text-white`
                    : `${colors.text.primary} hover:${colors.surface.secondary}`
                } focus:outline-none focus:${colors.surface.secondary} `}
                role="option"
                aria-selected={language.code === router.locale}
              >
                <span className="text-lg">{language.flag}</span>
                <span className={typography.body.base}>{language.name}</span>
                {language.code === router.locale && <span className="ml-auto text-sm opacity-75">✓</span>}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default LanguageSwitcher
