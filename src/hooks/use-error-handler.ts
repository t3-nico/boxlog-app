/**
 * React Hook エラーハンドラー
 * エラーパターン辞書システムとReactアプリケーションを統合
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  AppError,
  createAppError,
  type ErrorCode,
  type ErrorHandlingResult,
  ERROR_CODES
} from '@/config/error-patterns'
import {
  globalErrorHandler,
  handleError,
  handleWithRecovery,
  type ErrorHandlingOptions,
  type NotificationConfig
} from '@/lib/error-handler'
import { reportToSentry } from '@/lib/sentry'

/**
 * エラーハンドラーHookの設定
 */
export interface UseErrorHandlerOptions {
  enableAutoRecovery?: boolean       // 自動復旧を有効にするか
  enableNotifications?: boolean      // ユーザー通知を有効にするか
  enableSentry?: boolean            // Sentryレポートを有効にするか
  defaultContext?: Record<string, unknown> // デフォルトコンテキスト
  onError?: (error: AppError) => void // エラー発生時のコールバック
  onRecovery?: (result: ErrorHandlingResult) => void // 復旧時のコールバック
}

/**
 * エラー状態の管理
 */
export interface ErrorState {
  hasError: boolean                  // エラーが発生しているか
  error: AppError | null            // 現在のエラー
  isRecovering: boolean             // 復旧中か
  lastRecoveryAttempt: Date | null  // 最後の復旧試行時刻
  recoveryCount: number             // 復旧試行回数
}

/**
 * 通知状態の管理
 */
export interface NotificationState {
  visible: boolean                   // 通知が表示されているか
  message: string                   // 通知メッセージ
  severity: 'low' | 'medium' | 'high' | 'critical' // 重要度
  config: NotificationConfig        // 通知設定
}

/**
 * エラーハンドラーHookの戻り値
 */
export interface UseErrorHandlerReturn {
  // エラー状態
  errorState: ErrorState
  notificationState: NotificationState

  // エラー処理関数
  handleError: (error: Error | AppError, errorCode?: ErrorCode, options?: ErrorHandlingOptions) => Promise<void>
  handleWithRecovery: <T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    options?: ErrorHandlingOptions
  ) => Promise<ErrorHandlingResult<T>>

  // 状態管理関数
  clearError: () => void
  dismissNotification: () => void
  retry: () => Promise<void>

  // ユーティリティ関数
  isErrorRecoverable: () => boolean
  getErrorStats: () => Record<string, unknown>
}

