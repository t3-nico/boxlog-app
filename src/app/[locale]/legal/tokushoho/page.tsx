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
    title: `${t('legal.tokushoho.title')} - BoxLog`,
    description: t('legal.tokushoho.description'),
  }
}

interface PageProps {
  params: Promise<{ locale?: Locale }>
}

/**
 * 特定商取引法に基づく表記ページ（Server Component）
 */
export default async function TokushohoPage({ params }: PageProps) {
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  const lastUpdated = '2025-12-07'

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('legal.tokushoho.title')}</h1>
        <p className="text-muted-foreground">{t('legal.tokushoho.description')}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('legal.lastUpdated')}: {lastUpdated}
        </p>
      </div>

      {/* 注意書き（要入力項目あり） */}
      <div className="bg-warning/15 border-warning mb-8 rounded-xl border-2 border-dashed p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <p className="text-warning-foreground font-semibold">{t('legal.tokushoho.setupNotice.title')}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t('legal.tokushoho.setupNotice.description')}</p>
          </div>
        </div>
      </div>

      {/* 表形式での表記 */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <table className="w-full">
          <tbody className="divide-border divide-y">
            {/* 販売業者 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.seller.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <span className="bg-warning/20 text-warning-foreground rounded px-2 py-1 text-xs font-medium">
                  {t('legal.tokushoho.placeholder')}
                </span>
                <span className="text-muted-foreground ml-2 text-xs">{t('legal.tokushoho.items.seller.hint')}</span>
              </td>
            </tr>

            {/* 代表者 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.representative.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <span className="bg-warning/20 text-warning-foreground rounded px-2 py-1 text-xs font-medium">
                  {t('legal.tokushoho.placeholder')}
                </span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {t('legal.tokushoho.items.representative.hint')}
                </span>
              </td>
            </tr>

            {/* 所在地 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.address.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <span className="bg-warning/20 text-warning-foreground rounded px-2 py-1 text-xs font-medium">
                  {t('legal.tokushoho.placeholder')}
                </span>
                <span className="text-muted-foreground ml-2 text-xs">{t('legal.tokushoho.items.address.hint')}</span>
              </td>
            </tr>

            {/* 連絡先 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.contact.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">Email:</span> support@boxlog.app
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t('legal.tokushoho.items.contact.phoneLabel')}:</span>{' '}
                    <span className="bg-warning/20 text-warning-foreground rounded px-2 py-1 text-xs font-medium">
                      {t('legal.tokushoho.placeholder')}
                    </span>
                  </p>
                </div>
              </td>
            </tr>

            {/* 販売価格 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.price.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">{t('legal.tokushoho.items.price.content')}</td>
            </tr>

            {/* 支払方法 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.payment.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <ul className="list-inside list-disc space-y-1">
                  <li>{t('legal.tokushoho.items.payment.creditCard')}</li>
                </ul>
              </td>
            </tr>

            {/* 支払時期 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.paymentTiming.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">{t('legal.tokushoho.items.paymentTiming.content')}</td>
            </tr>

            {/* サービス提供時期 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.delivery.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">{t('legal.tokushoho.items.delivery.content')}</td>
            </tr>

            {/* キャンセル・返金 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.cancellation.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <ul className="list-inside list-disc space-y-1">
                  <li>{t('legal.tokushoho.items.cancellation.anytime')}</li>
                  <li>{t('legal.tokushoho.items.cancellation.noRefund')}</li>
                  <li>{t('legal.tokushoho.items.cancellation.access')}</li>
                </ul>
              </td>
            </tr>

            {/* 動作環境 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.environment.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <ul className="list-inside list-disc space-y-1">
                  <li>{t('legal.tokushoho.items.environment.browser')}</li>
                  <li>{t('legal.tokushoho.items.environment.internet')}</li>
                </ul>
              </td>
            </tr>

            {/* 特記事項 */}
            <tr>
              <th className="bg-surface-container text-foreground w-1/3 px-6 py-4 text-left text-sm font-semibold">
                {t('legal.tokushoho.items.notes.label')}
              </th>
              <td className="text-foreground px-6 py-4 text-sm">
                <ul className="list-inside list-disc space-y-1">
                  <li>{t('legal.tokushoho.items.notes.autoRenewal')}</li>
                  <li>{t('legal.tokushoho.items.notes.priceChange')}</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 法的レビュー警告 */}
      <div className="bg-destructive/10 border-destructive mt-8 rounded-xl border-2 p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-destructive font-bold">{t('legal.reviewWarning.title')}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t('legal.reviewWarning.description')}</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-sm">
              <li>{t('legal.reviewWarning.items.lawyer')}</li>
              <li>{t('legal.reviewWarning.items.update')}</li>
              <li>{t('legal.reviewWarning.items.placeholder')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
