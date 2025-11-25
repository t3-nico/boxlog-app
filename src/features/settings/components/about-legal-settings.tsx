'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/features/i18n/lib/hooks'
import { getCookieConsent, setCookieConsent as saveCookieConsent, type CookieConsent } from '@/lib/cookie-consent'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

/**
 * Legal設定ページコンポーネント
 *
 * 機能：
 * - Cookie設定の現在の状況表示
 * - /legal/cookiesへのリンク（詳細設定）
 * - 法的文書リンク集
 *
 * UX:
 * - ログイン後のユーザーが設定を見つけやすい
 * - Cookie設定の状況が一目で分かる
 * - 主要な法的文書に素早くアクセス可能
 */
export function AboutLegalSettings() {
  const { t, locale } = useI18n()
  const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // クライアントサイドでのみ実行
    setIsClient(true)
    setCookieConsent(getCookieConsent())

    // Cookie設定変更イベントをリッスン
    const handleCookieConsentChange = (event: CustomEvent<CookieConsent | null>) => {
      setCookieConsent(event.detail)
    }

    window.addEventListener('cookieConsentChanged', handleCookieConsentChange as EventListener)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleCookieConsentChange as EventListener)
    }
  }, [])

  // Cookie設定変更ハンドラー（localStorageに保存 + CustomEvent発火）
  const handleAnalyticsChange = (checked: boolean) => {
    saveCookieConsent({
      analytics: checked,
      marketing: cookieConsent?.marketing ?? false,
    })
  }

  const handleMarketingChange = (checked: boolean) => {
    saveCookieConsent({
      analytics: cookieConsent?.analytics ?? false,
      marketing: checked,
    })
  }

  // SSR時は何も表示しない
  if (!isClient) {
    return null
  }

  return (
    <FieldSet>
      {/* Cookie設定セクション */}
      <FieldGroup>
        <FieldLegend>{t('settings.legal.cookies.title')}</FieldLegend>
        <FieldDescription>{t('settings.legal.cookies.description')}</FieldDescription>

        {/* 現在の設定状況 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t('settings.legal.cookies.current.title')}</h4>

          {/* 必須Cookie */}
          <Field orientation="horizontal">
            <FieldLabel>{t('settings.legal.cookies.current.necessary')}</FieldLabel>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {t('settings.legal.cookies.current.necessaryStatus')}
            </Badge>
          </Field>

          {/* 分析Cookie */}
          <Field orientation="horizontal">
            <FieldLabel htmlFor="analytics-switch">{t('settings.legal.cookies.current.analytics')}</FieldLabel>
            <Switch
              id="analytics-switch"
              checked={cookieConsent?.analytics ?? false}
              onCheckedChange={handleAnalyticsChange}
              aria-label={t('settings.legal.cookies.current.analytics')}
            />
          </Field>

          {/* マーケティングCookie */}
          <Field orientation="horizontal">
            <FieldLabel htmlFor="marketing-switch">{t('settings.legal.cookies.current.marketing')}</FieldLabel>
            <Switch
              id="marketing-switch"
              checked={cookieConsent?.marketing ?? false}
              onCheckedChange={handleMarketingChange}
              aria-label={t('settings.legal.cookies.current.marketing')}
            />
          </Field>

          {/* 最終更新日時 */}
          {cookieConsent?.timestamp && (
            <p className="text-muted-foreground text-xs">
              {t('settings.legal.cookies.lastUpdated')}:{' '}
              {new Date(cookieConsent.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}
            </p>
          )}
        </div>

        {/* Cookie設定ページへのリンク */}
        <Button asChild variant="outline" className="w-full">
          <Link href={`/${locale}/legal/cookies`}>
            {t('settings.legal.cookies.manage')}
            <ExternalLink className="ml-2 size-4" />
          </Link>
        </Button>
      </FieldGroup>

      {/* 法的文書リンク集 */}
      <FieldGroup>
        <FieldLegend>{t('settings.legal.links.title')}</FieldLegend>
        <FieldDescription>{t('settings.legal.links.description')}</FieldDescription>

        <div className="space-y-3">
          {/* プライバシーポリシー */}
          <Field orientation="horizontal">
            <FieldLabel>
              <Link
                href={`/${locale}/legal/privacy`}
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                {t('settings.legal.links.privacy')}
              </Link>
            </FieldLabel>
            <Link
              href={`/${locale}/legal/privacy`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="size-4" />
            </Link>
          </Field>

          {/* 利用規約 */}
          <Field orientation="horizontal">
            <FieldLabel>
              <Link
                href={`/${locale}/legal/terms`}
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                {t('settings.legal.links.terms')}
              </Link>
            </FieldLabel>
            <Link
              href={`/${locale}/legal/terms`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="size-4" />
            </Link>
          </Field>

          {/* セキュリティポリシー */}
          <Field orientation="horizontal">
            <FieldLabel>
              <Link
                href={`/${locale}/legal/security`}
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                {t('settings.legal.links.security')}
              </Link>
            </FieldLabel>
            <Link
              href={`/${locale}/legal/security`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="size-4" />
            </Link>
          </Field>

          {/* Cookie設定 */}
          <Field orientation="horizontal">
            <FieldLabel>
              <Link
                href={`/${locale}/legal/cookies`}
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                {t('settings.legal.links.cookies')}
              </Link>
            </FieldLabel>
            <Link
              href={`/${locale}/legal/cookies`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="size-4" />
            </Link>
          </Field>

          {/* オープンソースライセンス */}
          <Field orientation="horizontal">
            <FieldLabel>
              <Link
                href={`/${locale}/legal/oss-credits`}
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                {t('settings.legal.links.ossCredits')}
              </Link>
            </FieldLabel>
            <Link
              href={`/${locale}/legal/oss-credits`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="size-4" />
            </Link>
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
