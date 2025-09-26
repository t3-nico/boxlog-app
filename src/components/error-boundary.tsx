/**
 * Sentry統合React Error Boundary
 * UIエラーの自動捕捉・分類・ユーザーセッション記録
 */

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

import { colors, spacing, typography } from '@/config/theme'
import { handleReactError, SentryErrorHandler } from '@/lib/sentry-integration'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
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
    SentryErrorHandler.addBreadcrumb(`React Error Boundary caught: ${error.message}`, 'error', 'error')

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
        <div
          className={`${colors.background.error} ${spacing.component.padding.lg} ${colors.border.error} rounded-lg border`}
        >
          <div className="text-center">
            <div className={`${colors.text.error} mb-4 text-6xl`}>⚠️</div>
            <h2 className={`${typography.heading.h3} ${colors.text.error} mb-2`}>予期しないエラーが発生しました</h2>
            <p className={`${colors.text.secondary} mb-4`}>
              申し訳ございません。アプリケーションでエラーが発生しました。
              <br />
              自動的にエラー報告を送信いたします。
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className={`${colors.primary.DEFAULT} rounded px-4 py-2 text-white transition-opacity hover:opacity-80`}
              >
                再試行
              </button>
              <button
                onClick={() => window.location.reload()}
                className={`${colors.secondary.DEFAULT} rounded px-4 py-2 text-white transition-opacity hover:opacity-80`}
              >
                ページをリロード
              </button>
            </div>
          </div>
        </div>
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
      fallback={
        process.env.NODE_ENV === 'development' ? (
          <div className={`${colors.background.warning} ${spacing.component.padding.lg} rounded-lg border`}>
            <h3 className={`${typography.heading.h4} ${colors.text.warning} mb-2`}>開発環境 - コンポーネントエラー</h3>
            <p className={`${colors.text.secondary} mb-2`}>コンポーネント: {componentName || '不明'}</p>
            <p className={`${colors.text.secondary} text-sm`}>詳細はブラウザのコンソールを確認してください。</p>
          </div>
        ) : undefined
      }
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
      fallback={
        fallback || (
          <div className={`${colors.background.muted} ${spacing.component.padding.md} rounded border`}>
            <p className={`${colors.text.secondary} text-center`}>{featureName}機能でエラーが発生しました</p>
            <button
              onClick={() => window.location.reload()}
              className={`${colors.primary.DEFAULT} mx-auto mt-2 block rounded px-3 py-1 text-sm text-white`}
            >
              リロード
            </button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  )
}
