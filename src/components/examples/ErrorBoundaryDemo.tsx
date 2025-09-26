/**
 * エラーバウンダリーデモコンポーネント
 * 技術知識不要のエラー復旧システムの使用例と動作確認
 */

'use client'

import { useState } from 'react'

import { AlertTriangle, Database, Globe, Shield, Wifi } from 'lucide-react'

import {
  AuthErrorFallback,
  DatabaseErrorFallback,
  NetworkErrorFallback,
  SmartErrorBoundary,
  useApiRetry,
  useAutoRetry,
  useDataFetchRetry,
} from '@/components/common'
import { Button } from '@/components/shadcn-ui/button'
import { colors, spacing, typography } from '@/config/theme'

// === エラー生成コンポーネント ===

const ErrorGenerator = () => {
  const [errorType, setErrorType] = useState<string>('')

  const generateError = (type: string) => {
    setErrorType(type)

    setTimeout(() => {
      switch (type) {
        case 'network':
          throw new Error('Network request failed: Unable to connect to server')

        case 'database':
          throw new Error('Supabase database connection timeout')

        case 'api':
          throw new Error('API server error: 500 Internal Server Error')

        case 'auth':
          throw new Error('Authentication failed: 401 Unauthorized access')

        case 'component':
          throw new Error('Component render error in TaskList')

        default:
          throw new Error('Unexpected error occurred')
      }
    }, 100)
  }

  return (
    <div className={`${spacing.padding.lg} ${colors.background.surface} rounded-lg border`}>
      <h3 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.md}`}>
        エラー生成テスト（開発・デバッグ用）
      </h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Button onClick={() => generateError('network')} variant="outline" className="flex items-center">
          <Wifi className="mr-2 h-4 w-4" />
          ネットワークエラー
        </Button>

        <Button onClick={() => generateError('database')} variant="outline" className="flex items-center">
          <Database className="mr-2 h-4 w-4" />
          データベースエラー
        </Button>

        <Button onClick={() => generateError('api')} variant="outline" className="flex items-center">
          <Globe className="mr-2 h-4 w-4" />
          APIエラー
        </Button>

        <Button onClick={() => generateError('auth')} variant="outline" className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          認証エラー
        </Button>

        <Button onClick={() => generateError('component')} variant="outline" className="flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          コンポーネントエラー
        </Button>

        <Button onClick={() => generateError('unknown')} variant="outline">
          汎用エラー
        </Button>
      </div>

      {errorType ? (
        <p className={`${typography.body.small} ${colors.text.secondary} ${spacing.margin.sm}`}>
          {errorType}エラーを生成しました...
        </p>
      ) : null}
    </div>
  )
}

// === リトライフック使用例 ===

const RetryHookDemo = () => {
  // API リトライの例
  const apiRetry = useApiRetry(async () => {
    const response = await fetch('/api/test-endpoint')
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  })

  // データフェッチリトライの例
  const dataRetry = useDataFetchRetry(async () => {
    // データベースから取得をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (Math.random() > 0.7) throw new Error('Database connection failed')
    return { data: 'サンプルデータ', timestamp: new Date().toISOString() }
  })

  // 汎用自動リトライの例
  const customRetry = useAutoRetry(
    async () => {
      if (Math.random() > 0.5) throw new Error('Random error for testing')
      return '成功！'
    },
    {
      maxRetries: 2,
      initialDelay: 500,
      shouldRetry: (error, retryCount) => {
        return error.message.includes('Random') && retryCount < 2
      },
      onRetry: (error, retryCount) => {
        console.log(`リトライ中... ${retryCount + 1}回目:`, error.message)
      },
    }
  )

  return (
    <div className={`${spacing.padding.lg} ${colors.background.surface} rounded-lg border`}>
      <h3 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.md}`}>
        自動リトライフック使用例
      </h3>

      <div className="space-y-4">
        {/* API リトライ */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`${typography.body.semibold} ${colors.text.primary}`}>API リトライ</h4>
            <p className={`${typography.body.small} ${colors.text.secondary}`}>
              ステータス: {apiRetry.isLoading ? '実行中' : apiRetry.error ? 'エラー' : '待機中'}
              {apiRetry.isRetrying ? ` (${apiRetry.retryCount}/${3}回目)` : null}
            </p>
          </div>
          <Button onClick={apiRetry.execute} disabled={apiRetry.isLoading} size="sm">
            API実行
          </Button>
        </div>

        {/* データフェッチリトライ */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`${typography.body.semibold} ${colors.text.primary}`}>データフェッチ</h4>
            <p className={`${typography.body.small} ${colors.text.secondary}`}>
              ステータス: {dataRetry.isLoading ? '読み込み中' : dataRetry.error ? 'エラー' : '待機中'}
              {dataRetry.isRetrying ? ` (自動復旧中...)` : null}
            </p>
          </div>
          <Button onClick={dataRetry.execute} disabled={dataRetry.isLoading} size="sm">
            データ取得
          </Button>
        </div>

        {/* カスタムリトライ */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`${typography.body.semibold} ${colors.text.primary}`}>カスタムリトライ</h4>
            <p className={`${typography.body.small} ${colors.text.secondary}`}>
              進捗: {Math.round(customRetry.progress * 100)}%{customRetry.isRetrying ? ' (自動再試行中)' : null}
            </p>
          </div>
          <Button onClick={customRetry.execute} disabled={customRetry.isLoading} size="sm">
            カスタム実行
          </Button>
        </div>
      </div>
    </div>
  )
}

