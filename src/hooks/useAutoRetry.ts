/**
 * 自動リトライフック（技術知識不要の高度なエラー復旧）
 * API呼び出し、データ取得、コンポーネント操作の自動復旧を提供
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ERROR_CODES, getErrorCategory } from '@/constants/errorCodes'

// === 型定義 ===

interface RetryConfig {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries?: number
  /** 初期遅延時間（ミリ秒、デフォルト: 1000） */
  initialDelay?: number
  /** バックオフ係数（指数バックオフ、デフォルト: 2） */
  backoffFactor?: number
  /** 最大遅延時間（ミリ秒、デフォルト: 30000） */
  maxDelay?: number
  /** リトライ可能なエラーの判定関数 */
  shouldRetry?: (error: Error, retryCount: number) => boolean
  /** リトライ前のコールバック */
  onRetry?: (error: Error, retryCount: number) => void
  /** 最終的な失敗時のコールバック */
  onFinalFailure?: (error: Error, retryCount: number) => void
}

interface RetryState {
  isLoading: boolean
  error: Error | null
  retryCount: number
  lastRetryTime: number
  isRetrying: boolean
}

// === デフォルト設定 ===

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  shouldRetry: (error: Error, retryCount: number) => {
    // デフォルトのリトライ判定ロジック
    const errorMessage = error.message.toLowerCase()

    // リトライ可能なエラーパターン
    const retryablePatterns = [
      'network',
      'fetch failed',
      'timeout',
      'rate limit',
      'server error',
      '500',
      '502',
      '503',
      '504',
      'chunklloaderror',
      'loading chunk',
    ]

    const isRetryable = retryablePatterns.some((pattern) => errorMessage.includes(pattern))

    return isRetryable && retryCount < DEFAULT_CONFIG.maxRetries
  },
  onRetry: () => {},
  onFinalFailure: () => {},
}

// === 自動リトライフック ===

export function useAutoRetry<T>(asyncFunction: () => Promise<T>, config: RetryConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    lastRetryTime: 0,
    isRetrying: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  // 計算された遅延時間を取得
  const calculateDelay = useCallback(
    (retryCount: number): number => {
      const delay = finalConfig.initialDelay * Math.pow(finalConfig.backoffFactor, retryCount)
      return Math.min(delay, finalConfig.maxDelay)
    },
    [finalConfig.initialDelay, finalConfig.backoffFactor, finalConfig.maxDelay]
  )

  // 自動リトライ実行
  const executeWithRetry = useCallback(async (): Promise<T> => {
    console.log('🔄 自動リトライ実行開始')

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }))

    // AbortController を作成
    abortControllerRef.current = new AbortController()

    let currentRetryCount = 0
    let lastError: Error

    while (currentRetryCount <= finalConfig.maxRetries) {
      try {
        console.log(`🎯 試行 ${currentRetryCount + 1}/${finalConfig.maxRetries + 1}`)

        setState((prev) => ({
          ...prev,
          retryCount: currentRetryCount,
          isRetrying: currentRetryCount > 0,
        }))

        const result = await asyncFunction()

        console.log('✅ 成功！')
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          isRetrying: false,
        }))

        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        console.log(`❌ 試行 ${currentRetryCount + 1} 失敗:`, lastError.message)

        setState((prev) => ({
          ...prev,
          error: lastError,
          lastRetryTime: Date.now(),
        }))

        // リトライ判定
        if (!finalConfig.shouldRetry(lastError, currentRetryCount)) {
          console.log('❌ これ以上リトライしません')
          break
        }

        if (currentRetryCount < finalConfig.maxRetries) {
          const delay = calculateDelay(currentRetryCount)

          console.log(`⏳ ${delay}ms 後に再試行...`)

          // リトライコールバック実行
          finalConfig.onRetry(lastError, currentRetryCount)

          // 遅延実行（キャンセル可能）
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              resolve()
            }, delay)
          })

          currentRetryCount++
        } else {
          break
        }
      }
    }

    // すべてのリトライが失敗
    console.log('💥 すべてのリトライが失敗しました')

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
    }))

    finalConfig.onFinalFailure(lastError!, currentRetryCount)
    throw lastError!
  }, [asyncFunction, finalConfig, calculateDelay])

  // 手動リトライ
  const manualRetry = useCallback(() => {
    console.log('🔄 手動リトライを実行')
    setState((prev) => ({
      ...prev,
      retryCount: 0,
    }))
    return executeWithRetry()
  }, [executeWithRetry])

  // キャンセル
  const cancel = useCallback(() => {
    console.log('🚫 リトライをキャンセル')

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
    }))
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    // 状態
    ...state,

    // 関数
    execute: executeWithRetry,
    retry: manualRetry,
    cancel,

    // 便利な計算値
    canRetry: state.retryCount < finalConfig.maxRetries,
    nextRetryDelay: calculateDelay(state.retryCount),
    progress: state.retryCount / finalConfig.maxRetries,
  }
}

// === 特化型フック群 ===

/**
 * API呼び出し用自動リトライフック
 */
export function useApiRetry<T>(
  apiCall: () => Promise<T>,
  config: Omit<RetryConfig, 'shouldRetry'> & {
    shouldRetry?: RetryConfig['shouldRetry']
  } = {}
) {
  const apiConfig: RetryConfig = {
    ...config,
    shouldRetry:
      config.shouldRetry ||
      ((error: Error, retryCount: number) => {
        const errorMessage = error.message.toLowerCase()
        const statusCode = (error as any).status || 0

        // API固有のリトライ判定
        const retryableStatuses = [429, 500, 502, 503, 504]
        const retryableMessages = ['network', 'timeout', 'rate limit', 'server error']

        const isRetryableStatus = retryableStatuses.includes(statusCode)
        const isRetryableMessage = retryableMessages.some((msg) => errorMessage.includes(msg))

        return (isRetryableStatus || isRetryableMessage) && retryCount < 3
      }),
  }

  return useAutoRetry(apiCall, apiConfig)
}

/**
 * データフェッチ用自動リトライフック
 */
export function useDataFetchRetry<T>(fetchFunction: () => Promise<T>, config: RetryConfig = {}) {
  const dataConfig: RetryConfig = {
    maxRetries: 2,
    initialDelay: 500,
    backoffFactor: 1.5,
    ...config,
    shouldRetry:
      config.shouldRetry ||
      ((error: Error, retryCount: number) => {
        const category = getErrorCategory(ERROR_CODES.DATA_NOT_FOUND) // サンプル
        return ['data', 'api', 'system'].includes(category) && retryCount < 2
      }),
  }

  return useAutoRetry(fetchFunction, dataConfig)
}

/**
 * ユーザーアクション用自動リトライフック（控えめなリトライ）
 */
export function useUserActionRetry<T>(actionFunction: () => Promise<T>, config: RetryConfig = {}) {
  const actionConfig: RetryConfig = {
    maxRetries: 1,
    initialDelay: 2000,
    ...config,
    shouldRetry:
      config.shouldRetry ||
      ((error: Error) => {
        // ユーザーアクションは控えめにリトライ
        const errorMessage = error.message.toLowerCase()
        return errorMessage.includes('network') || errorMessage.includes('timeout')
      }),
  }

  return useAutoRetry(actionFunction, actionConfig)
}

// === エクスポート ===

export default useAutoRetry
