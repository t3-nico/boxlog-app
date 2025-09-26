// This file configures the initialization of Sentry on the browser/frontend
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while in development and sample at a lower rate in production.
  replaysSessionSampleRate: 0.1,

  // 自動ユーザー・セッション情報の設定
  initialScope: {
    tags: {
      component: 'frontend',
    },
  },

  // 統合機能の設定
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    // Core Web Vitalsの自動測定（Next.js専用）
    Sentry.browserTracingIntegration({
      // 自動ページナビゲーション追跡を有効化
      routingInstrumentation: Sentry.nextjsRouterInstrumentation(),
    }),
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
  import('./src/lib/sentry-performance').then(({ initPerformanceMonitoring }) => {
    initPerformanceMonitoring()
  })
}
