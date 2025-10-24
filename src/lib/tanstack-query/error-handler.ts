/**
 * TanStack Query のエラーハンドリング統一
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
 */

import * as Sentry from '@sentry/nextjs'

/**
 * エラーコンテキスト
 */
export interface ErrorContext {
  queryKey: unknown[]
  operation: 'fetch' | 'create' | 'update' | 'delete'
  feature?: string
}

/**
 * クエリエラーをハンドリングする統一関数
 */
export function handleQueryError(error: unknown, context: ErrorContext): void {
  console.error(`Query error [${context.operation}]:`, context.queryKey, error)

  // Sentryに送信
  Sentry.captureException(error, {
    tags: {
      type: 'tanstack-query',
      operation: context.operation,
      feature: context.feature || 'unknown',
    },
    extra: {
      queryKey: context.queryKey,
    },
  })
}

/**
 * リトライ戦略
 *
 * TanStack Query のグローバル設定で使用
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  // HTTPステータスコードを取得
  const status = (error as { status?: number }).status

  // 404: リソースが見つからない → リトライしない
  if (status === 404) return false

  // 401/403: 認証・権限エラー → リトライしない
  if (status === 401 || status === 403) return false

  // 429: レート制限 → 最大2回までリトライ
  if (status === 429) return failureCount < 2

  // その他のエラー: 最大3回までリトライ
  return failureCount < 3
}

/**
 * リトライ遅延（Exponential Backoff）
 */
export function getRetryDelay(attemptIndex: number, error: unknown): number {
  const status = (error as { status?: number }).status

  // 429エラー（レート制限）は長めの遅延
  if (status === 429) {
    return Math.min(5000 * 2 ** attemptIndex, 60000) // 5秒から始まる指数バックオフ（最大60秒）
  }

  // 通常は1秒から始まる指数バックオフ（最大30秒）
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}

/**
 * クエリエラーのログ出力（開発環境専用）
 */
export function logQueryError(error: unknown, context: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 TanStack Query Error [${context.operation}]`)
    console.error('Query Key:', context.queryKey)
    console.error('Error:', error)
    console.error('Context:', context)
    console.groupEnd()
  }
}

/**
 * Mutation成功時のログ出力（開発環境専用）
 */
export function logMutationSuccess(operation: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`✅ TanStack Query Success [${operation}]`)
    if (data) console.log('Data:', data)
    console.groupEnd()
  }
}
