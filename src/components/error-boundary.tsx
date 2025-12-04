/**
 * Sentry統合React Error Boundary
 * UIエラーの自動捕捉・分類・ユーザーセッション記録
 */

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { handleReactError, SentryErrorHandler } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * デフォルトのエラーフォールバックUI
 */
function DefaultErrorFallback({ onRetry, onReload }: { onRetry: () => void; onReload: () => void }) {
  const { t } = useI18n()

  return (
    <div className="border-destructive bg-muted rounded-lg border p-6">
      <div className="text-center">
        <div className="text-destructive mb-4 text-6xl">⚠️</div>
        <h2 className="text-destructive mb-2 text-3xl font-bold tracking-tight">{t('errors.boundary.title')}</h2>
        <p className="text-foreground mb-4">
          {t('errors.boundary.description')}
          <br />
          {t('errors.boundary.autoReport')}
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={onRetry}
            className="bg-primary text-primary-foreground hover:bg-primary/92 rounded px-4 py-2 transition-colors"
          >
            {t('errors.boundary.retry')}
          </button>
          <button
            onClick={onReload}
            className="bg-muted text-muted-foreground hover:bg-muted rounded px-4 py-2 transition-colors"
          >
            {t('errors.boundary.reload')}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 開発環境用フォールバックUI
 */
function DevErrorFallback({ componentName }: { componentName?: string | undefined }) {
  const { t } = useI18n()

  return (
    <div className="border-border bg-muted rounded-lg border p-6">
      <h3 className="text-foreground mb-2 text-2xl font-bold tracking-tight">{t('errors.boundary.devTitle')}</h3>
      <p className="text-foreground mb-2">
        {t('errors.boundary.component')}: {componentName || t('errors.boundary.unknown')}
      </p>
      <p className="text-muted-foreground text-sm">{t('errors.boundary.checkConsole')}</p>
    </div>
  )
}

/**
 * 機能エラー用フォールバックUI
 */
function FeatureErrorFallback({ featureName }: { featureName: string }) {
  const { t } = useI18n()

  return (
    <div className="border-border bg-muted rounded border p-4">
      <p className="text-foreground text-center">{t('errors.boundary.featureError', { feature: featureName })}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground hover:bg-primary/92 mx-auto mt-2 block rounded px-3 py-1 text-sm transition-colors"
      >
        {t('errors.boundary.reload')}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sentryにエラーを送信（自動分類・優先度付き）
    handleReactError(error, errorInfo)

    // 操作コンテキストの記録
    SentryErrorHandler.setOperationContext({
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      action: 'component_error',
      feature: 'error_boundary',
      component_stack: errorInfo.componentStack,
    })

    // パンくずリスト記録
    SentryErrorHandler.addBreadcrumb({
      message: `React Error Boundary caught: ${error.message}`,
      category: 'error',
      level: 'error',
    })

    // カスタムエラーハンドラーがあれば呼び出し
    this.props.onError?.(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがあれば使用
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトエラーUI
      return (
        <DefaultErrorFallback
          onRetry={() => this.setState({ hasError: false })}
          onReload={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}

/**
 * 開発環境用詳細エラー表示
 */
export function DetailedErrorBoundary({ children, componentName }: { children: ReactNode; componentName?: string }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(`🚨 Error in ${componentName || 'Unknown Component'}`)
          console.error('Error:', error)
          console.error('Component Stack:', errorInfo.componentStack)
          console.groupEnd()
        }
      }}
      fallback={process.env.NODE_ENV === 'development' ? <DevErrorFallback componentName={componentName} /> : undefined}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * 特定機能用Error Boundary
 */
export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
}: {
  children: ReactNode
  featureName: string
  fallback?: ReactNode
}) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // 機能固有のエラーコンテキスト設定
        SentryErrorHandler.setOperationContext({
          page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          action: 'feature_error',
          feature: featureName,
          error_message: error.message,
        })
      }}
      fallback={fallback || <FeatureErrorFallback featureName={featureName} />}
    >
      {children}
    </ErrorBoundary>
  )
}
