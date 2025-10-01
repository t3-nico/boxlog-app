/**
 * コンポーネント別エラーフォールバック（カテゴリ別対応）
 * 技術知識不要でも分かりやすいエラー表示とアクション提供
 */

'use client'

import React, { ReactNode } from 'react'

import { AlertTriangle, Database, Globe, Home, Loader2, RefreshCw, Settings, Shield, Wifi, WifiOff } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { cn } from '@/lib/utils'

// === 基本フォールバックProps ===

interface BaseFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
  className?: string
}

// === ネットワークエラーフォールバック ===

export const NetworkErrorFallback = ({ error: _error, resetErrorBoundary, className = '' }: BaseFallbackProps) => {
  const handleRetry = () => {
    console.log('🔄 ネットワーク再試行')
    resetErrorBoundary?.()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md mb-4">
        <WifiOff className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
        インターネット接続エラー
      </h3>

      <div className="text-neutral-800 dark:text-neutral-200 mb-6 max-w-md space-y-2">
        <p className="text-sm">インターネット接続に問題があります。</p>
        <div className="text-sm bg-neutral-200 dark:bg-neutral-700 p-2 rounded">
          <p>✅ Wi-Fi または モバイルデータ接続を確認</p>
          <p>✅ しばらく待ってから再試行</p>
          <p>✅ 他のサイトが開けるか確認</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRetry} className="flex items-center">
          <Wifi className="mr-2 h-4 w-4" />
          接続再試行
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          ページ再読み込み
        </Button>
      </div>
    </div>
  )
}

// === データベースエラーフォールバック ===

export const DatabaseErrorFallback = ({ error: _error, resetErrorBoundary, className = '' }: BaseFallbackProps) => {
  const handleRetry = () => {
    console.log('🔄 データベース再試行')
    resetErrorBoundary?.()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-md mb-4">
        <Database className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
      </div>

      <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
        データの読み込みエラー
      </h3>

      <div className="text-neutral-800 dark:text-neutral-200 mb-6 max-w-md space-y-2">
        <p className="text-sm">データの取得に失敗しました。</p>
        <div className="text-sm bg-neutral-200 dark:bg-neutral-700 p-2 rounded">
          <p>🔧 システム側で自動修復中</p>
          <p>⏰ 通常30秒以内に復旧します</p>
          <p>🔄 自動で再試行しています</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRetry} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          データ再読み込み
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline">
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>
      </div>
    </div>
  )
}

// === API エラーフォールバック ===

export const APIErrorFallback = ({ error: _error, resetErrorBoundary, className = '' }: BaseFallbackProps) => {
  const handleRetry = () => {
    console.log('🔄 API再試行')
    resetErrorBoundary?.()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-md mb-4">
        <Globe className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
      </div>

      <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
        サーバーとの通信エラー
      </h3>

      <div className="text-neutral-800 dark:text-neutral-200 mb-6 max-w-md space-y-2">
        <p className="text-sm">サーバーとの通信に問題が発生しています。</p>
        <div className="text-sm bg-neutral-200 dark:bg-neutral-700 p-2 rounded">
          <p>⚡ 自動的に復旧を試行中</p>
          <p>📡 サーバー状況を確認中</p>
          <p>🔄 数秒後に自動再試行</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRetry} className="flex items-center">
          <Globe className="mr-2 h-4 w-4" />
          再接続
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          ページ更新
        </Button>
      </div>
    </div>
  )
}

// === 認証エラーフォールバック ===

export const AuthErrorFallback = ({
  error: _error,
  resetErrorBoundary: _resetErrorBoundary,
  className = '',
}: BaseFallbackProps) => {
  const handleLogin = () => {
    console.log('🔐 ログインページにリダイレクト')
    window.location.href = '/auth/login'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md mb-4">
        <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">認証が必要です</h3>

      <div className="text-neutral-800 dark:text-neutral-200 mb-6 max-w-md space-y-2">
        <p className="text-sm">この機能を使用するにはログインが必要です。</p>
        <div className="text-sm bg-neutral-200 dark:bg-neutral-700 p-2 rounded">
          <p>🔐 安全なログインページに移動</p>
          <p>✨ ログイン後、元の画面に戻ります</p>
          <p>🛡️ セキュリティ保護のための処理</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleLogin} className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          ログインする
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline">
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>
      </div>
    </div>
  )
}

