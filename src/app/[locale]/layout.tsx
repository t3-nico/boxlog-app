import type { Metadata } from 'next'
import Script from 'next/script'

import { createTranslation, defaultLocale, getDictionary, locales } from '@/features/i18n/lib'
import { getDirection } from '@/features/i18n/lib/rtl'
import type { Locale } from '@/types/i18n'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}

// 動的メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
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

// JSON-LD構造化データ（SEO改善）
function generateJsonLd(locale: Locale, appName: string, appDescription: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: appName,
    description: appDescription,
    url: `${baseUrl}/${locale}`,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    screenshot: {
      '@type': 'ImageObject',
      url: `${baseUrl}/og-image.png`,
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Organization',
      name: 'BoxLog',
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
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  // 不正な言語の場合、デフォルト言語にフォールバック
  const validLocale = locales.includes(locale) ? locale : defaultLocale
  const direction = getDirection(validLocale)
  const dictionary = await getDictionary(validLocale)
  const t = createTranslation(dictionary)

  // JSON-LD構造化データ
  const jsonLd = generateJsonLd(validLocale, t('app.name'), t('app.description'))

  return (
    <div data-locale={validLocale} data-direction={direction}>
      {/* SEO: JSON-LD構造化データ */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      {children}
    </div>
  )
}
