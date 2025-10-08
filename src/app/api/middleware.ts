/**
 * API エラーハンドリングミドルウェア
 * Next.js API Routes用の統一エラー処理システム
 *
 * このファイルは後方互換性のために middleware/ ディレクトリのエクスポートを再エクスポートします。
 */

// すべての機能を middleware/ ディレクトリから再エクスポート
export type { ApiContext, ApiHandler, ApiResponse, MiddlewareConfig } from './middleware/types'

export { withAuth } from './middleware/auth'
export { createTimeoutPromise, setCorsHeaders } from './middleware/cors'
export { withErrorHandling } from './middleware/error-handler'
export { withRateLimit } from './middleware/rate-limit'
export {
  createJsonResponse,
  extractSessionId,
  extractUserId,
  generateRequestId,
  getClientId,
  getHttpStatusCode,
  logRequest,
  recordMetrics,
} from './middleware/utils'

/**
 * 使用例を示すサンプルハンドラー
 */
import { withAuth } from './middleware/auth'
import { withErrorHandling } from './middleware/error-handler'
import { withRateLimit } from './middleware/rate-limit'

export const sampleApiHandler = withAuth(async (_req, context) => {
  // 認証済みユーザーのみアクセス可能なAPI
  return {
    message: 'Hello authenticated user!',
    userId: context.userId,
    requestId: context.requestId,
  }
})

export const publicApiHandler = withErrorHandling(async (_req, _context) => {
  // 公開API
  return {
    message: 'Hello public user!',
    timestamp: new Date().toISOString(),
  }
})

export const rateLimitedApiHandler = withRateLimit(
  async (_req, _context) => {
    return { message: 'Rate limited endpoint' }
  },
  {
    rateLimit: { windowMs: 60000, maxRequests: 100 }, // 1分間に100リクエスト
  }
)
