'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/features/i18n/lib/hooks'
import { acceptAllCookies, acceptNecessaryOnly, needsCookieConsent, onCookieConsentChange } from '@/lib/cookie-consent'

/**
 * Cookie同意バナー
 *
 * ePrivacy Directive準拠のCookie同意バナー
 * - 初回訪問時に画面下部に表示
 * - 「すべて受け入れ」または「必須のみ」を選択
 * - Cookie設定ページへのリンク
 */
export function CookieConsentBanner() {
  const { t } = useI18n()
  const [showBanner, setShowBanner] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // クライアントサイドレンダリング確認
    setIsClient(true)

    // 同意が必要かチェック
    setShowBanner(needsCookieConsent())

    // 同意状態変更を監視
    const unsubscribe = onCookieConsentChange((consent) => {
      setShowBanner(consent === null)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // SSR時は何も表示しない
  if (!isClient) {
    return null
  }

  // 同意済みの場合は何も表示しない
  if (!showBanner) {
    return null
  }

  const handleAcceptAll = () => {
    acceptAllCookies()
    setShowBanner(false)
  }

  const handleAcceptNecessaryOnly = () => {
    acceptNecessaryOnly()
    setShowBanner(false)
  }

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-live="polite"
      aria-label={t('legal.cookies.banner.title')}
    >
      <Card className="border-border bg-card mx-auto max-w-4xl shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* 説明文 */}
            <div className="flex-1">
              <h2 className="text-card-foreground mb-2 text-base font-semibold sm:text-lg">
                {t('legal.cookies.banner.title')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('legal.cookies.banner.description')}{' '}
                <Link
                  href="/legal/cookies"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setShowBanner(false)}
                >
                  {t('legal.cookieSettings')}
                </Link>
              </p>
            </div>

            {/* ボタン */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button variant="outline" onClick={handleAcceptNecessaryOnly} className="w-full sm:w-auto">
                {t('legal.cookies.banner.rejectAll')}
              </Button>
              <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
                {t('legal.cookies.banner.acceptAll')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
