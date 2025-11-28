'use client'

import { useCallback, useEffect, useState } from 'react'

import { Box, ChevronRight, Cookie, ExternalLink, FileText, Info, Shield } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/features/i18n/lib/hooks'
import { getCookieConsent, setCookieConsent as saveCookieConsent, type CookieConsent } from '@/lib/cookie-consent'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

// アプリバージョン（package.jsonから取得する場合は環境変数経由で）
const APP_VERSION = '0.4.0'

/**
 * About & Legal設定ページコンポーネント
 *
 * 機能：
 * - アプリ情報とバージョン表示
 * - Cookie設定の現在の状況表示
 * - 法的文書リンク集
 */
export function AboutLegalSettings() {
  const { t, locale } = useI18n()
  const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setCookieConsent(getCookieConsent())

    const handleCookieConsentChange = (event: CustomEvent<CookieConsent | null>) => {
      setCookieConsent(event.detail)
    }

    window.addEventListener('cookieConsentChanged', handleCookieConsentChange as EventListener)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleCookieConsentChange as EventListener)
    }
  }, [])

  const handleAnalyticsChange = useCallback(
    (checked: boolean) => {
      saveCookieConsent({
        analytics: checked,
        marketing: cookieConsent?.marketing ?? false,
      })
    },
    [cookieConsent?.marketing]
  )

  const handleMarketingChange = useCallback(
    (checked: boolean) => {
      saveCookieConsent({
        analytics: cookieConsent?.analytics ?? false,
        marketing: checked,
      })
    },
    [cookieConsent?.analytics]
  )

  if (!isClient) {
    return null
  }

  const legalLinks = [
    { href: `/${locale}/legal/privacy`, label: t('settings.legal.links.privacy'), icon: Shield },
    { href: `/${locale}/legal/terms`, label: t('settings.legal.links.terms'), icon: FileText },
    { href: `/${locale}/legal/security`, label: t('settings.legal.links.security'), icon: Shield },
    { href: `/${locale}/legal/cookies`, label: t('settings.legal.links.cookies'), icon: Cookie },
    { href: `/${locale}/legal/oss-credits`, label: t('settings.legal.links.ossCredits'), icon: Box },
  ]

  return (
    <div className="space-y-6">
      {/* アプリ情報 */}
      <SettingsCard title="BoxLog について" description="アプリのバージョン情報">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-xl">
            <Box className="text-primary h-8 w-8" />
          </div>
          <div>
            <h4 className="text-lg font-semibold">BoxLog</h4>
            <p className="text-muted-foreground text-sm">タスク管理 & カレンダーアプリ</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">v{APP_VERSION}</Badge>
              <span className="text-muted-foreground text-xs">最新版</span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Cookie設定 */}
      <SettingsCard title={t('settings.legal.cookies.title')} description={t('settings.legal.cookies.description')}>
        <div className="space-y-4">
          {/* 必須Cookie */}
          <div className="border-border flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <Info className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">{t('settings.legal.cookies.current.necessary')}</span>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {t('settings.legal.cookies.current.necessaryStatus')}
            </Badge>
          </div>

          {/* 分析Cookie */}
          <SettingField
            label={t('settings.legal.cookies.current.analytics')}
            description="サービス改善のための匿名データ収集"
          >
            <Switch
              id="analytics-switch"
              checked={cookieConsent?.analytics ?? false}
              onCheckedChange={handleAnalyticsChange}
            />
          </SettingField>

          {/* マーケティングCookie */}
          <SettingField
            label={t('settings.legal.cookies.current.marketing')}
            description="パーソナライズされた広告表示"
          >
            <Switch
              id="marketing-switch"
              checked={cookieConsent?.marketing ?? false}
              onCheckedChange={handleMarketingChange}
            />
          </SettingField>

          {/* 最終更新日時 */}
          {cookieConsent?.timestamp && (
            <p className="text-muted-foreground text-xs">
              {t('settings.legal.cookies.lastUpdated')}:{' '}
              {new Date(cookieConsent.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}
            </p>
          )}
        </div>
      </SettingsCard>

      {/* 法的文書 */}
      <SettingsCard title={t('settings.legal.links.title')} description={t('settings.legal.links.description')}>
        <div className="divide-border -mx-4 -mb-4 divide-y">
          {legalLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-muted/50 flex items-center justify-between px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{link.label}</span>
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Link>
            )
          })}
        </div>
      </SettingsCard>

      {/* フィードバック */}
      <SettingsCard title="フィードバック" description="ご意見・ご要望をお聞かせください">
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="https://github.com/t3-nico/boxlog-app/issues" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              バグを報告
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="mailto:support@boxlog.app">機能をリクエスト</Link>
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
