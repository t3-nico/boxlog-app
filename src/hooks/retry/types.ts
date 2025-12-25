/**
 * リトライフック共通型定義
 */

/** HTTPステータスコード付きエラー */
export interface ErrorWithStatus extends Error {
  status?: number;
}

/** エラーからステータスコードを安全に取得 */
export function getErrorStatus(error: Error): number {
  return (error as ErrorWithStatus).status ?? 0;
}

/** リトライ設定 */
export interface RetryConfig {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries?: number;
  /** 初期遅延時間（ミリ秒、デフォルト: 1000） */
  initialDelay?: number;
  /** バックオフ係数（指数バックオフ、デフォルト: 2） */
  backoffFactor?: number;
  /** 最大遅延時間（ミリ秒、デフォルト: 30000） */
  maxDelay?: number;
  /** リトライ可能なエラーの判定関数 */
  shouldRetry?: (error: Error, retryCount: number) => boolean;
  /** リトライ前のコールバック */
  onRetry?: (error: Error, retryCount: number) => void;
  /** 最終的な失敗時のコールバック */
  onFinalFailure?: (error: Error, retryCount: number) => void;
}

/** リトライ状態 */
export interface RetryState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  lastRetryTime: number;
  isRetrying: boolean;
}

/** デフォルト設定 */
export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  shouldRetry: (error: Error, retryCount: number) => {
    const errorMessage = error.message.toLowerCase();

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
    ];

    const isRetryable = retryablePatterns.some((pattern) => errorMessage.includes(pattern));
    return isRetryable && retryCount < 3;
  },
  onRetry: () => {},
  onFinalFailure: () => {},
};
