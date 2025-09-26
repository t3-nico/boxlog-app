/**
 * グローバルエラーバウンダリー（自動復旧システム）
 * 技術知識に関係なく、エラーから自動復旧する最高レベルのエラーハンドリング
 */

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

import { AlertTriangle, Home, RefreshCw, Shield, Zap } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import {
  createErrorToast,
  getErrorPattern,
  getRecommendedActions,
  getUserFriendlyMessage,
  isAutoRecoverable,
} from '@/config/error-patterns'
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

// === エラー分析ユーティリティ（error-patterns.ts統合版） ===

function analyzeError(error: Error): ErrorAnalysis {
  let code = ERROR_CODES.UI_COMPONENT_ERROR
  let recoverable = true
  let autoRetryable = false

  // 1. error-patterns.tsの推定機能を使用してエラーコードを特定
  const estimatedCode = estimateErrorCodeFromMessage(error.message)
  if (estimatedCode) {
    code = estimatedCode
  }

  // 2. error-patterns.tsから詳細な情報を取得
  const pattern = getErrorPattern(code)
  if (pattern) {
    recoverable = pattern.autoRecoverable || true
    autoRetryable = pattern.autoRecoverable
  }

  // 3. React固有のエラーの追加判定
  if (error.name === 'ChunkLoadError') {
    code = ERROR_CODES.UI_PERFORMANCE_ERROR
    autoRetryable = true
  }

  const category = getErrorCategory(code)
  const severity = getErrorSeverity(code)

  // 4. 推奨アクションを error-patterns.ts から取得
  const suggestedActions = getRecommendedActions(code)

  return {
    code,
    category,
    severity,
    recoverable,
    autoRetryable,
    suggestedActions,
  }
}

/**
 * エラーメッセージからエラーコードを推定（error-patterns.tsの推定ロジックを使用）
 */
function estimateErrorCodeFromMessage(message: string): ErrorCode | null {
  const lowerMessage = message.toLowerCase()

  // 認証関連
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
    if (lowerMessage.includes('expired') || lowerMessage.includes('timeout')) {
      return ERROR_CODES.AUTH_EXPIRED
    }
    if (lowerMessage.includes('invalid') || lowerMessage.includes('token')) {
      return ERROR_CODES.AUTH_INVALID_TOKEN
    }
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
      return ERROR_CODES.AUTH_NO_PERMISSION
    }
    return ERROR_CODES.AUTH_INVALID_TOKEN
  }

  // ネットワーク関連
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return ERROR_CODES.SYSTEM_NETWORK_ERROR
  }

  // API関連
  if (lowerMessage.includes('429') || lowerMessage.includes('rate limit')) {
    return ERROR_CODES.API_RATE_LIMIT
  }
  if (lowerMessage.includes('timeout')) {
    return ERROR_CODES.API_TIMEOUT
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('server error')) {
    return ERROR_CODES.API_SERVER_ERROR
  }

  // データ関連
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return ERROR_CODES.DATA_NOT_FOUND
  }
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return ERROR_CODES.DATA_DUPLICATE
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ERROR_CODES.DATA_VALIDATION_ERROR
  }

  // UI関連
  if (lowerMessage.includes('component') || lowerMessage.includes('render')) {
    return ERROR_CODES.UI_COMPONENT_ERROR
  }

  // ChunkLoadError など React固有
  if (lowerMessage.includes('chunklloaderror') || lowerMessage.includes('loading chunk')) {
    return ERROR_CODES.UI_PERFORMANCE_ERROR
  }

  return null
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

    // エラー分析（error-patterns.ts統合版）
    const analysis = analyzeError(error)

    // ユーザーフレンドリーなトースト通知を表示
    if (typeof window !== 'undefined') {
      const toastInfo = createErrorToast(analysis.code)
      // NOTE: 実際のトースト表示は toast ライブラリに依存
      console.log('🍞 トースト通知:', toastInfo)
    }

    // エラーログ出力（構造化・拡張版）
    console.group('🚨 GlobalErrorBoundary - エラー詳細（error-patterns.ts統合）')
    console.error('Error:', error)
    console.error('Error Analysis:', analysis)
    console.error('User Friendly Message:', getUserFriendlyMessage(analysis.code))
    console.error('Recommended Actions:', getRecommendedActions(analysis.code))
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

            {/* エラー分析・推奨アクション（error-patterns.ts統合版） */}
            <div className={`${spacing.margin.lg}`}>
              <h3 className={`${typography.body.semibold} ${colors.text.primary} ${spacing.margin.sm}`}>
                発生した問題と対処法
              </h3>
              <div className={`${spacing.padding.md} ${colors.background.elevated} ${rounded.component.input.text}`}>
                <div className="space-y-3">
                  {/* ユーザーフレンドリーメッセージ */}
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getErrorPattern(analysis.code)?.emoji || '⚠️'}</span>
                    <div>
                      <p className={`${typography.body.large} ${colors.text.primary} font-semibold`}>
                        {getUserFriendlyMessage(analysis.code)}
                      </p>
                      <p className={`${typography.body.base} ${colors.text.secondary}`}>
                        {getErrorPattern(analysis.code)?.description}
                      </p>
                    </div>
                  </div>

                  {/* 技術詳細（簡略版） */}
                  <div className={`${spacing.padding.sm} ${colors.background.base} ${rounded.component.input.text}`}>
                    <p className={`${typography.body.small} ${colors.text.secondary}`}>
                      <span className="font-semibold">分類:</span> {analysis.category} 系統 •
                      <span className="font-semibold">重要度:</span> {analysis.severity} •
                      <span className="font-semibold">自動復旧:</span>{' '}
                      {analysis.autoRetryable ? '✅ 可能' : '❌ 手動対応必要'}
                    </p>
                  </div>
                </div>

                {/* 推奨アクション（error-patterns.tsから取得） */}
                <div className="mt-4">
                  <p className={`${typography.body.semibold} ${colors.text.primary} mb-2`}>推奨アクション:</p>
                  <ul className="space-y-2">
                    {analysis.suggestedActions.map((action, index) => (
                      <li key={action} className={`${typography.body.small} ${colors.text.secondary} flex items-start`}>
                        <span className={`${colors.primary.DEFAULT} mr-2 font-semibold`}>{index + 1}.</span>
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
