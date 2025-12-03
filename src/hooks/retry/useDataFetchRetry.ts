/**
 * データフェッチ用自動リトライフック
 */

'use client'

import { ERROR_CODES, getErrorCategory } from '@/constants/errorCodes'

import { RetryConfig } from './types'
import { useAutoRetry } from './useAutoRetry'

/**
 * データフェッチ専用リトライフック
 *
 * 控えめなリトライ設定（2回まで、短い遅延）
 *
 * @example
 * const { execute, isLoading } = useDataFetchRetry(
 *   () => fetchUserData(userId)
 * )
 */
export function useDataFetchRetry<T>(fetchFunction: () => Promise<T>, config: RetryConfig = {}) {
  const dataConfig: RetryConfig = {
    maxRetries: 2,
    initialDelay: 500,
    backoffFactor: 1.5,
    ...config,
    shouldRetry:
      config.shouldRetry ||
      ((_error: Error, retryCount: number) => {
        const category = getErrorCategory(ERROR_CODES.DATA_NOT_FOUND)
        return ['data', 'api', 'system'].includes(category) && retryCount < 2
      }),
  }

  return useAutoRetry(fetchFunction, dataConfig)
}
