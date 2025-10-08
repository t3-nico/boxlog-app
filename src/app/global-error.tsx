'use client'

/**
 * Global Error Handler - Sentry統合
 *
 * Next.js App Router のグローバルエラーハンドラー
 * Reactレンダリングエラーを自動的にSentryに送信
 */

import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
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
    <html lang="ja">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg border border-border">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-destructive mb-2">
                アプリケーションエラー
              </h1>
              <p className="text-muted-foreground">
                申し訳ございません。予期しない問題が発生しました。
              </p>
            </div>

            {error.digest && (
              <div className="mb-4 p-3 bg-muted rounded text-xs">
                <p className="text-muted-foreground">
                  エラーID: <code className="font-mono">{error.digest}</code>
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  エラー詳細を表示
                </summary>
                <div className="mt-3 p-3 bg-muted rounded">
                  <p className="text-xs font-semibold mb-2">{error.name}</p>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                    {error.message}
                  </pre>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                再試行
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full bg-muted text-foreground py-2.5 px-4 rounded-md hover:bg-muted/80 transition-colors"
              >
                ホームに戻る
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-muted-foreground">
              🚨 エラーは自動的にSentryに報告されました
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