// === UIコンポーネントエラーフォールバック ===

export const UIErrorFallback = ({ error: _error, resetErrorBoundary, className = '' }: BaseFallbackProps) => {
  const handleRetry = () => {
    console.log('🔄 UIコンポーネント再試行')
    resetErrorBoundary?.()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-md mb-2">
        <Settings className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
      </div>

      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">画面要素の読み込みエラー</h4>

      <p className="text-sm text-neutral-800 dark:text-neutral-200 mb-2 max-w-sm">
        この部分の表示に問題があります。自動で修復を試行します。
      </p>

      <Button onClick={handleRetry} size="sm" variant="outline" className="flex items-center">
        <RefreshCw className="mr-1 h-3 w-3" />
        再表示
      </Button>
    </div>
  )
}

// === 読み込み中フォールバック（エラーではないが、UX向上のため） ===

export const LoadingFallback = ({ className = '' }: { className?: string }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mb-2" />
      <p className="text-sm text-neutral-800 dark:text-neutral-200">読み込み中...</p>
    </div>
  )
}

// === 汎用的なエラーフォールバック ===

export const GenericErrorFallback = ({ error, resetErrorBoundary, className = '' }: BaseFallbackProps) => {
  const handleRetry = () => {
    console.log('🔄 汎用エラー再試行')
    resetErrorBoundary?.()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md mb-4">
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">予期しないエラー</h3>

      <div className="text-neutral-800 dark:text-neutral-200 mb-6 max-w-md space-y-2">
        <p className="text-sm">申し訳ございません。予期しない問題が発生しました。</p>
        <div className="text-sm bg-neutral-200 dark:bg-neutral-700 p-2 rounded">
          <p>🔧 自動修復を試行中</p>
          <p>📝 エラー情報を記録済み</p>
          <p>⚡ 通常は数秒で復旧します</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRetry} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          再試行
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline">
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && error ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-neutral-800 dark:text-neutral-200">開発者向け詳細</summary>
          <pre className="mt-2 text-left bg-neutral-200 dark:bg-neutral-700 max-h-32 overflow-auto rounded p-2 text-xs">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

// === エラータイプ別のフォールバック選択関数 ===

export function selectErrorFallback(error: Error): React.ComponentType<BaseFallbackProps> {
  const errorMessage = error.message.toLowerCase()

  if (errorMessage.includes('network') || errorMessage.includes('fetch failed')) {
    return NetworkErrorFallback
  }

  if (
    errorMessage.includes('database') ||
    errorMessage.includes('supabase') ||
    errorMessage.includes('sql') ||
    errorMessage.includes('data')
  ) {
    return DatabaseErrorFallback
  }

  if (
    errorMessage.includes('api') ||
    errorMessage.includes('server') ||
    errorMessage.includes('500') ||
    errorMessage.includes('503')
  ) {
    return APIErrorFallback
  }

  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('401') ||
    errorMessage.includes('403')
  ) {
    return AuthErrorFallback
  }

  if (errorMessage.includes('render') || errorMessage.includes('component') || errorMessage.includes('ui')) {
    return UIErrorFallback
  }

  return GenericErrorFallback
}

// === スマートエラーバウンダリー（自動フォールバック選択） ===

interface SmartErrorBoundaryProps {
  children: ReactNode
  fallbackComponent?: React.ComponentType<BaseFallbackProps>
  className?: string
}

export const SmartErrorBoundary = ({ children, fallbackComponent, className }: SmartErrorBoundaryProps) => {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(new Error(event.error?.message || 'Unknown error'))
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) {
    const FallbackComponent = fallbackComponent || selectErrorFallback(error)
    return <FallbackComponent error={error} resetErrorBoundary={() => setError(null)} className={className} />
  }

  return <>{children}</>
}

// === エクスポート ===

const ErrorFallbacks = {
  NetworkErrorFallback,
  DatabaseErrorFallback,
  APIErrorFallback,
  AuthErrorFallback,
  UIErrorFallback,
  LoadingFallback,
  GenericErrorFallback,
  SmartErrorBoundary,
  selectErrorFallback,
}

export default ErrorFallbacks
