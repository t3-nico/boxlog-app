'use client'

/**
 * Global Error Handler - Sentry統合
 *
 * Next.js App Router のグローバルエラーハンドラー
 * Reactレンダリングエラーを自動的にSentryに送信
 */

import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'

import { useI18n } from '@/features/i18n/lib/hooks'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { t, locale } = useI18n()

  useEffect(() => {
    // Sentryにエラーを送信
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'global_error',
        error_type: 'react_render_error',
      },
      contexts: {
        react_error: {
          componentStack: error.stack,
          digest: error.digest,
          message: error.message,
        },
      },
      extra: {
        errorInfo: {
          componentStack: error.stack,
          errorBoundary: 'GlobalError',
        },
      },
    })
  }, [error])

  return (
    <html lang={locale}>
      <body>
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="bg-card border-border w-full max-w-md rounded-xl border p-8 shadow-lg">
            <div className="mb-6">
              <h1 className="text-destructive mb-2 text-2xl font-bold">{t('errors.global.title')}</h1>
              <p className="text-muted-foreground">{t('errors.global.description')}</p>
            </div>

            {error.digest && (
              <div className="bg-muted mb-4 rounded p-3 text-xs">
                <p className="text-muted-foreground">
                  {t('errors.global.errorId')}: <code className="font-mono">{error.digest}</code>
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6">
                <summary className="text-muted-foreground hover:bg-foreground/8 -mx-1 cursor-pointer rounded px-1 text-sm transition-colors">
                  {t('errors.global.showDetails')}
                </summary>
                <div className="bg-muted mt-3 rounded p-3">
                  <p className="mb-2 text-xs font-semibold">{error.name}</p>
                  <pre className="text-muted-foreground max-h-40 overflow-auto text-xs">{error.message}</pre>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={reset}
                className="bg-primary text-primary-foreground hover:bg-primary/92 w-full rounded-md px-4 py-3 font-medium transition-colors"
              >
                {t('errors.global.retry')}
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="bg-muted text-foreground hover:bg-muted/80 w-full rounded-md px-4 py-3 transition-colors"
              >
                {t('errors.global.goHome')}
              </button>
            </div>

            <p className="text-muted-foreground mt-6 text-center text-xs">{t('errors.global.sentryReport')}</p>
          </div>
        </div>
      </body>
    </html>
  )
}
