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
    title: `${t('legal.terms.title')} - BoxLog`,
    description: t('legal.terms.description'),
  }
}

interface PageProps {
  params: Promise<{ locale?: Locale }>
}

/**
 * 利用規約ページ（Server Component）
 */
export default async function TermsOfServicePage({ params }: PageProps) {
  // i18n翻訳取得（URLからロケール取得、デフォルトはja）
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  // 最終更新日（実際のプロジェクトでは、CMSや設定ファイルから取得）
  const lastUpdated = '2025-10-15'

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('legal.terms.title')}</h1>
        <p className="text-muted-foreground">{t('legal.terms.description')}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('legal.lastUpdated')}: {lastUpdated}
        </p>
      </div>

      {/* コンテンツ */}
      <div className="space-y-8">
        {/* 1. はじめに */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.introduction.title')}</h2>
          <p className="text-foreground leading-relaxed">{t('legal.terms.sections.introduction.content')}</p>
        </section>

        {/* 2. サービス内容 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.serviceDescription.title')}</h2>
          <p className="text-foreground leading-relaxed">{t('legal.terms.sections.serviceDescription.content')}</p>
        </section>

        {/* 3. アカウント登録 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.accountRegistration.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.accountRegistration.requirements')}</li>
            <li>{t('legal.terms.sections.accountRegistration.responsibility')}</li>
            <li>{t('legal.terms.sections.accountRegistration.security')}</li>
            <li>{t('legal.terms.sections.accountRegistration.age')}</li>
          </ul>
        </section>

        {/* 4. ユーザーの責任 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.userResponsibilities.title')}</h2>
          <p className="text-foreground mb-3 leading-relaxed">{t('legal.terms.sections.userResponsibilities.intro')}</p>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.userResponsibilities.illegal')}</li>
            <li>{t('legal.terms.sections.userResponsibilities.harmful')}</li>
            <li>{t('legal.terms.sections.userResponsibilities.unauthorized')}</li>
            <li>{t('legal.terms.sections.userResponsibilities.impersonation')}</li>
            <li>{t('legal.terms.sections.userResponsibilities.spam')}</li>
            <li>{t('legal.terms.sections.userResponsibilities.content')}</li>
          </ul>
        </section>

        {/* 5. 知的財産権 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.intellectualProperty.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.intellectualProperty.ownership')}</li>
            <li>{t('legal.terms.sections.intellectualProperty.userContent')}</li>
            <li>{t('legal.terms.sections.intellectualProperty.license')}</li>
          </ul>
        </section>

        {/* 6. データのバックアップ */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.dataBackup.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.dataBackup.responsibility')}</li>
            <li>{t('legal.terms.sections.dataBackup.liability')}</li>
          </ul>
        </section>

        {/* 7. 免責事項 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.disclaimer.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.disclaimer.availability')}</li>
            <li>{t('legal.terms.sections.disclaimer.interruption')}</li>
            <li>{t('legal.terms.sections.disclaimer.damages')}</li>
            <li>{t('legal.terms.sections.disclaimer.thirdParty')}</li>
          </ul>
        </section>

        {/* 8. アカウント停止・削除 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.termination.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.termination.userInitiated')}</li>
            <li>{t('legal.terms.sections.termination.serviceInitiated')}</li>
            <li>{t('legal.terms.sections.termination.dataRetention')}</li>
          </ul>
        </section>

        {/* 9. 規約の変更 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.modifications.title')}</h2>
          <p className="text-foreground leading-relaxed">{t('legal.terms.sections.modifications.content')}</p>
        </section>

        {/* 10. 準拠法・管轄裁判所 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.governingLaw.title')}</h2>
          <ul className="text-foreground list-inside list-disc space-y-2 leading-relaxed">
            <li>{t('legal.terms.sections.governingLaw.law')}</li>
            <li>{t('legal.terms.sections.governingLaw.jurisdiction')}</li>
          </ul>
        </section>

        {/* 11. お問い合わせ */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{t('legal.terms.sections.contact.title')}</h2>
          <p className="text-foreground mb-4 leading-relaxed">{t('legal.terms.sections.contact.content')}</p>
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
