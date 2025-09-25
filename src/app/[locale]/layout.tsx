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
    alternateLanguages[lang] = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}`
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

// 言語特化レイアウト
export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // 不正な言語の場合、デフォルト言語にフォールバック
  const validLocale = locales.includes(locale) ? locale : defaultLocale
  const direction = getDirection(validLocale)

  // hreflang用の代替言語リンク生成
  const alternateLinks = locales.map((lang) => ({
    hrefLang: lang,
    href: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}`,
  }))

  return (
    <html lang={validLocale} dir={direction}>
      <head>
        {/* hreflang代替言語リンク */}
        {alternateLinks.map(({ hrefLang, href }) => (
          <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
        ))}
        {/* x-default for international targeting */}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${defaultLocale}`}
        />
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* 言語情報をクライアントコンポーネントに提供 */}
        <div data-locale={validLocale} data-direction={direction}>
          {children}
        </div>
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'BoxLog',
              description: 'Comprehensive task management and productivity application',
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web Browser',
              inLanguage: locales,
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
