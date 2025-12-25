/**
 * API呼び出し用自動リトライフック
 */

'use client';

import { getErrorStatus, RetryConfig } from './types';
import { useAutoRetry } from './useAutoRetry';

/**
 * API呼び出し専用リトライフック
 *
 * HTTPステータスコードに基づいたリトライ判定を提供
 *
 * @example
 * const { execute, isLoading } = useApiRetry(
 *   () => fetch('/api/users').then(r => r.json())
 * )
 */
export function useApiRetry<T>(
  apiCall: () => Promise<T>,
  config: Omit<RetryConfig, 'shouldRetry'> & {
    shouldRetry?: RetryConfig['shouldRetry'];
  } = {},
) {
  const apiConfig: RetryConfig = {
    ...config,
    shouldRetry:
      config.shouldRetry ||
      ((error: Error, retryCount: number) => {
        const errorMessage = error.message.toLowerCase();
        const statusCode = getErrorStatus(error);

        // リトライ可能なHTTPステータス
        const retryableStatuses = [429, 500, 502, 503, 504];
        const retryableMessages = ['network', 'timeout', 'rate limit', 'server error'];

        const isRetryableStatus = retryableStatuses.includes(statusCode);
        const isRetryableMessage = retryableMessages.some((msg) => errorMessage.includes(msg));

        return (isRetryableStatus || isRetryableMessage) && retryCount < 3;
      }),
  };

  return useAutoRetry(apiCall, apiConfig);
}
