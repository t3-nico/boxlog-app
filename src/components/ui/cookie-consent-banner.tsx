'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { acceptAllCookies, acceptNecessaryOnly, needsCookieConsent } from '@/lib/cookie-consent';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Cookie同意バナー
 *
 * GDPR・ePrivacy指令準拠のCookie同意取得バナー
 *
 * 機能：
 * - 初回訪問時のみ表示（同意済みの場合は非表示）
 * - authページでは非表示（LCP改善: 認証後に表示）
 * - 3つの選択肢：すべて同意、必須のみ、カスタマイズ
 * - 固定位置（画面下部）
 * - レスポンシブ対応
 * - LCP改善のため遅延表示（requestIdleCallback後）
 *
 * 法的準拠：
 * - GDPR Article 7: 同意条件
 * - ePrivacy Directive: Cookie使用の事前同意
 * - 明示的な同意取得
 * - 拒否権の保証
 *
 * @see /src/lib/cookie-consent.ts - Cookie管理機能
 * @see /src/app/legal/cookies - Cookie設定ページ
 */
export function CookieConsentBanner() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  // LCP改善: 初期値falseで遅延表示
  const [showBanner, setShowBanner] = useState(false);

  // LCP改善: authページでは非表示（認証後のページで表示）
  const isAuthPage = pathname?.includes('/auth');

  // LCP改善: requestIdleCallbackで遅延チェック
  useEffect(() => {
    // authページではスキップ
    if (isAuthPage) return;

    const checkConsent = () => {
      if (needsCookieConsent()) {
        setShowBanner(true);
      }
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(checkConsent, { timeout: 2000 });
      return () => cancelIdleCallback(handle);
    } else {
      // フォールバック: 1秒後にチェック
      const timer = setTimeout(checkConsent, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthPage]);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
  };

  const handleAcceptNecessaryOnly = () => {
    acceptNecessaryOnly();
    setShowBanner(false);
  };

  // SSR時、または同意済みの場合は何も表示しない
  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="border-border bg-card fixed inset-x-0 bottom-0 z-50 border-t p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* メッセージ */}
          <div className="flex-1">
            <h2 id="cookie-consent-title" className="text-foreground mb-1 text-base font-bold">
              {t('legal.cookies.banner.title')}
            </h2>
            <p id="cookie-consent-description" className="text-muted-foreground text-sm">
              {t('legal.cookies.banner.description')}{' '}
              <Link
                href={`/${locale}/legal/cookies`}
                className="text-primary hover:text-primary/80 underline"
              >
                {t('legal.cookies.banner.learnMore')}
              </Link>
            </p>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
              {t('legal.cookies.banner.acceptAll')}
            </Button>
            <Button
              onClick={handleAcceptNecessaryOnly}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {t('legal.cookies.banner.rejectAll')}
            </Button>
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href={`/${locale}/legal/cookies`}>{t('legal.cookies.banner.customize')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
