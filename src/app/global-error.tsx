'use client';

/**
 * Global Error Handler - Sentry統合
 *
 * Next.js App Router のグローバルエラーハンドラー
 * Root Layout 自体が壊れた時に発動するため、独自の <html><body> を持つ。
 *
 * 重要:
 * - Root Layout が描画されないため、Tailwind CSS変数が利用不可の場合がある
 * - インラインstyleでフォールバックし、CSSなしでも読めるレイアウトを保証
 * - NextIntlClientProvider が利用不可のため静的英語テキストを使用
 */

import { useEffect } from 'react';

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

/**
 * インラインスタイルのみで動作するボタン
 *
 * global-error.tsx では shadcn/ui Button が正常に動作しない可能性があるため、
 * CSS変数に依存しないインラインスタイルを使用する。
 */
function ErrorButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'outline';
}) {
  const baseStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '0.625rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    textAlign: 'center',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
  };

  const styles: React.CSSProperties =
    variant === 'primary'
      ? { ...baseStyle, backgroundColor: '#3b82f6', color: '#ffffff' }
      : {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: '#a1a1aa',
          border: '1px solid #3f3f46',
        };

  return (
    <button onClick={onClick} style={styles}>
      {children}
    </button>
  );
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#18181b',
          color: '#fafafa',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: '100vh',
            width: '100%',
            padding: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '28rem',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '1rem',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h1
                style={{
                  color: '#ef4444',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginTop: 0,
                  marginBottom: '0.5rem',
                }}
              >
                {ERROR_TEXT.title}
              </h1>
              <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                {ERROR_TEXT.description}
              </p>
            </div>

            {error.digest && (
              <div
                style={{
                  backgroundColor: '#1f1f23',
                  borderRadius: '0.375rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.75rem',
                }}
              >
                <p style={{ color: '#a1a1aa', margin: 0 }}>
                  {ERROR_TEXT.errorId}:{' '}
                  <code style={{ fontFamily: 'monospace' }}>{error.digest}</code>
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginBottom: '1.5rem' }}>
                <summary
                  style={{
                    color: '#a1a1aa',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  {ERROR_TEXT.showDetails}
                </summary>
                <div
                  style={{
                    backgroundColor: '#1f1f23',
                    borderRadius: '0.375rem',
                    padding: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {error.name}
                  </p>
                  <pre
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.75rem',
                      maxHeight: '10rem',
                      overflow: 'auto',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {error.message}
                  </pre>
                </div>
              </details>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ErrorButton onClick={reset}>{ERROR_TEXT.retry}</ErrorButton>
              <ErrorButton variant="outline" onClick={() => (window.location.href = '/')}>
                {ERROR_TEXT.goHome}
              </ErrorButton>
            </div>

            <p
              style={{
                color: '#a1a1aa',
                fontSize: '0.75rem',
                textAlign: 'center',
                marginTop: '1.5rem',
                marginBottom: 0,
              }}
            >
              {ERROR_TEXT.sentryReport}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
