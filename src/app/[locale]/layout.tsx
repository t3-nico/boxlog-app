import type { Metadata } from 'next'

import { createTranslation, defaultLocale, getDictionary, locales } from '@/lib/i18n'
import { getDirection } from '@/lib/i18n/rtl'
import type { Locale } from '@/types/i18n'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

// 動的メタデータ生成
export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const validLocale = locales.includes(locale) ? locale : defaultLocale
  const dictionary = await getDictionary(validLocale)
  const t = createTranslation(dictionary)

  // 代替言語URLの生成
  const alternateLanguages: Record<string, string> = {}
  locales.forEach((lang) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}`
    alternateLanguages[lang as keyof typeof alternateLanguages] = url
  })

  return {
    title: {
      template: `%s - ${t('app.name')}`,
      default: t('app.name'),
    },
    description: t('app.description'),
    keywords: [
      'BoxLog',
      'task management',
      'productivity',
      'calendar',
      'project management',
      validLocale === 'ja' ? 'タスク管理' : '',
      validLocale === 'ja' ? '生産性向上' : '',
      validLocale === 'ja' ? 'プロジェクト管理' : '',
    ].filter(Boolean),
    authors: [{ name: 'BoxLog Team' }],
    creator: 'BoxLog',
    publisher: 'BoxLog',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: validLocale,
      alternateLocale: locales.filter((l) => l !== validLocale),
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${validLocale}`,
      siteName: t('app.name'),
      title: t('app.name'),
      description: t('app.description'),
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('app.name'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@boxlog',
      creator: '@boxlog',
      title: t('app.name'),
      description: t('app.description'),
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${validLocale}`,
      languages: alternateLanguages,
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    },
  }
}

// 静的生成用の言語パラメータ
export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }))
}

// 言語特化レイアウト（HTMLタグなし - ルートレイアウトで定義済み）
export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // 不正な言語の場合、デフォルト言語にフォールバック
  const validLocale = locales.includes(locale) ? locale : defaultLocale
  const direction = getDirection(validLocale)

  return (
    <div data-locale={validLocale} data-direction={direction}>
      {children}
    </div>
  )
}