// === スマートエラーバウンダリー使用例 ===

const SmartBoundaryDemo = () => {
  return (
    <div className={`${spacing.padding.lg} ${colors.background.surface} rounded-lg border`}>
      <h3 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.md}`}>
        スマートエラーバウンダリー（自動判定）
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ネットワークエラー例 */}
        <SmartErrorBoundary>
          <div className={`${colors.background.elevated} ${spacing.padding.md} rounded`}>
            <h4 className={`${typography.body.semibold} ${colors.text.primary}`}>ネットワークコンポーネント</h4>
            <ErrorGenerator />
          </div>
        </SmartErrorBoundary>

        {/* データベースエラー例 */}
        <SmartErrorBoundary fallbackComponent={DatabaseErrorFallback}>
          <div className={`${colors.background.elevated} ${spacing.padding.md} rounded`}>
            <h4 className={`${typography.body.semibold} ${colors.text.primary}`}>データベースコンポーネント</h4>
            <p className={`${typography.body.small} ${colors.text.secondary}`}>カスタムフォールバックを指定した例</p>
          </div>
        </SmartErrorBoundary>
      </div>
    </div>
  )
}

// === メインデモコンポーネント ===

const ErrorBoundaryDemo = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`${typography.heading.h2} ${colors.text.primary} ${spacing.margin.md}`}>
          エラーバウンダリー自動復旧システム
        </h2>
        <p className={`${typography.body.base} ${colors.text.secondary} mx-auto max-w-2xl`}>
          技術知識に関係なく、エラーから自動復旧するシステムのデモンストレーション。
          以下のコンポーネントでエラーを発生させて、自動復旧の様子を確認してください。
        </p>
      </div>

      {/* グローバルエラーバウンダリーに包まれているため、どのエラーも捕捉される */}
      <ErrorGenerator />

      <RetryHookDemo />

      <SmartBoundaryDemo />

      {/* 個別フォールバック例 */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className={`${colors.background.surface} ${spacing.padding.lg} rounded-lg border`}>
          <h3 className={`${typography.heading.h4} ${colors.text.primary} ${spacing.margin.md}`}>
            ネットワークエラーフォールバック
          </h3>
          <NetworkErrorFallback
            error={new Error('Network request failed')}
            resetErrorBoundary={() => console.log('ネットワークエラーリセット')}
          />
        </div>

        <div className={`${colors.background.surface} ${spacing.padding.lg} rounded-lg border`}>
          <h3 className={`${typography.heading.h4} ${colors.text.primary} ${spacing.margin.md}`}>
            認証エラーフォールバック
          </h3>
          <AuthErrorFallback
            error={new Error('Authentication failed')}
            resetErrorBoundary={() => console.log('認証エラーリセット')}
          />
        </div>
      </div>

      {/* システム説明 */}
      <div className={`${colors.background.surface} ${spacing.padding.lg} rounded-lg border`}>
        <h3 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.md}`}>💡 システム特徴</h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className={`${typography.body.semibold} ${colors.text.primary} ${spacing.margin.sm}`}>🤖 自動化機能</h4>
            <ul className={`${typography.body.small} ${colors.text.secondary} space-y-1`}>
              <li>• エラーの自動分類・分析</li>
              <li>• 復旧可能性の自動判定</li>
              <li>• 指数バックオフによる自動リトライ</li>
              <li>• エラー情報の構造化記録</li>
            </ul>
          </div>

          <div>
            <h4 className={`${typography.body.semibold} ${colors.text.primary} ${spacing.margin.sm}`}>
              👤 ユーザー体験
            </h4>
            <ul className={`${typography.body.small} ${colors.text.secondary} space-y-1`}>
              <li>• 技術知識不要の分かりやすい説明</li>
              <li>• 明確な対処法の提示</li>
              <li>• ワンクリック修復機能</li>
              <li>• 復旧進捗のリアルタイム表示</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundaryDemo
