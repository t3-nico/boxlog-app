import type { Locale } from '@/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

/**
 * メタデータ生成（SEO対策・i18n対応）
 */
export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  return {
    title: `${t('legal.privacy.title')} - BoxLog`,
    description: t('legal.privacy.description'),
  }
}

interface PageProps {
  params: Promise<{ locale?: Locale }>
}

/**
 * プライバシーポリシーページ（Server Component）
 */
export default async function PrivacyPolicyPage({ params }: PageProps) {
  // i18n翻訳取得（URLからロケール取得、デフォルトはja）
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  // 最終更新日（実際のプロジェクトでは、CMSや設定ファイルから取得）
  const lastUpdated = '2025-10-15'

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('legal.privacy.title')}</h1>
        <p className="text-muted-foreground">{t('legal.privacy.description')}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('legal.lastUpdated')}: {lastUpdated}
        </p>
      </div>

      {/* コンテンツ */}
      <div className="space-y-8">
        {/* 1. はじめに */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.introduction.title')}</h2>
          <p className="text-foreground leading-relaxed">{t('legal.privacy.sections.introduction.content')}</p>
        </section>

        {/* 2. 収集する情報 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.dataCollection.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.dataCollection.accountInfo')}</li>
            <li>{t('legal.privacy.sections.dataCollection.usageData')}</li>
            <li>{t('legal.privacy.sections.dataCollection.technicalData')}</li>
            <li>{t('legal.privacy.sections.dataCollection.cookies')}</li>
          </ul>
        </section>

        {/* 3. 情報の利用目的 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.dataUsage.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.dataUsage.serviceProvision')}</li>
            <li>{t('legal.privacy.sections.dataUsage.userSupport')}</li>
            <li>{t('legal.privacy.sections.dataUsage.security')}</li>
            <li>{t('legal.privacy.sections.dataUsage.analytics')}</li>
            <li>{t('legal.privacy.sections.dataUsage.communication')}</li>
          </ul>
        </section>

        {/* 4. 第三者提供 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.dataSharing.title')}</h2>
          <p className="text-foreground mb-3 leading-relaxed">{t('legal.privacy.sections.dataSharing.intro')}</p>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.dataSharing.supabase')}</li>
            <li>{t('legal.privacy.sections.dataSharing.vercel')}</li>
            <li>{t('legal.privacy.sections.dataSharing.sentry')}</li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm">{t('legal.privacy.sections.dataSharing.note')}</p>
        </section>

        {/* 5. データ保持期間 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.dataRetention.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.dataRetention.active')}</li>
            <li>{t('legal.privacy.sections.dataRetention.deleted')}</li>
            <li>{t('legal.privacy.sections.dataRetention.legal')}</li>
          </ul>
        </section>

        {/* 6. ユーザーの権利 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.userRights.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.userRights.access')}</li>
            <li>{t('legal.privacy.sections.userRights.correction')}</li>
            <li>{t('legal.privacy.sections.userRights.deletion')}</li>
            <li>{t('legal.privacy.sections.userRights.portability')}</li>
            <li>{t('legal.privacy.sections.userRights.objection')}</li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm">{t('legal.privacy.sections.userRights.contact')}</p>
        </section>

        {/* 7. セキュリティ対策 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.security.title')}</h2>
          <p className="text-foreground mb-3 leading-relaxed">{t('legal.privacy.sections.security.measures')}</p>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.security.encryption')}</li>
            <li>{t('legal.privacy.sections.security.access')}</li>
            <li>{t('legal.privacy.sections.security.monitoring')}</li>
          </ul>
        </section>

        {/* 8. Cookieについて */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.cookies.title')}</h2>
          <p className="text-foreground mb-3 leading-relaxed">{t('legal.privacy.sections.cookies.intro')}</p>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.privacy.sections.cookies.essential')}</li>
            <li>{t('legal.privacy.sections.cookies.analytics')}</li>
            <li>{t('legal.privacy.sections.cookies.preference')}</li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm">{t('legal.privacy.sections.cookies.control')}</p>
        </section>

        {/* 9. 未成年者について */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.children.title')}</h2>
          <p className="text-foreground leading-relaxed">{t('legal.privacy.sections.children.content')}</p>
        </section>

        {/* 10. ポリシーの変更 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.changes.title')}</h2>
          <p className="text-foreground leading-relaxed">{t('legal.privacy.sections.changes.content')}</p>
        </section>

        {/* 11. お問い合わせ */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.privacy.sections.contact.title')}</h2>
          <p className="text-foreground mb-4 leading-relaxed">{t('legal.privacy.sections.contact.content')}</p>
          <div className="bg-surface-container rounded-xl p-4">
            <p className="text-foreground">
              <strong>Email:</strong> {t('legal.contact.email')}
            </p>
            <p className="text-foreground">
              <strong>Website:</strong> {t('legal.contact.website')}
            </p>
          </div>
        </section>
      </div>

      {/* 法的レビュー警告 */}
      <div className="bg-destructive/10 border-destructive mt-12 rounded-xl border-2 p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-destructive font-bold">{t('legal.reviewWarning.title')}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t('legal.reviewWarning.description')}</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-sm">
              <li>{t('legal.reviewWarning.items.lawyer')}</li>
              <li>{t('legal.reviewWarning.items.update')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
