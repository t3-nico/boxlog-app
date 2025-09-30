/**
 * Next.js 14 Client Instrumentation - Sentry統合
 *
 * Turbopack対応のクライアントサイド設定
 * sentry.client.config.tsの代替として使用（将来のTurbopack対応）
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // パフォーマンス監視設定
  tracesSampleRate: 1,

  // デバッグ設定
  debug: false,

  // Session Replay設定
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // 自動ユーザー・セッション情報の設定
  initialScope: {
    tags: {
      component: 'frontend',
      instrumentation: 'next14',
    },
  },

  // 統合機能の設定
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    // Core Web Vitalsの自動測定（Next.js専用）
    Sentry.browserTracingIntegration(),
  ],

  // パフォーマンス監視の設定
  beforeSend(event) {
    // コンソールエラーも記録
    if (event.exception) {
      console.error('Sentry captured error:', event.exception)
    }
    return event
  },

  // 環境別設定
  environment: process.env.NODE_ENV,

  // リリース管理
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
})

// 未処理のPromiseリジェクションを捕捉
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason, {
      tags: {
        error_type: 'unhandled_promise_rejection',
      },
      contexts: {
        promise_rejection: {
          reason: event.reason,
          promise: event.promise?.toString() || 'unknown',
        },
      },
    })
  })

  // 自動ユーザーコンテキスト設定（ブラウザ情報）
  Sentry.setContext('browser_info', {
    user_agent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    url: window.location.href,
  })

  // 自動セッション情報設定
  Sentry.setTag('session_id', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  Sentry.setTag('page_load_time', Date.now().toString())

  // パフォーマンス監視の初期化
  import('./src/lib/sentry').then(({ initPerformanceMonitoring }) => {
    initPerformanceMonitoring()
  })
}

// Next.js 14 ナビゲーション監視（必須エクスポート）
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