/**
 * エラーハンドラーHook
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    enableAutoRecovery = true,
    enableNotifications = true,
    enableSentry = true,
    defaultContext = {},
    onError,
    onRecovery
  } = options

  // エラー状態
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isRecovering: false,
    lastRecoveryAttempt: null,
    recoveryCount: 0
  })

  // 通知状態
  const [notificationState, setNotificationState] = useState<NotificationState>({
    visible: false,
    message: '',
    severity: 'medium',
    config: { type: 'toast' }
  })

  // 最後に実行された操作を保持（リトライ用）
  const lastOperationRef = useRef<{
    operation: () => Promise<any>
    errorCode: ErrorCode
    options?: ErrorHandlingOptions
  } | null>(null)

  // 通知ハンドラーの登録
  useEffect(() => {
    if (!enableNotifications) return

    const notificationHandler = (message: string, config: NotificationConfig) => {
      setNotificationState({
        visible: true,
        message,
        severity: 'medium', // デフォルト値、実際は config から推定
        config
      })

      // 自動非表示
      if (config.duration && config.duration > 0) {
        setTimeout(() => {
          setNotificationState(prev => ({ ...prev, visible: false }))
        }, config.duration)
      }
    }

    globalErrorHandler.registerNotificationHandler('react-hook', notificationHandler)

    return () => {
      // クリーンアップは必要に応じて実装
    }
  }, [enableNotifications])

  // エラー処理関数
  const handleErrorFunction = useCallback(async (
    error: Error | AppError,
    errorCode?: ErrorCode,
    options: ErrorHandlingOptions = {}
  ): Promise<void> => {
    const mergedOptions = {
      context: defaultContext,
      showUserNotification: enableNotifications,
      ...options
    }

    try {
      await handleError(error, errorCode, mergedOptions)

      const appError = error instanceof AppError
        ? error
        : createAppError(error.message, errorCode || ERROR_CODES.UNEXPECTED_ERROR, mergedOptions.context, error)

      // エラー状態を更新
      setErrorState(prev => ({
        ...prev,
        hasError: true,
        error: appError,
        isRecovering: false
      }))

      // Sentryレポート
      if (enableSentry) {
        reportToSentry(appError)
      }

      // コールバック実行
      if (onError) {
        onError(appError)
      }

    } catch (handlingError) {
      console.error('Error handling failed:', handlingError)
    }
  }, [defaultContext, enableNotifications, enableSentry, onError])

  // 自動復旧付きエラー処理関数
  const handleWithRecoveryFunction = useCallback(async <T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    options: ErrorHandlingOptions = {}
  ): Promise<ErrorHandlingResult<T>> => {
    const mergedOptions = {
      context: defaultContext,
      showUserNotification: enableNotifications,
      retryEnabled: enableAutoRecovery,
      ...options
    }

    // 操作を保存（リトライ用）
    lastOperationRef.current = { operation, errorCode, options: mergedOptions }

    // 復旧中状態に設定
    setErrorState(prev => ({
      ...prev,
      isRecovering: true,
      lastRecoveryAttempt: new Date(),
      recoveryCount: prev.recoveryCount + 1
    }))

    try {
      const result = await handleWithRecovery(operation, errorCode, mergedOptions)

      if (result.success) {
        // 成功時：エラー状態をクリア
        setErrorState(prev => ({
          ...prev,
          hasError: false,
          error: null,
          isRecovering: false
        }))

        // コールバック実行
        if (onRecovery) {
          onRecovery(result)
        }
      } else {
        // 失敗時：エラー状態を更新
        setErrorState(prev => ({
          ...prev,
          hasError: true,
          error: result.error || null,
          isRecovering: false
        }))

        // Sentryレポート
        if (enableSentry && result.error) {
          reportToSentry(result.error)
        }

        // コールバック実行
        if (onError && result.error) {
          onError(result.error)
        }
      }

      return result

    } catch (recoveryError) {
      const appError = createAppError(
        'Recovery failed',
        ERROR_CODES.UNEXPECTED_ERROR,
        mergedOptions.context,
        recoveryError as Error
      )

      setErrorState(prev => ({
        ...prev,
        hasError: true,
        error: appError,
        isRecovering: false
      }))

      return {
        success: false,
        error: appError,
        retryCount: 0,
        recoveryApplied: false,
        fallbackUsed: false
      }
    }
  }, [defaultContext, enableNotifications, enableAutoRecovery, enableSentry, onError, onRecovery])

  // エラーをクリア
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isRecovering: false,
      lastRecoveryAttempt: null,
      recoveryCount: 0
    })
    lastOperationRef.current = null
  }, [])

  // 通知を非表示
  const dismissNotification = useCallback(() => {
    setNotificationState(prev => ({ ...prev, visible: false }))
  }, [])

  // リトライ実行
  const retry = useCallback(async (): Promise<void> => {
    const lastOperation = lastOperationRef.current
    if (!lastOperation) {
      console.warn('No operation to retry')
      return
    }

    await handleWithRecoveryFunction(
      lastOperation.operation,
      lastOperation.errorCode,
      lastOperation.options
    )
  }, [handleWithRecoveryFunction])

  // エラーが復旧可能かチェック
  const isErrorRecoverable = useCallback((): boolean => {
    if (!errorState.error) return false
    return errorState.error.isRetryable()
  }, [errorState.error])

  // エラー統計を取得
  const getErrorStats = useCallback(() => {
    return globalErrorHandler.getErrorStats()
  }, [])

  return {
    errorState,
    notificationState,
    handleError: handleErrorFunction,
    handleWithRecovery: handleWithRecoveryFunction,
    clearError,
    dismissNotification,
    retry,
    isErrorRecoverable,
    getErrorStats
  }
}

/**
 * 簡易版エラーハンドラーHook
 * 基本的なエラー処理のみ
 */
export function useSimpleErrorHandler() {
  const [error, setError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback(async (
    error: Error | AppError,
    errorCode?: ErrorCode
  ) => {
    const appError = error instanceof AppError
      ? error
      : createAppError(error.message, errorCode || ERROR_CODES.UNEXPECTED_ERROR)

    setError(appError)

    // グローバルハンドラーに委任
    await globalErrorHandler.handleError(appError)
  }, [])

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode = ERROR_CODES.UNEXPECTED_ERROR
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()
      return result
    } catch (error) {
      await handleError(error as Error, errorCode)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    isLoading,
    handleError,
    executeWithErrorHandling,
    clearError
  }
}

/**
 * API呼び出し専用エラーハンドラーHook
 */
export function useApiErrorHandler() {
  const { handleWithRecovery, errorState, clearError } = useErrorHandler({
    enableAutoRecovery: true,
    enableNotifications: true,
    enableSentry: true
  })

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<Response>,
    parser?: (response: Response) => Promise<T>
  ): Promise<T | null> => {
    const result = await handleWithRecovery(
      async () => {
        const response = await apiCall()

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        if (parser) {
          return await parser(response)
        }

        return await response.json()
      },
      ERROR_CODES.API_UNAVAILABLE,
      {
        source: 'api',
        context: { timestamp: new Date().toISOString() }
      }
    )

    return result.success ? result.data : null
  }, [handleWithRecovery])

  return {
    handleApiCall,
    error: errorState.error,
    isRecovering: errorState.isRecovering,
    clearError
  }
}

/**
 * フォーム専用エラーハンドラーHook
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { handleError } = useErrorHandler({
    enableNotifications: false // フォームエラーは個別表示
  })

  const handleValidationError = useCallback(async (
    errors: Record<string, string>
  ) => {
    setFieldErrors(errors)
    await handleError(
      new Error('Validation failed'),
      ERROR_CODES.REQUIRED_FIELD,
      { context: { fieldErrors: errors } }
    )
  }, [handleError])

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const { [fieldName]: _, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  return {
    fieldErrors,
    handleValidationError,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(fieldErrors).length > 0
  }
}