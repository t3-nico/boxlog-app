/**
 * グローバルエラーバウンダリー（自動復旧システム）
 * 技術知識に関係なく、エラーから自動復旧する最高レベルのエラーハンドリング
 */

'use client'

import { Component, ErrorInfo } from 'react'

import { AlertTriangle, Home, RefreshCw, Shield, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createErrorToast, getUserFriendlyMessage, isAutoRecoverable } from '@/config/error-patterns'
import { analyzeError, type ErrorAnalysis } from '@/lib/error-analysis'
import { cn } from '@/lib/utils'

import { GlobalErrorBoundaryProps, GlobalErrorBoundaryState } from './types'

// === 自動復旧機能付きグローバルエラーバウンダリー ===

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  private retryTimeoutId?: NodeJS.Timeout
  private autoRetryTimeoutId?: NodeJS.Timeout

  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      isRetrying: false,
      autoRetryEnabled: true,
      lastErrorTime: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 12),
      lastErrorTime: Date.now(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラー情報を保存
    this.setState({
      error,
      errorInfo,
    })

    const { retryCount } = this.state
    const { maxRetries = 3, onError } = this.props

    // エラー分析（error-patterns.ts統合版）
    const analysis = analyzeError(error)

    // ユーザーフレンドリーなトースト通知を表示
    if (typeof window !== 'undefined') {
      const toastInfo = createErrorToast(analysis.code)
      // NOTE: 実際のトースト表示は toast ライブラリに依存
      console.log('🍞 トース���通知:', toastInfo)
    }

    // エラーログ出力（構造化・拡張版）
    console.group('🚨 GlobalErrorBoundary - エラー詳細（error-patterns.ts統合）')
    console.error('Error:', error)
    console.error('Error Analysis:', analysis)
    console.error('User Friendly Message:', getUserFriendlyMessage(analysis.code))
    // TODO: Implement getRecommendedActions function
    // console.error('Recommended Actions:', getRecommendedActions(analysis.code))
    console.error('Auto Recoverable:', isAutoRecoverable(analysis.code))
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error ID:', this.state.errorId)
    console.error('Retry Count:', retryCount)
    console.groupEnd()

    // プロップスのエラーハンドラーを呼び出し
    onError?.(error, errorInfo, retryCount)

    // 自動復旧のロジック（error-patterns.tsの判定を使用）
    const autoRecoverable = isAutoRecoverable(analysis.code)
    if (autoRecoverable && retryCount < maxRetries && this.state.autoRetryEnabled) {
      this.scheduleAutoRetry(analysis)
    }
  }

  scheduleAutoRetry = (_analysis: ErrorAnalysis) => {
    const { retryDelay = 1000 } = this.props
    // 指数バックオフ（1秒, 2秒, 4秒）
    const delay = retryDelay * Math.pow(2, this.state.retryCount)

    console.log(`🔄 自動復旧を ${delay}ms 後に実行します...`)

    this.setState({ isRetrying: true })

    this.autoRetryTimeoutId = setTimeout(() => {
      this.handleAutoRetry()
    }, delay)
  }

  handleAutoRetry = () => {
    console.log('🔄 自動復旧を実行中...')

    this.setState((prevState) => ({
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
    }))

    // しばらく待ってからリセット（React の再レンダリングを促すため）
    setTimeout(() => {
      this.handleRetry()
    }, 100)
  }

  handleRetry = () => {
    console.log('🔄 エラーバウンダリーをリセット - 再試行')

    this.setState({
      hasError: false,
      errorId: '',
      isRetrying: false,
    })
  }

  handleManualRetry = () => {
    console.log('🔄 手動再試行')

    this.setState((prevState) => ({
      retryCount: prevState.retryCount + 1,
    }))

    this.handleRetry()
  }

  handleGoHome = () => {
    console.log('🏠 ホームページにリダイレクト')
    window.location.href = '/'
  }

  handleReload = () => {
    console.log('🔄 ページ全体を再読み込み')
    window.location.reload()
  }

  toggleAutoRetry = () => {
    this.setState((prevState) => ({
      autoRetryEnabled: !prevState.autoRetryEnabled,
    }))
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    if (this.autoRetryTimeoutId) {
      clearTimeout(this.autoRetryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const analysis = analyzeError(this.state.error)
      const { maxRetries = 3 } = this.props
      const canRetry = this.state.retryCount < maxRetries

      return (
        <div className={cn('flex min-h-screen items-center justify-center p-4 sm:p-6', this.props.className)}>
          <div className="w-full max-w-4xl rounded-md bg-white p-4 shadow-lg sm:p-6 dark:bg-neutral-800">
            {/* エラーヘッダー */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-shrink-0 self-start rounded-md bg-red-100 p-3 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 sm:h-8 sm:w-8 dark:text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold tracking-tight break-words text-neutral-900 sm:text-2xl md:text-3xl dark:text-neutral-100">
                    システムエラーが発生しました
                  </h1>
                  <p className="mt-1 text-xs break-all text-neutral-800 sm:text-sm dark:text-neutral-200">
                    エラーID: {this.state.errorId} • 重要度: {analysis.severity}
                  </p>
                </div>
              </div>
            </div>

            {/* 自動復旧状況 */}
            {this.state.isRetrying ? (
              <div className="mb-4 flex items-start gap-3 rounded-md bg-blue-100 p-3 sm:items-center sm:p-4 dark:bg-blue-900/30">
                <RefreshCw className="h-5 w-5 flex-shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-blue-600 sm:text-base dark:text-blue-400">自動復旧中...</p>
                  <p className="text-xs break-words text-blue-800 sm:text-sm dark:text-blue-300">
                    しばらくお待ちください（試行回数: {this.state.retryCount + 1}/{maxRetries}）
                  </p>
                </div>
              </div>
            ) : null}

            {/* エラー分析・推奨アクション（error-patterns.ts統合版） */}
            <div className="mb-4 sm:mb-6">
              <h3 className="mb-2 text-sm font-semibold text-neutral-900 sm:text-base dark:text-neutral-100">
                発生した問題と対処法
              </h3>
              <div className="rounded-md bg-neutral-200 p-3 sm:p-4 dark:bg-neutral-700">
                <div className="space-y-3">
                  {/* ユーザーフレンドリーメッセージ */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="flex-shrink-0 text-xl sm:text-2xl">⚠️</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold break-words text-neutral-900 sm:text-base dark:text-neutral-100">
                        {getUserFriendlyMessage(analysis.code)}
                      </p>
                      {/* TODO: Implement getErrorPattern function */}
                      {/* <p className="text-sm text-neutral-800 dark:text-neutral-200">
                        {getErrorPattern(analysis.code)?.description}
                      </p> */}
                    </div>
                  </div>

                  {/* 技術詳細（簡略版） */}
                  <div className="overflow-x-auto rounded-md bg-neutral-100 p-2 sm:p-3 dark:bg-neutral-900">
                    <p className="text-xs whitespace-nowrap text-neutral-800 sm:text-sm dark:text-neutral-200">
                      <span className="font-semibold">分類:</span> {analysis.category} 系統 •{' '}
                      <span className="font-semibold">重要度:</span> {analysis.severity} •{' '}
                      <span className="font-semibold">自動復旧:</span>{' '}
                      {analysis.autoRetryable ? '✅ 可能' : '❌ 手動対応必要'}
                    </p>
                  </div>
                </div>

                {/* 推奨アクション（error-patterns.tsから取得） */}
                <div className="mt-3 sm:mt-4">
                  <p className="mb-2 text-sm font-semibold text-neutral-900 sm:text-base dark:text-neutral-100">
                    推奨アクション:
                  </p>
                  <ul className="space-y-2">
                    {analysis.suggestedActions.map((action, index) => (
                      <li
                        key={action}
                        className="flex items-start gap-2 text-xs text-neutral-800 sm:text-sm dark:text-neutral-200"
                      >
                        <span className="flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                          {index + 1}.
                        </span>
                        <span className="min-w-0 flex-1 break-words">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 自動復旧設定 */}
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                <span className="text-xs text-neutral-900 sm:text-sm dark:text-neutral-100">自動復旧システム</span>
              </div>
              <Button
                onClick={this.toggleAutoRetry}
                variant={this.state.autoRetryEnabled ? 'default' : 'outline'}
                size="sm"
                className="w-full sm:w-auto"
              >
                {this.state.autoRetryEnabled ? '有効' : '無効'}
              </Button>
            </div>

            {/* アクションボタン */}
            <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:gap-3">
              {canRetry && !this.state.isRetrying ? (
                <Button
                  onClick={this.handleManualRetry}
                  className="flex w-full items-center justify-center text-sm"
                  variant="default"
                >
                  <Zap className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">手動再試行 ({maxRetries - this.state.retryCount} 回まで)</span>
                </Button>
              ) : null}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex w-full items-center justify-center text-sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                  ページ再読み込み
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex w-full items-center justify-center text-sm"
                >
                  <Home className="mr-2 h-4 w-4 flex-shrink-0" />
                  ホームに戻る
                </Button>
              </div>
            </div>

            {/* 技術詳細（開発環境のみ） */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 sm:mb-6">
                <summary className="cursor-pointer text-xs font-semibold text-neutral-800 hover:text-blue-600 sm:text-sm dark:text-neutral-200 dark:hover:text-blue-400">
                  技術詳細（開発者向け）
                </summary>
                <div className="mt-3 rounded-md bg-neutral-200 p-3 sm:p-4 dark:bg-neutral-700">
                  <div className="space-y-2 overflow-x-auto text-xs sm:text-sm">
                    <p className="break-words">
                      <strong>エラー:</strong> {this.state.error.message}
                    </p>
                    <p>
                      <strong>分析コード:</strong> {analysis.code}
                    </p>
                    <p>
                      <strong>カテゴリ:</strong> {analysis.category}
                    </p>
                    <p>
                      <strong>復旧可能:</strong> {analysis.recoverable ? 'Yes' : 'No'}
                    </p>
                    {this.state.error.stack ? (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-blue-600 sm:text-sm dark:text-blue-400">
                          スタックトレース
                        </summary>
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-neutral-100 p-2 text-[10px] break-all whitespace-pre-wrap sm:text-xs dark:bg-neutral-800">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// === デフォルトエクスポート ===

export default GlobalErrorBoundary
