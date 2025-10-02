// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * 🚨 BoxLog ユーザー向けメッセージ統一システム
 *
 * Issue #338: 技術知識不要の開発環境構築
 * Issue #350: エラーパターン辞書システム実装
 *
 * 機能:
 * - 統一されたエラーメッセージ表示
 * - アプリケーション全体での一貫したエラーUX
 * - トースト・アラート・通知の統一
 * - React Hook との連携
 * - Sentry / 監視サービス統合
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  createErrorToast,
  getRecommendedActions,
  getUserFriendlyMessage,
  isAutoRecoverable,
} from '@/config/error-patterns'
import { ERROR_CODES, ErrorCode } from '@/constants/errorCodes'

// ==============================================
// 統一エラーハンドリング型定義
// ==============================================

export interface UnifiedErrorInfo {
  /** エラーID（追跡用） */
  id: string
  /** 元のエラー */
  originalError: Error
  /** 推定エラーコード */
  errorCode: ErrorCode
  /** ユーザーフレンドリーメッセージ */
  userMessage: string
  /** 推奨アクション */
  recommendedActions: string[]
  /** 自動復旧可能かどうか */
  autoRecoverable: boolean
  /** 発生時刻 */
  timestamp: Date
  /** 追加コンテキスト */
  context?: Record<string, unknown>
}

export interface ErrorHandlerOptions {
  /** 自動トースト表示 */
  showToast?: boolean
  /** コンソール出力 */
  logToConsole?: boolean
  /** Sentry 送信 */
  sendToSentry?: boolean
  /** 追加コンテキスト情報 */
  context?: Record<string, unknown>
  /** カスタムエラーハンドリング */
  onError?: (info: UnifiedErrorInfo) => void
}

// ==============================================
// メインエラーハンドリングクラス
// ==============================================

export class UnifiedErrorHandler {
  private static instance: UnifiedErrorHandler
  private errorHistory: UnifiedErrorInfo[] = []
  private maxHistorySize = 50

  static getInstance(): UnifiedErrorHandler {
    if (!UnifiedErrorHandler.instance) {
      UnifiedErrorHandler.instance = new UnifiedErrorHandler()
    }
    return UnifiedErrorHandler.instance
  }

  /**
   * エラーを統一的に処理
   */
  handleError(error: Error, options: ErrorHandlerOptions = {}): UnifiedErrorInfo {
    const { showToast = true, logToConsole = true, sendToSentry = true, context = {}, onError } = options

    // エラー情報を構造化
    const errorInfo = this.createUnifiedErrorInfo(error, context)

    // 履歴に追加
    this.addToHistory(errorInfo)

    // コンソール出力
    if (logToConsole) {
      this.logError(errorInfo)
    }

    // トースト表示
    if (showToast && typeof window !== 'undefined') {
      this.showErrorToast(errorInfo)
    }

    // Sentry 送信
    if (sendToSentry && typeof window !== 'undefined' && (window as any).Sentry) {
      this.sendToSentry(errorInfo)
    }

    // カスタムハンドラー実行
    if (onError) {
      try {
        onError(errorInfo)
      } catch (handlerError) {
        console.error('🚨 エラーハンドラー内でエラーが発生:', handlerError)
      }
    }

    return errorInfo
  }

  /**
   * UnifiedErrorInfo を作成
   */
  private createUnifiedErrorInfo(error: Error, context: Record<string, unknown>): UnifiedErrorInfo {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    const errorCode = this.estimateErrorCode(error)
    const userMessage = getUserFriendlyMessage(errorCode)
    const recommendedActions = getRecommendedActions(errorCode)
    const autoRecoverable = isAutoRecoverable(errorCode)

    return {
      id,
      originalError: error,
      errorCode,
      userMessage,
      recommendedActions,
      autoRecoverable,
      timestamp: new Date(),
      context,
    }
  }

  /**
   * エラーコードを推定（複雑度を下げるため分割）
   */
  private estimateErrorCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase()

