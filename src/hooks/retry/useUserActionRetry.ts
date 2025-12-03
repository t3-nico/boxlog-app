/**
 * ユーザーアクション用自動リトライフック（控えめなリトライ）
 */

'use client'

import { RetryConfig } from './types'
import { useAutoRetry } from './useAutoRetry'

/**
 * ユーザーアクション専用リトライフック
 *
 * 最小限のリトライ（1回のみ、長い遅延）
 * ネットワークエラーとタイムアウトのみリトライ
 *
 * @example
 * const { execute, isLoading } = useUserActionRetry(
 *   () => saveUserSettings(settings)
 * )
 */
export function useUserActionRetry<T>(actionFunction: () => Promise<T>, config: RetryConfig = {}) {
  const actionConfig: RetryConfig = {
    maxRetries: 1,
    initialDelay: 2000,
    ...config,
    shouldRetry:
      config.shouldRetry ||
      ((error: Error) => {
        const errorMessage = error.message.toLowerCase()
        return errorMessage.includes('network') || errorMessage.includes('timeout')
      }),
  }

  return useAutoRetry(actionFunction, actionConfig)
}
