import type { Locale } from '@/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CookieSettingsForm } from './cookie-settings-form'

/**
 * メタデータ生成（SEO対策・i18n対応）
 */
export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  return {
    title: `${t('legal.cookies.page.title')} - BoxLog`,
    description: t('legal.cookies.page.description'),
  }
}

interface PageProps {
  params: Promise<{ locale?: Locale }>
}

export default async function CookieSettingsPage({ params }: PageProps) {
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('legal.cookies.page.title')}</h1>
        <p className="text-muted-foreground">{t('legal.cookies.page.description')}</p>
      </div>

      {/* Cookie概要 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('legal.cookies.page.whatAreCookies.title')}</h2>
        <p className="text-foreground leading-relaxed">{t('legal.cookies.page.whatAreCookies.content')}</p>
      </section>

      {/* Cookieの使用目的 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('legal.cookies.page.howWeUse.title')}</h2>
        <p className="text-foreground mb-4 leading-relaxed">{t('legal.cookies.page.howWeUse.content')}</p>
        <ul className="text-foreground list-inside list-disc space-y-2 pl-4">
          <li>{t('legal.cookies.page.howWeUse.purposes.authentication')}</li>
          <li>{t('legal.cookies.page.howWeUse.purposes.preferences')}</li>
          <li>{t('legal.cookies.page.howWeUse.purposes.analytics')}</li>
          <li>{t('legal.cookies.page.howWeUse.purposes.security')}</li>
        </ul>
      </section>

      {/* Cookie設定フォーム（Client Component） */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('legal.cookies.settings.title')}</h2>
        <p className="text-muted-foreground mb-6">{t('legal.cookies.settings.description')}</p>
        <CookieSettingsForm />
      </section>

      {/* Cookie管理方法 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('legal.cookies.page.manageCookies.title')}</h2>
        <p className="text-foreground leading-relaxed">{t('legal.cookies.page.manageCookies.content')}</p>
      </section>

      {/* 注意事項 */}
      <div className="bg-surface-container mt-8 rounded-xl p-6">
        <p
          className="text-muted-foreground text-sm"
          dangerouslySetInnerHTML={{ __html: t('legal.cookies.page.browserWarning') }}
        />
      </div>
    </div>
  )
}