    // 認証関連のチェック
    const authCode = this.checkAuthErrors(message)
    if (authCode) return authCode

    // ネットワーク・API関連のチェック
    const networkApiCode = this.checkNetworkApiErrors(message)
    if (networkApiCode) return networkApiCode

    // データ・UI関連のチェック
    const dataUiCode = this.checkDataUiErrors(message)
    if (dataUiCode) return dataUiCode

    // デフォルト
    return ERROR_CODES.UI_COMPONENT_ERROR
  }

  private checkAuthErrors(message: string): ErrorCode | null {
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
      if (message.includes('expired')) return ERROR_CODES.AUTH_EXPIRED
      if (message.includes('invalid')) return ERROR_CODES.AUTH_INVALID_TOKEN
      if (message.includes('forbidden')) return ERROR_CODES.AUTH_NO_PERMISSION
      return ERROR_CODES.AUTH_INVALID_TOKEN
    }
    return null
  }

  private checkNetworkApiErrors(message: string): ErrorCode | null {
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_CODES.SYSTEM_NETWORK_ERROR
    }
    if (message.includes('429')) return ERROR_CODES.API_RATE_LIMIT
    if (message.includes('timeout')) return ERROR_CODES.API_TIMEOUT
    if (message.includes('500')) return ERROR_CODES.API_SERVER_ERROR
    return null
  }

  private checkDataUiErrors(message: string): ErrorCode | null {
    if (message.includes('not found') || message.includes('404')) {
      return ERROR_CODES.DATA_NOT_FOUND
    }
    if (message.includes('duplicate')) return ERROR_CODES.DATA_DUPLICATE
    if (message.includes('validation')) return ERROR_CODES.DATA_VALIDATION_ERROR
    if (message.includes('component') || message.includes('render')) {
      return ERROR_CODES.UI_COMPONENT_ERROR
    }
    return null
  }

  /**
   * 構造化エラーログ出力
   */
  private logError(info: UnifiedErrorInfo): void {
    console.group(`🚨 統一エラーハンドリング - ${info.id}`)
    console.error('📋 エラー概要:', {
      errorCode: info.errorCode,
      userMessage: info.userMessage,
      timestamp: info.timestamp.toISOString(),
    })
    console.error('🔧 元のエラー:', info.originalError)
    console.error('✅ 推奨アクション:', info.recommendedActions)
    console.error('🔄 自動復旧可能:', info.autoRecoverable)
    if (Object.keys(info.context || {}).length > 0) {
      console.error('📍 コンテキスト:', info.context)
    }
    console.groupEnd()
  }

  /**
   * トースト表示
   */
  private showErrorToast(info: UnifiedErrorInfo): void {
    const toastInfo = createErrorToast(info.errorCode)

    // 実際のトーストライブラリとの統合はプロジェクトの toast システムに依存
    // ここでは console.log でモックアップ
    console.log('🍞 トースト表示:', toastInfo)

    // react-hot-toast, sonner, react-toastify などとの統合例:
    // if ((window as any).toast) {
    //   (window as any).toast.error(`${toastInfo.emoji} ${toastInfo.message}`, {
    //     duration: toastInfo.duration,
    //   })
    // }
  }

  /**
   * Sentry 送信
   */
  private sendToSentry(info: UnifiedErrorInfo): void {
    const Sentry = (window as any).Sentry
    if (!Sentry) return

    Sentry.withScope((scope: any) => {
      scope.setTag('error_code', info.errorCode)
      scope.setTag('auto_recoverable', info.autoRecoverable)
      scope.setContext('unified_error_info', {
        id: info.id,
        userMessage: info.userMessage,
        recommendedActions: info.recommendedActions,
        timestamp: info.timestamp.toISOString(),
        context: info.context,
      })

      Sentry.captureException(info.originalError)
    })
  }

  /**
   * 履歴に追加
   */
  private addToHistory(info: UnifiedErrorInfo): void {
    this.errorHistory.unshift(info)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * エラー履歴を取得
   */
  getErrorHistory(): UnifiedErrorInfo[] {
    return [...this.errorHistory]
  }

  /**
   * 履歴をクリア
   */
  clearHistory(): void {
    this.errorHistory = []
  }

  /**
   * 特定のエラーコードの統計情報を取得
   */
  getErrorStats(): Record<ErrorCode, number> {
    const stats: Record<ErrorCode, number> = {} as any

    this.errorHistory.forEach((info) => {
      stats[info.errorCode] = (stats[info.errorCode] || 0) + 1
    })

    return stats
  }
}

