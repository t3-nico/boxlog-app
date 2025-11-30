/**
 * Sentry統合設定 - サーバー・Edge共通
 * Next.js 14+ 対応
 *
 * 環境別設定:
 * - Production: サンプリング10%、Session Replayエラー時のみ
 * - Preview: サンプリング50%、Session Replayなし
 * - Development: サンプリング100%、デバッグモード有効
 *
 * GDPR対応:
 * - Cookie同意確認（分析Cookie）
 * - IPアドレス送信のため同意必須
 * - 開発環境では同意チェックをスキップ
 */
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV

/**
 * Cookie同意確認（クライアントサイドのみ）
 * Sentryはサーバー・エッジでも実行されるため、ブラウザー環境でのみチェック
 */
function isAnalyticsConsented(): boolean {
  if (typeof window === 'undefined') {
    // サーバーサイド・エッジ環境では常に許可（サーバーエラー追跡のため）
    return true
  }

  // 開発環境では同意チェックをスキップ
  if (!IS_PRODUCTION) {
    return true
  }

  // ブラウザーでCookie同意を確認
  try {
    const consent = localStorage.getItem('boxlog_cookie_consent')
    if (!consent) return false

    const parsed = JSON.parse(consent)
    return parsed.analytics === true
  } catch {
    return false
  }
}

if (SENTRY_DSN && isAnalyticsConsented()) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: VERCEL_ENV || process.env.NODE_ENV || 'development',

    // 環境別サンプリングレート
    tracesSampleRate: IS_PRODUCTION ? 0.1 : VERCEL_ENV === 'preview' ? 0.5 : 1.0,

    // Session Replay（エラー時のみ・本番のみ）
    replaysOnErrorSampleRate: IS_PRODUCTION ? 1.0 : 0,
    replaysSessionSampleRate: 0, // 通常時は記録しない（コスト削減）

    // デバッグモード（開発環境のみ）
    debug: !IS_PRODUCTION,

    // 本番・プレビュー環境のみ有効
    enabled: IS_PRODUCTION || VERCEL_ENV === 'preview',

    // エラーフィルタリング
    beforeSend(event, _hint) {
      // 開発環境のノイズ除去
      if (!IS_PRODUCTION && event.environment === 'development') {
        // HMR関連エラーをフィルタ
        if (event.exception?.values?.[0]?.value?.includes('HMR')) {
          return null
        }
        // Webpack HMRエラーをフィルタ
        if (event.exception?.values?.[0]?.value?.includes('Unexpected token')) {
          return null
        }
      }

      // テストエラーは通す
      if (event.tags?.test === true) {
        return event
      }

      return event
    },

    // パフォーマンス監視の統合
    integrations: [
      // 自動計測
      Sentry.browserTracingIntegration({
        enableInp: true, // INP測定有効化
      }),
      // Session Replay
      Sentry.replayIntegration({
        maskAllText: true, // 個人情報保護
        blockAllMedia: true, // メディアブロック
      }),
    ],
  })
}
