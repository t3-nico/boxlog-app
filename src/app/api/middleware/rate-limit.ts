/**
 * レート制限ミドルウェア
 */

import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { withErrorHandling } from './error-handler'
import type { ApiHandler, MiddlewareConfig } from './types'
import { getClientId } from './utils'

/**
 * レート制限ミドルウェア
 */
export function withRateLimit<T = unknown>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig & { rateLimit: { windowMs: number; maxRequests: number } }
) {
  // 簡易的なインメモリレート制限実装
  const requests = new Map<string, { count: number; resetTime: number }>()

  return withErrorHandling(async (req, context) => {
    const clientId = getClientId(req)
    const now = Date.now()
    const window = config.rateLimit.windowMs
    const maxRequests = config.rateLimit.maxRequests

    const clientRequests = requests.get(clientId)
    if (!clientRequests || now > clientRequests.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + window })
    } else {
      clientRequests.count++
      if (clientRequests.count > maxRequests) {
        throw createAppError('Rate limit exceeded', ERROR_CODES.RATE_LIMIT_EXCEEDED, {
          source: 'rate-limit-middleware',
          context: { clientId, limit: maxRequests, window },
        })
      }
    }

    return handler(req, context)
  }, config)
}
