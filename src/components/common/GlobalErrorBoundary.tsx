/**
 * グローバルエラーバウンダリー（自動復旧システム）
 * 技術知識に関係なく、エラーから自動復旧する最高レベルのエラーハンドリング
 */

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

import { AlertTriangle, Home, RefreshCw, Shield, Zap } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { colors, elevation, rounded, spacing, typography } from '@/config/theme'
import { ERROR_CODES, ErrorCode, getErrorCategory, getErrorSeverity } from '@/constants/errorCodes'

// === 型定義 ===

interface Props {
  children: ReactNode
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error, errorInfo: ErrorInfo, retryCount: number) => void
  className?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
  retryCount: number
  isRetrying: boolean
  autoRetryEnabled: boolean
  lastErrorTime: number
}

interface ErrorAnalysis {
  code: ErrorCode
  category: string
  severity: string
  recoverable: boolean
  autoRetryable: boolean
  suggestedActions: string[]
}

// === エラー分析ユーティリティ ===

function analyzeError(error: Error): ErrorAnalysis {
  let code = ERROR_CODES.UI_COMPONENT_ERROR
  let recoverable = true
  let autoRetryable = false
  const suggestedActions: string[] = []

  // エラーメッセージから自動分類
  if (error.message.includes('Network') || error.message.includes('fetch')) {
    code = ERROR_CODES.SYSTEM_NETWORK_ERROR
    autoRetryable = true
    suggestedActions.push('ネットワーク接続を確認してください')
  } else if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
    code = ERROR_CODES.UI_PERFORMANCE_ERROR
    autoRetryable = true
    suggestedActions.push('ページを再読み込みします')
  } else if (error.message.includes('404') || error.message.includes('Not Found')) {
    code = ERROR_CODES.DATA_NOT_FOUND
    recoverable = false
    suggestedActions.push('ホームページから再度アクセスしてください')
  } else if (error.message.includes('500') || error.message.includes('Internal Server')) {
    code = ERROR_CODES.API_SERVER_ERROR
    autoRetryable = true
    suggestedActions.push('サーバーの問題です。しばらく待ってから再試行してください')
  } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    code = ERROR_CODES.API_TIMEOUT
    autoRetryable = true
    suggestedActions.push('接続がタイムアウトしました。再試行します')
  }

  // React固有のエラー
  if (error.name === 'ChunkLoadError') {
    code = ERROR_CODES.UI_PERFORMANCE_ERROR
    autoRetryable = true
    suggestedActions.push('新しいバージョンが利用可能です。ページを更新します')
  }

  const category = getErrorCategory(code)
  const severity = getErrorSeverity(code)

  return {
    code,
    category,
    severity,
    recoverable,
    autoRetryable,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : ['問題を解決するため、自動的に再試行します'],
  }
}

// === 自動復旧機能付きグローバルエラーバウンダリー ===

