/**
 * Sentry クライアントサイド設定
 *
 * ブラウザでのエラー監視・パフォーマンス監視・Session Replayを設定。
 * Next.js 15では自動的に読み込まれます。
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * GDPR対応: Cookie同意確認
 * 分析Cookieの同意がある場合のみSentryを有効化
 */
function isAnalyticsConsented(): boolean {
  // サーバーサイドでは常に許可（このファイルはクライアント専用だが念のため）
  if (typeof window === 'undefined') {
    return true
  }

  // 開発環境では同意チェックをスキップ
  if (!IS_PRODUCTION) {
    return true
  }

  // ブラウザでCookie同意を確認
  try {
    const consent = localStorage.getItem('boxlog_cookie_consent')
    if (!consent) return false

    const parsed = JSON.parse(consent)
    return parsed.analytics === true
  } catch {
    return false
  }
}

// DSNが設定されていて、同意がある場合のみ初期化
if (SENTRY_DSN && isAnalyticsConsented()) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: VERCEL_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // サンプリングレート（環境別）
    tracesSampleRate: IS_PRODUCTION ? 0.1 : VERCEL_ENV === 'preview' ? 0.5 : 1.0,

    // Session Replay設定
    // エラー発生時: 100%キャプチャ（問題再現用）
    // 通常時: 0%（コスト削減）
    replaysOnErrorSampleRate: IS_PRODUCTION ? 1.0 : 0,
    replaysSessionSampleRate: 0,

    // デバッグモード（開発環境のみ）
    debug: !IS_PRODUCTION && process.env.NEXT_PUBLIC_SENTRY_DEBUG === 'true',

    // 本番・プレビュー環境のみ有効
    enabled: IS_PRODUCTION || VERCEL_ENV === 'preview',

    // エラーフィルタリング
    beforeSend(event) {
      // 開発環境のノイズ除去
      if (!IS_PRODUCTION) {
        const errorMessage = event.exception?.values?.[0]?.value || ''

        // HMR・Webpack関連エラーをフィルタ
        const ignoredPatterns = ['HMR', 'Unexpected token', 'ChunkLoadError', 'Loading chunk', 'Network Error']

        if (ignoredPatterns.some((pattern) => errorMessage.includes(pattern))) {
          return null
        }
      }

      // テストエラーは通す
      if (event.tags?.test === true) {
        return event
      }

      return event
    },

    // クライアントサイド用インテグレーション
    integrations: [
      // パフォーマンス監視（INP計測含む）
      Sentry.browserTracingIntegration({
        enableInp: true,
      }),

      // Session Replay（個人情報保護設定）
      Sentry.replayIntegration({
        maskAllText: true, // テキストをマスク
        blockAllMedia: true, // メディアをブロック
      }),
    ],
  })
}
