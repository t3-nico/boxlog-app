/**
 * グローバルエラーバウンダリー（自動復旧システム）
 * 技術知識に関係なく、エラーから自動復旧する最高レベルのエラーハンドリング
 */

'use client'

import { Component, ErrorInfo } from 'react'

import { AlertTriangle, Home, RefreshCw, Shield, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createErrorToast, getUserFriendlyMessage, isAutoRecoverable } from '@/config/error-patterns'
import { cn } from '@/lib/utils'
import { analyzeError, type ErrorAnalysis } from '@/lib/error-analysis'

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
        <div
          className={cn(
            'flex min-h-screen items-center justify-center p-4 sm:p-6',
            this.props.className
          )}
        >
          <div className="w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-md shadow-lg p-4 sm:p-6">
            {/* エラーヘッダー */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/30 rounded-md self-start">
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 break-words">
                    システムエラーが発生しました
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 mt-1 break-all">
                    エラーID: {this.state.errorId} • 重要度: {analysis.severity}
                  </p>
                </div>
              </div>
            </div>

            {/* 自動復旧状況 */}
            {this.state.isRetrying ? (
              <div className="mb-4 p-3 sm:p-4 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-start sm:items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base">自動復旧中...</p>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 break-words">
                    しばらくお待ちください（試行回数: {this.state.retryCount + 1}/{maxRetries}）
                  </p>
                </div>
              </div>
            ) : null}

            {/* エラー分析・推奨アクション（error-patterns.ts統合版） */}
            <div className="mb-4 sm:mb-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-sm sm:text-base">発生した問題と対処法</h3>
              <div className="p-3 sm:p-4 bg-neutral-200 dark:bg-neutral-700 rounded-md">
                <div className="space-y-3">
                  {/* ユーザーフレンドリーメッセージ */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-neutral-900 dark:text-neutral-100 font-semibold break-words">
                        {getUserFriendlyMessage(analysis.code)}
                      </p>
                      {/* TODO: Implement getErrorPattern function */}
                      {/* <p className="text-sm text-neutral-800 dark:text-neutral-200">
                        {getErrorPattern(analysis.code)?.description}
                      </p> */}
                    </div>
                  </div>

                  {/* 技術詳細（簡略版） */}
                  <div className="p-2 sm:p-3 bg-neutral-100 dark:bg-neutral-900 rounded-md overflow-x-auto">
                    <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                      <span className="font-semibold">分類:</span> {analysis.category} 系統 •{' '}
                      <span className="font-semibold">重要度:</span> {analysis.severity} •{' '}
                      <span className="font-semibold">自動復旧:</span>{' '}
                      {analysis.autoRetryable ? '✅ 可能' : '❌ 手動対応必要'}
                    </p>
                  </div>
                </div>

                {/* 推奨アクション（error-patterns.tsから取得） */}
                <div className="mt-3 sm:mt-4">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-sm sm:text-base">推奨アクション:</p>
                  <ul className="space-y-2">
                    {analysis.suggestedActions.map((action, index) => (
                      <li key={action} className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">{index + 1}.</span>
                        <span className="flex-1 min-w-0 break-words">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 自動復旧設定 */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">自動復旧システム</span>
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
            <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-3">
              {canRetry && !this.state.isRetrying ? (
                <Button onClick={this.handleManualRetry} className="w-full flex items-center justify-center text-sm" variant="default">
                  <Zap className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">手動再試行 ({maxRetries - this.state.retryCount} 回まで)</span>
                </Button>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Button onClick={this.handleReload} variant="outline" className="w-full flex items-center justify-center text-sm">
                  <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                  ページ再読み込み
                </Button>

                <Button onClick={this.handleGoHome} variant="outline" className="w-full flex items-center justify-center text-sm">
                  <Home className="mr-2 h-4 w-4 flex-shrink-0" />
                  ホームに戻る
                </Button>
              </div>
            </div>

            {/* 技術詳細（開発環境のみ） */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 sm:mb-6">
                <summary className="cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm">
                  技術詳細（開発者向け）
                </summary>
                <div className="mt-3 p-3 sm:p-4 bg-neutral-200 dark:bg-neutral-700 rounded-md">
                  <div className="space-y-2 text-xs sm:text-sm overflow-x-auto">
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
                        <summary className="text-blue-600 dark:text-blue-400 cursor-pointer text-xs sm:text-sm">スタックトレース</summary>
                        <pre className="mt-2 text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-800 max-h-40 overflow-auto rounded p-2 break-all whitespace-pre-wrap">
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
