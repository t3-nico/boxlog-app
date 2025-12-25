/**
 * 自動リトライフック（技術知識不要の高度なエラー復旧）
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_RETRY_CONFIG, RetryConfig, RetryState } from './types';

/**
 * 汎用自動リトライフック
 *
 * API呼び出し、データ取得、コンポーネント操作の自動復旧を提供
 *
 * @example
 * const { execute, isLoading, error, retry } = useAutoRetry(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3 }
 * )
 */
export function useAutoRetry<T>(asyncFunction: () => Promise<T>, config: RetryConfig = {}) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_RETRY_CONFIG, ...config }), [config]);

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    lastRetryTime: 0,
    isRetrying: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const calculateDelay = useCallback(
    (retryCount: number): number => {
      const delay = finalConfig.initialDelay * Math.pow(finalConfig.backoffFactor, retryCount);
      return Math.min(delay, finalConfig.maxDelay);
    },
    [finalConfig.initialDelay, finalConfig.backoffFactor, finalConfig.maxDelay],
  );

  const executeWithRetry = useCallback(async (): Promise<T> => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    abortControllerRef.current = new AbortController();

    let currentRetryCount = 0;
    let lastError: Error;

    while (currentRetryCount <= finalConfig.maxRetries) {
      try {
        setState((prev) => ({
          ...prev,
          retryCount: currentRetryCount,
          isRetrying: currentRetryCount > 0,
        }));

        const result = await asyncFunction();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          isRetrying: false,
        }));

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        setState((prev) => ({
          ...prev,
          error: lastError,
          lastRetryTime: Date.now(),
        }));

        if (!finalConfig.shouldRetry(lastError, currentRetryCount)) {
          break;
        }

        if (currentRetryCount < finalConfig.maxRetries) {
          const delay = calculateDelay(currentRetryCount);

          finalConfig.onRetry(lastError, currentRetryCount);

          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              resolve();
            }, delay);
          });

          currentRetryCount++;
        } else {
          break;
        }
      }
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
    }));

    finalConfig.onFinalFailure(lastError!, currentRetryCount);
    throw lastError!;
  }, [asyncFunction, finalConfig, calculateDelay]);

  const manualRetry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      retryCount: 0,
    }));
    return executeWithRetry();
  }, [executeWithRetry]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
    }));
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    ...state,
    execute: executeWithRetry,
    retry: manualRetry,
    cancel,
    canRetry: state.retryCount < finalConfig.maxRetries,
    nextRetryDelay: calculateDelay(state.retryCount),
    progress: state.retryCount / finalConfig.maxRetries,
  };
}
