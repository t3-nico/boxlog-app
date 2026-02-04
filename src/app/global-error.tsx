'use client';

/**
 * Global Error Handler - Sentry統合
 *
 * Next.js App Router のグローバルエラーハンドラー
 * Reactレンダリングエラーを自動的にSentryに送信
 *
 * Note: This component runs outside NextIntlClientProvider context,
 * so we use hardcoded English strings.
 */

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Static text for global error page (outside i18n context)
const ERROR_TEXT = {
  title: 'Something went wrong',
  description: 'We apologize for the inconvenience. An unexpected error occurred.',
  errorId: 'Error ID',
  showDetails: 'Show details',
  retry: 'Try again',
  goHome: 'Go to Home',
  sentryReport: 'This error has been automatically reported.',
};

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
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="bg-card border-border w-full max-w-md rounded-2xl border p-8 shadow-lg">
            <div className="mb-6">
              <h1 className="text-destructive mb-2 text-2xl font-bold">{ERROR_TEXT.title}</h1>
              <p className="text-muted-foreground">{ERROR_TEXT.description}</p>
            </div>

            {error.digest && (
              <div className="bg-surface-container mb-4 rounded p-4 text-xs">
                <p className="text-muted-foreground">
                  {ERROR_TEXT.errorId}: <code className="font-mono">{error.digest}</code>
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6">
                <summary className="text-muted-foreground hover:bg-state-hover -mx-1 cursor-pointer rounded px-1 text-sm transition-colors">
                  {ERROR_TEXT.showDetails}
                </summary>
                <div className="bg-surface-container mt-4 rounded p-4">
                  <p className="mb-2 text-xs font-bold">{error.name}</p>
                  <pre className="text-muted-foreground max-h-40 overflow-auto text-xs">
                    {error.message}
                  </pre>
                </div>
              </details>
            )}

            <div className="space-y-4">
              <Button onClick={reset} className="w-full">
                {ERROR_TEXT.retry}
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                {ERROR_TEXT.goHome}
              </Button>
            </div>

            <p className="text-muted-foreground mt-6 text-center text-xs">
              {ERROR_TEXT.sentryReport}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