// ==============================================
// React Hook インテグレーション
// ==============================================

/**
 * 統一エラーハンドリング用 React Hook
 */
export function useUnifiedErrorHandler(options: ErrorHandlerOptions = {}) {
  const [recentErrors, setRecentErrors] = useState<UnifiedErrorInfo[]>([])
  const handler = UnifiedErrorHandler.getInstance()

  /**
   * エラーハンドラー関数
   */
  const handleError = useCallback(
    (error: Error, customOptions?: ErrorHandlerOptions): UnifiedErrorInfo => {
      const finalOptions = { ...options, ...customOptions }
      const errorInfo = handler.handleError(error, finalOptions)

      // 最新のエラー状態を更新
      setRecentErrors(handler.getErrorHistory().slice(0, 5))

      return errorInfo
    },
    [handler, options]
  )

  /**
   * Promise エラーハンドラー
   */
  const handleAsyncError = useCallback(
    async <T>(asyncFn: () => Promise<T>, customOptions?: ErrorHandlerOptions): Promise<T | null> => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), customOptions)
        return null
      }
    },
    [handleError]
  )

  /**
   * Try-Catch ラッパー
   */
  const safeExecute = useCallback(
    <T>(fn: () => T, customOptions?: ErrorHandlerOptions): T | null => {
      try {
        return fn()
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), customOptions)
        return null
      }
    },
    [handleError]
  )

  // コンポーネントマウント時にエラー履歴を初期化
  useEffect(() => {
    setRecentErrors(handler.getErrorHistory().slice(0, 5))
  }, [handler])

  return {
    /** エラーハンドラー関数 */
    handleError,
    /** 非同期エラーハンドラー */
    handleAsyncError,
    /** 安全実行ラッパー */
    safeExecute,
    /** 最新のエラー一覧（最大5件） */
    recentErrors,
    /** エラー統計情報取得 */
    getErrorStats: () => handler.getErrorStats(),
    /** エラー履歴クリア */
    clearHistory: () => {
      handler.clearHistory()
      setRecentErrors([])
    },
  }
}

// ==============================================
// 便利なショートカット関数
// ==============================================

/**
 * シンプルなエラーハンドリング（グローバル使用）
 */
export function handleGlobalError(error: Error, context?: Record<string, unknown>): UnifiedErrorInfo {
  const handler = UnifiedErrorHandler.getInstance()
  return handler.handleError(error, { context })
}

/**
 * Promise 用エラーハンドリング
 */
export async function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T | null> {
  try {
    return await asyncFn()
  } catch (error) {
    handleGlobalError(error instanceof Error ? error : new Error(String(error)), context)
    return null
  }
}

/**
 * エラー統計を取得
 */
export function getGlobalErrorStats(): Record<ErrorCode, number> {
  return UnifiedErrorHandler.getInstance().getErrorStats()
}

// ==============================================
// TypeScript 型エクスポート
// ==============================================

export type { ErrorHandlerOptions, UnifiedErrorInfo }

// ==============================================
// デフォルトエクスポート
// ==============================================

const unifiedErrorHandlerExports = {
  UnifiedErrorHandler,
  useUnifiedErrorHandler,
  handleGlobalError,
  handleAsyncError,
  getGlobalErrorStats,
}

export default unifiedErrorHandlerExports
