import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'
import type { Metadata } from 'next'
import { CookieSettingsForm } from './cookie-settings-form'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Cookie Settings - BoxLog',
    description: 'Manage your cookie preferences for BoxLog',
  }
}

interface PageProps {
  params: Promise<{ locale?: Locale }>
}

export default async function CookieSettingsPage({ params }: PageProps) {
  const { locale = 'ja' } = await params
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

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
      <div className="bg-muted/50 mt-8 rounded-lg p-6">
        <p
          className="text-muted-foreground text-sm"
          dangerouslySetInnerHTML={{ __html: t('legal.cookies.page.browserWarning') }}
        />
      </div>
    </div>
  )
}
