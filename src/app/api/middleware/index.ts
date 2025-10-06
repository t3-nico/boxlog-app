/**
 * API ミドルウェア統一エクスポート
 *
 * このファイルは後方互換性のために src/app/api/middleware.ts と同じインターフェースを提供します。
 * すべての機能は機能別にファイル分割されています：
 * - types.ts: 型定義
 * - error-handler.ts: エラーハンドリング
 * - auth.ts: 認証
 * - rate-limit.ts: レート制限
 * - cors.ts: CORS設定・タイムアウト
 * - utils.ts: ヘルパー関数
 */

// 型定義
export type {
  ApiResponse,
  ApiContext,
  ApiHandler,
  MiddlewareConfig,
} from './types'

// エラーハンドリング
export { withErrorHandling } from './error-handler'

// 認証
export { withAuth } from './auth'

// レート制限
export { withRateLimit } from './rate-limit'

// CORS・タイムアウト
export { setCorsHeaders, createTimeoutPromise } from './cors'

// ユーティリティ
export {
  generateRequestId,
  extractUserId,
  extractSessionId,
  getHttpStatusCode,
  createJsonResponse,
  logRequest,
  recordMetrics,
  getClientId,
} from './utils'
