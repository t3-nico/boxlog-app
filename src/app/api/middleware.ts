/**
 * API エラーハンドリングミドルウェア
 * Next.js API Routes用の統一エラー処理システム
 *
 * このファイルは後方互換性のために middleware/ ディレクトリのエクスポートを再エクスポートします。
 */

// すべての機能を middleware/ ディレクトリから再エクスポート
export type {
  ApiResponse,
  ApiContext,
  ApiHandler,
  MiddlewareConfig,
} from './middleware/types'

export { withErrorHandling } from './middleware/error-handler'
export { withAuth } from './middleware/auth'
export { withRateLimit } from './middleware/rate-limit'
export { setCorsHeaders, createTimeoutPromise } from './middleware/cors'
export {
  generateRequestId,
  extractUserId,
  extractSessionId,
  getHttpStatusCode,
  createJsonResponse,
  logRequest,
  recordMetrics,
  getClientId,
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
    requestId: context.requestId
  }
})

export const publicApiHandler = withErrorHandling(async (_req, _context) => {
  // 公開API
  return {
    message: 'Hello public user!',
    timestamp: new Date().toISOString()
  }
})

export const rateLimitedApiHandler = withRateLimit(
  async (_req, _context) => {
    return { message: 'Rate limited endpoint' }
  },
  {
    rateLimit: { windowMs: 60000, maxRequests: 100 } // 1分間に100リクエスト
  }
)
