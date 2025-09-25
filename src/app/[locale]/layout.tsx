import type { Metadata } from 'next'

import { createTranslation, getDictionary, locales } from '@/lib/i18n'
import { getDirection } from '@/lib/i18n/rtl'
import type { Locale } from '@/types/i18n'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

// 動的メタデータ生成
export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary)

  return {
    title: {
      template: `%s - ${t('app.name')}`,
      default: t('app.name'),
    },
    description: t('app.description'),
    other: {
      language: locale,
    },
  }
}

// 静的生成用の言語パラメータ
export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }))
}

// 言語特化レイアウト
export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // 不正な言語の場合、デフォルト言語にフォールバック
  const validLocale = locales.includes(locale) ? locale : 'en'
  const direction = getDirection(validLocale)

  return (
    <html lang={validLocale} dir={direction}>
      <body>
        {/* 言語情報をクライアントコンポーネントに提供 */}
        <div data-locale={validLocale} data-direction={direction}>
          {children}
        </div>
      </body>
    </html>
  )
}