export class GlobalErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout
  private autoRetryTimeoutId?: NodeJS.Timeout

  constructor(props: Props) {
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

  static getDerivedStateFromError(error: Error): Partial<State> {
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

    // エラー分析
    const analysis = analyzeError(error)

    // エラーログ出力（構造化）
    console.group('🚨 GlobalErrorBoundary - エラー詳細')
    console.error('Error:', error)
    console.error('Error Analysis:', analysis)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error ID:', this.state.errorId)
    console.error('Retry Count:', retryCount)
    console.groupEnd()

    // プロップスのエラーハンドラーを呼び出し
    onError?.(error, errorInfo, retryCount)

    // 自動復旧のロジック
    if (analysis.autoRetryable && retryCount < maxRetries && this.state.autoRetryEnabled) {
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
      error: undefined,
      errorInfo: undefined,
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
          className={`flex min-h-screen items-center justify-center ${spacing.padding.md} ${this.props.className || ''}`}
        >
          <div
            className={`w-full max-w-2xl ${colors.background.surface} ${rounded.component.card.base} ${elevation.lg} ${spacing.padding.lg}`}
          >
            {/* エラーヘッダー */}
            <div className={`flex items-center ${spacing.margin.md}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-3 ${colors.semantic.error.bg} ${rounded.component.button.md}`}>
                  <AlertTriangle className={`h-8 w-8 ${colors.semantic.error.text}`} />
                </div>
                <div>
                  <h1 className={`${typography.heading.h2} ${colors.text.primary}`}>システムエラーが発生しました</h1>
                  <p className={`${typography.body.small} ${colors.text.secondary}`}>
                    エラーID: {this.state.errorId} • 重要度: {analysis.severity}
                  </p>
                </div>
              </div>
            </div>

            {/* 自動復旧状況 */}
            {this.state.isRetrying ? (
              <div
                className={`${spacing.margin.md} ${spacing.padding.md} ${colors.primary.bg} ${rounded.component.input.text} flex items-center space-x-3`}
              >
                <RefreshCw className={`h-5 w-5 ${colors.primary.DEFAULT} animate-spin`} />
                <div>
                  <p className={`${typography.body.semibold} ${colors.primary.DEFAULT}`}>自動復旧中...</p>
                  <p className={`${typography.body.small} ${colors.primary.text}`}>
                    しばらくお待ちください（試行回数: {this.state.retryCount + 1}/{maxRetries}）
                  </p>
                </div>
              </div>
            ) : null}

            {/* エラー分析・推奨アクション */}
            <div className={`${spacing.margin.lg}`}>
              <h3 className={`${typography.body.semibold} ${colors.text.primary} ${spacing.margin.sm}`}>
                発生した問題と対処法
              </h3>
              <div className={`${spacing.padding.md} ${colors.background.elevated} ${rounded.component.input.text}`}>
                <div className="space-y-2">
                  <p className={`${typography.body.base} ${colors.text.primary}`}>
                    <span className="font-semibold">問題:</span> {analysis.category} 系統の{analysis.severity}
                    レベルエラー
                  </p>
                  <p className={`${typography.body.base} ${colors.text.secondary}`}>
                    <span className="font-semibold">自動復旧:</span>{' '}
                    {analysis.autoRetryable ? '✅ 可能（自動で修復します）' : '❌ 手動対応が必要'}
                  </p>
                </div>

                {/* 推奨アクション */}
                <div className="mt-4">
                  <p className={`${typography.body.semibold} ${colors.text.primary} mb-2`}>推奨アクション:</p>
                  <ul className="space-y-1">
                    {analysis.suggestedActions.map((action) => (
                      <li key={action} className={`${typography.body.small} ${colors.text.secondary} flex items-start`}>
                        <span className={`${colors.primary.DEFAULT} mr-2`}>•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 自動復旧設定 */}
            <div className={`${spacing.margin.lg} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <Shield className={`h-5 w-5 ${colors.primary.DEFAULT}`} />
                <span className={`${typography.body.base} ${colors.text.primary}`}>自動復旧システム</span>
              </div>
              <Button
                onClick={this.toggleAutoRetry}
                variant={this.state.autoRetryEnabled ? 'default' : 'outline'}
                size="sm"
              >
                {this.state.autoRetryEnabled ? '有効' : '無効'}
              </Button>
            </div>

            {/* アクションボタン */}
            <div className={`${spacing.margin.lg} flex flex-col gap-3 sm:flex-row`}>
              {canRetry && !this.state.isRetrying ? (
                <Button onClick={this.handleManualRetry} className="flex items-center justify-center" variant="default">
                  <Zap className="mr-2 h-4 w-4" />
                  手動再試行 ({maxRetries - this.state.retryCount} 回まで)
                </Button>
              ) : null}

              <Button onClick={this.handleReload} variant="outline" className="flex items-center justify-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                ページ再読み込み
              </Button>

              <Button onClick={this.handleGoHome} variant="outline" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </div>

            {/* 技術詳細（開発環境のみ） */}
            {process.env.NODE_ENV === 'development' && (
              <details className={`${spacing.margin.lg}`}>
                <summary
                  className={`cursor-pointer ${typography.body.semibold} ${colors.text.secondary} hover:text-primary`}
                >
                  技術詳細（開発者向け）
                </summary>
                <div
                  className={`mt-3 ${spacing.padding.md} ${colors.background.elevated} ${rounded.component.input.text}`}
                >
                  <div className="space-y-2 text-sm">
                    <p>
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
                        <summary className="text-primary cursor-pointer">スタックトレース</summary>
                        <pre
                          className={`mt-2 text-xs ${colors.background.elevated} max-h-40 overflow-auto rounded p-2`}
                        >
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
