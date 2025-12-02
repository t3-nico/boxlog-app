/**
 * 自動リトライフック - 後方互換性のための再エクスポート
 *
 * @deprecated `@/hooks/retry` から直接インポートしてください
 *
 * @example
 * // Before
 * import { useAutoRetry } from '@/hooks/useAutoRetry'
 *
 * // After (推奨)
 * import { useAutoRetry } from '@/hooks/retry'
 */

export {
  useAutoRetry,
  useApiRetry,
  useDataFetchRetry,
  useUserActionRetry,
  DEFAULT_RETRY_CONFIG,
  getErrorStatus,
} from './retry'

export type { ErrorWithStatus, RetryConfig, RetryState } from './retry'

// デフォルトエクスポートも維持
export { useAutoRetry as default } from './retry'
