'use client'

import { Cookie, Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { acceptAllCookies, acceptNecessaryOnly, needsCookieConsent } from '@/lib/cookie-consent'

/**
 * 🍪 Cookie Consent Banner
 *
 * GDPR/ePrivacy指令準拠のCookie同意バナー
 * - 初回訪問時のみ表示
 * - カテゴリ別同意取得
 * - LocalStorage管理
 *
 * @see Issue #547 - Cookie同意バナー実装
 */
export function CookieConsentBanner() {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // クライアントサイドのみで実行
    const shouldShow = needsCookieConsent()
    setShow(shouldShow)
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies()
    closeBanner()
  }

  const handleAcceptNecessaryOnly = () => {
    acceptNecessaryOnly()
    closeBanner()
  }

  const closeBanner = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShow(false)
      setIsClosing(false)
    }, 300) // アニメーション時間
  }

  // SSR時またはバナー非表示時は何もレンダリングしない
  if (!show) {
    return null
  }

  return (
    <>
      {/* オーバーレイ（モバイル時のみ） */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleAcceptNecessaryOnly}
        aria-hidden="true"
      />

      {/* Cookie Consent Banner */}
      <div
        className={`fixed right-0 bottom-0 left-0 z-50 transform transition-transform duration-300 ease-out ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        <div className="border-border bg-card border-t shadow-2xl">
          <div className="container mx-auto max-w-6xl p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              {/* コンテンツ */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Cookie className="text-primary h-5 w-5" />
                  <h3 id="cookie-banner-title" className="text-foreground text-base font-semibold md:text-lg">
                    {t('legal.cookies.banner.title')}
                  </h3>
                </div>
                <p id="cookie-banner-description" className="text-muted-foreground text-sm leading-relaxed">
                  {t('legal.cookies.banner.description')}{' '}
                  <Link href="/legal/privacy" className="text-primary hover:underline">
                    {t('legal.cookies.banner.learnMore')}
                  </Link>
                </p>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col gap-2 sm:flex-row md:flex-shrink-0">
                <Button
                  onClick={handleAcceptAll}
                  size="sm"
                  className="w-full sm:w-auto"
                  aria-label={t('legal.cookies.banner.acceptAll')}
                >
                  {t('legal.cookies.banner.acceptAll')}
                </Button>
                <Button
                  onClick={handleAcceptNecessaryOnly}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  aria-label={t('legal.cookies.banner.rejectAll')}
                >
                  {t('legal.cookies.banner.rejectAll')}
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  aria-label={t('legal.cookies.banner.customize')}
                >
                  <Link href="/legal/cookies">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('legal.cookies.banner.customize')}
                  </Link>
                </Button>
              </div>
            </div>

            {/* GDPR準拠の追加情報 */}
            <div className="border-border mt-4 border-t pt-3">
              <p className="text-muted-foreground text-xs">
                {t('legal.cookies.banner.gdprNotice')}{' '}
                <Link href="/legal/cookies" className="text-primary hover:underline">
                  {t('legal.cookies.banner.manageCookies')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
