/**
 * エラーバウンダリーコンポーネント
 * 統一されたエラーハンドリングとユーザーフレンドリーなエラー表示
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

import { Button } from '@/components/shadcn-ui/button'
import { handleClientError } from '@/lib/errors'
import { colors, typography, spacing, rounded, elevation } from '@/config/theme'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

// === 型定義 ===

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  className?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

// === エラーバウンダリークラス ===

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラー情報を保存
    this.setState({
      error,
      errorInfo,
    })

    // エラーログ出力
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // プロップスのエラーハンドラーを呼び出し
    this.props.onError?.(error, errorInfo)

    // 開発環境では詳細情報を出力
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Boundary Details')
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.error('Error ID:', this.state.errorId)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラー表示
      return (
        <div className={`min-h-screen flex items-center justify-center ${spacing.padding.md} ${this.props.className || ''}`}>
          <div className={`max-w-lg w-full ${colors.background.surface} ${rounded.component.card.base} ${elevation.lg} ${spacing.padding.lg}`}>
            <div className={`flex items-center ${spacing.margin.md}`}>
              <AlertTriangle className={`h-8 w-8 ${colors.semantic.error.text} mr-3`} />
              <h1 className={`${typography.heading.h2} ${colors.text.primary}`}>
                予期しないエラーが発生しました
              </h1>
            </div>

            <p className={`${colors.text.secondary} ${spacing.margin.lg}`}>
              申し訳ございません。アプリケーションでエラーが発生しました。
              ページを再読み込みするか、ホームページに戻ってお試しください。
            </p>

            {/* エラー詳細（開発環境のみ） */}
            {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
              <div className={`${spacing.margin.lg} ${spacing.padding.md} ${colors.background.elevated} ${rounded.component.input.text}`}>
                <h3 className={`${typography.body.semibold} ${colors.text.primary} ${spacing.margin.sm}`}>
                  エラー詳細 (開発環境のみ)
                </h3>
                <div className={`${typography.special.code} ${colors.text.secondary}`}>
                  <p className={spacing.margin.sm}>
                    <strong>エラーID:</strong> {this.state.errorId}
                  </p>
                  <p className={spacing.margin.sm}>
                    <strong>エラー:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className={`cursor-pointer ${colors.primary.DEFAULT}`}>
                        スタックトレース
                      </summary>
                      <pre className={`mt-2 ${typography.special.code} overflow-auto max-h-40 ${colors.background.base} ${spacing.padding.sm} ${rounded.component.input.text}`}>
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className={`flex flex-col sm:flex-row ${spacing.stack.sm}`}>
              <Button
                onClick={this.handleRetry}
                className="flex items-center justify-center"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                再試行
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// === フック形式のエラーバウンダリー ===

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// === エラーバウンダリー用のフック ===

export function useErrorHandler() {
  return {
    captureError: (error: Error, context?: string) => {
      console.error(`[${context || 'App'}] Error captured:`, error)
      
      // Sentry などの外部サービスにエラーを送信する場合
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     tags: { context },
      //   })
      // }
    },
    
    createErrorInfo: (error: Error, context?: string) => ({
      error: handleClientError(error),
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    })
  }
}

// === エラー表示用のコンポーネント ===

interface ErrorDisplayProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorDisplay({ 
  title = 'エラーが発生しました',
  message = '問題が発生しました。再試行してください。',
  action,
  className = ''
}: ErrorDisplayProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${spacing.padding.xl} text-center ${className}`}>
      <AlertTriangle className={`h-12 w-12 ${colors.semantic.error.text} ${spacing.margin.md}`} />
      <h3 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>
        {title}
      </h3>
      <p className={`${colors.text.secondary} ${spacing.margin.lg} max-w-md`}>
        {message}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// === デフォルトエクスポート ===

export default ErrorBoundary