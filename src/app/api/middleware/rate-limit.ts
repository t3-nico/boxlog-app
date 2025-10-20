/**
 * レート制限ミドルウェア
 *
 * Upstash Redis（推奨）とインメモリ（フォールバック）のハイブリッド実装
 */

import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { apiRateLimit, isUpstashEnabled, withUpstashRateLimit } from '@/lib/rate-limit/upstash'
import { withErrorHandling } from './error-handler'
import type { ApiHandler, MiddlewareConfig } from './types'
import { getClientId } from './utils'

/**
 * インメモリレート制限（フォールバック用）
 *
 * Upstash未設定時のみ使用
 */
const inMemoryRequests = new Map<string, { count: number; resetTime: number }>()

/**
 * レート制限ミドルウェア
 *
 * - Upstash有効時: Upstash Redisを使用（永続的）
 * - Upstash無効時: インメモリを使用（開発環境向け）
 */
export function withRateLimit<T = unknown>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig & { rateLimit: { windowMs: number; maxRequests: number } }
) {
  return withErrorHandling(async (req, context) => {
    // Upstash Redisが有効な場合
    if (isUpstashEnabled && apiRateLimit) {
      const result = await withUpstashRateLimit(req, apiRateLimit)

      if (result && !result.success) {
        throw createAppError('Rate limit exceeded', ERROR_CODES.RATE_LIMIT_EXCEEDED, {
          source: 'rate-limit-middleware-upstash',
          context: {
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
          },
        })
      }

      // UpstashのみでOK（インメモリ不要）
      return handler(req, context)
    }

    // フォールバック: インメモリレート制限（開発環境向け）
    const clientId = getClientId(req)
    const now = Date.now()
    const window = config.rateLimit.windowMs
    const maxRequests = config.rateLimit.maxRequests

    const clientRequests = inMemoryRequests.get(clientId)
    if (!clientRequests || now > clientRequests.resetTime) {
      inMemoryRequests.set(clientId, { count: 1, resetTime: now + window })
    } else {
      clientRequests.count++
      if (clientRequests.count > maxRequests) {
        throw createAppError('Rate limit exceeded', ERROR_CODES.RATE_LIMIT_EXCEEDED, {
          source: 'rate-limit-middleware-in-memory',
          context: { clientId, limit: maxRequests, window },
        })
      }
    }

    return handler(req, context)
  }, config)
}
