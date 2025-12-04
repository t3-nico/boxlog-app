'use client'

import { useState } from 'react'

import { InfoIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  acceptAllCookies,
  acceptNecessaryOnly,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

// SSR対応の遅延初期化
const getInitialSettings = (): CookieConsent => {
  if (typeof window === 'undefined') {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: 0,
    }
  }
  const currentConsent = getCookieConsent()
  if (currentConsent) {
    return currentConsent
  }
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  }
}

/**
 * Cookie設定フォーム（Client Component）
 *
 * Cookie同意設定を管理するインタラクティブフォーム
 * - 必須Cookie: 常に有効（無効化不可）
 * - 分析Cookie: ユーザー選択可能
 * - マーケティングCookie: ユーザー選択可能
 */
export function CookieSettingsForm() {
  const t = useTranslations()
  // 遅延初期化でCookie設定を読み込み
  const [settings, setSettings] = useState<CookieConsent>(getInitialSettings)

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
            <li>{t('legal.cookies.categories.analytics.cookies.sentry')}</li>
          </ul>
          <p className="text-muted-foreground mt-3 flex items-start gap-1.5 text-xs">
            <InfoIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {t('legal.cookies.categories.analytics.cookies.vercelNote')}
          </p>
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
