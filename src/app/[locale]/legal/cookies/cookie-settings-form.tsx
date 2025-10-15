'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/features/i18n/lib/hooks'
import {
  acceptAllCookies,
  acceptNecessaryOnly,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent'
import { toast } from 'sonner'

/**
 * Cookie設定フォーム（Client Component）
 *
 * Cookie同意設定を管理するインタラクティブフォーム
 * - 必須Cookie: 常に有効（無効化不可）
 * - 分析Cookie: ユーザー選択可能
 * - マーケティングCookie: ユーザー選択可能
 */
export function CookieSettingsForm() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // クライアントサイドレンダリング確認
    setIsClient(true)

    // 現在の設定を読み込み
    const currentConsent = getCookieConsent()
    if (currentConsent) {
      setSettings(currentConsent)
    }
  }, [])

  const handleSave = () => {
    setCookieConsent({
      analytics: settings.analytics,
      marketing: settings.marketing,
    })
    toast.success(t('legal.cookies.settings.saved'))
  }

  const handleAcceptAll = () => {
    acceptAllCookies()
    setSettings({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    })
    toast.success(t('legal.cookies.settings.acceptedAll'))
  }

  const handleAcceptNecessaryOnly = () => {
    acceptNecessaryOnly()
    setSettings({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    })
    toast.success(t('legal.cookies.settings.acceptedNecessaryOnly'))
  }

  // SSR時は何も表示しない
  if (!isClient) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 必須Cookie */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('legal.cookies.categories.necessary.title')}
            <Switch checked={true} disabled aria-label={t('legal.cookies.categories.necessary.ariaLabel')} />
          </CardTitle>
          <CardDescription>{t('legal.cookies.categories.necessary.description')}</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <ul className="list-inside list-disc space-y-1">
            <li>{t('legal.cookies.categories.necessary.cookies.session')}</li>
            <li>{t('legal.cookies.categories.necessary.cookies.csrf')}</li>
            <li>{t('legal.cookies.categories.necessary.cookies.consent')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* 分析Cookie */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('legal.cookies.categories.analytics.title')}
            <Switch
              checked={settings.analytics}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  analytics: checked,
                }))
              }
              aria-label={t('legal.cookies.categories.analytics.ariaLabel')}
            />
          </CardTitle>
          <CardDescription>{t('legal.cookies.categories.analytics.description')}</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <ul className="list-inside list-disc space-y-1">
            <li>{t('legal.cookies.categories.analytics.cookies.vercel')}</li>
            <li>{t('legal.cookies.categories.analytics.cookies.sentry')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* マーケティングCookie */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('legal.cookies.categories.marketing.title')}
            <Switch
              checked={settings.marketing}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  marketing: checked,
                }))
              }
              aria-label={t('legal.cookies.categories.marketing.ariaLabel')}
            />
          </CardTitle>
          <CardDescription>{t('legal.cookies.categories.marketing.description')}</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <ul className="list-inside list-disc space-y-1">
            <li>{t('legal.cookies.categories.marketing.cookies.none')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleSave} className="w-full sm:w-auto">
          {t('legal.cookies.settings.save')}
        </Button>
        <Button onClick={handleAcceptAll} variant="outline" className="w-full sm:w-auto">
          {t('legal.cookies.settings.acceptAll')}
        </Button>
        <Button onClick={handleAcceptNecessaryOnly} variant="outline" className="w-full sm:w-auto">
          {t('legal.cookies.settings.rejectAll')}
        </Button>
      </div>
    </div>
  )
}
