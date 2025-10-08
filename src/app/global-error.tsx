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
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-medium text-gray-900">アプリケーションエラーが発生しました</h1>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                予期しないエラーが発生しました。エラーは自動的に記録され、開発チームに報告されます。
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
                <p className="font-mono text-xs break-all text-red-800">{error.message}</p>
                {error.digest ? <p className="mt-1 text-xs text-red-600">Error ID: {error.digest}</p> : null}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={reset}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                再試行
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              >
                ホームに戻る
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">🚨 このエラーはSentryに自動報告されました</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
