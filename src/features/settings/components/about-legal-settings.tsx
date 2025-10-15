'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/features/i18n/lib/hooks'
import { getCookieConsent, type CookieConsent } from '@/lib/cookie-consent'
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
export default function AboutLegalSettings() {
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

  // SSR時は何も表示しない
  if (!isClient) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Cookie設定カード */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.legal.cookies.title')}</CardTitle>
          <CardDescription>{t('settings.legal.cookies.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 現在の設定状況 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('settings.legal.cookies.current.title')}</h4>
            <div className="space-y-2 text-sm">
              {/* 必須Cookie */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('settings.legal.cookies.current.necessary')}</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {t('settings.legal.cookies.current.necessaryStatus')}
                </Badge>
              </div>

              {/* 分析Cookie */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('settings.legal.cookies.current.analytics')}</span>
                <Badge variant={cookieConsent?.analytics ? 'default' : 'secondary'}>
                  {cookieConsent?.analytics
                    ? t('settings.legal.cookies.current.enabled')
                    : t('settings.legal.cookies.current.disabled')}
                </Badge>
              </div>

              {/* マーケティングCookie */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('settings.legal.cookies.current.marketing')}</span>
                <Badge variant={cookieConsent?.marketing ? 'default' : 'secondary'}>
                  {cookieConsent?.marketing
                    ? t('settings.legal.cookies.current.enabled')
                    : t('settings.legal.cookies.current.disabled')}
                </Badge>
              </div>
            </div>

            {/* 最終更新日時 */}
            {cookieConsent?.timestamp && (
              <p className="text-muted-foreground text-xs">
                {t('settings.legal.cookies.lastUpdated')}:{' '}
                {new Date(cookieConsent.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}
              </p>
            )}
          </div>

          <Separator />

          {/* Cookie設定ページへのリンク */}
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${locale}/legal/cookies`}>
              {t('settings.legal.cookies.manage')}
              <ExternalLink className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 法的文書リンク集 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.legal.links.title')}</CardTitle>
          <CardDescription>{t('settings.legal.links.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              href={`/${locale}/legal/privacy`}
              className="text-primary hover:text-primary/80 flex items-center justify-between transition-colors"
            >
              <span>{t('settings.legal.links.privacy')}</span>
              <ExternalLink className="size-4" />
            </Link>

            <Separator />

            <Link
              href={`/${locale}/legal/terms`}
              className="text-primary hover:text-primary/80 flex items-center justify-between transition-colors"
            >
              <span>{t('settings.legal.links.terms')}</span>
              <ExternalLink className="size-4" />
            </Link>

            <Separator />

            <Link
              href={`/${locale}/legal/security`}
              className="text-primary hover:text-primary/80 flex items-center justify-between transition-colors"
            >
              <span>{t('settings.legal.links.security')}</span>
              <ExternalLink className="size-4" />
            </Link>

            <Separator />

            <Link
              href={`/${locale}/legal/cookies`}
              className="text-primary hover:text-primary/80 flex items-center justify-between transition-colors"
            >
              <span>{t('settings.legal.links.cookies')}</span>
              <ExternalLink className="size-4" />
            </Link>

            <Separator />

            <Link
              href={`/${locale}/legal/oss-credits`}
              className="text-primary hover:text-primary/80 flex items-center justify-between transition-colors"
            >
              <span>{t('settings.legal.links.ossCredits')}</span>
              <ExternalLink className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
