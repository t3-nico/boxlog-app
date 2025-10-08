/**
 * 認証ミドルウェア
 */

import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { withErrorHandling } from './error-handler'
import type { ApiHandler, MiddlewareConfig } from './types'

/**
 * 認証ミドルウェア
 */
export function withAuth<T = unknown>(handler: ApiHandler<T>, config: MiddlewareConfig = {}) {
  return withErrorHandling(async (req, context) => {
    // 認証チェック
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAppError('Authorization header missing or invalid', ERROR_CODES.INVALID_TOKEN, {
        source: 'auth-middleware',
      })
    }

    // トークン検証（実装は認証システムに依存）
    const token = authHeader.substring(7)
    if (!isValidToken(token)) {
      throw createAppError('Invalid or expired token', ERROR_CODES.EXPIRED_TOKEN, { source: 'auth-middleware' })
    }

    // ユーザー情報をコンテキストに追加
    context.userId = extractUserIdFromToken(token)

    return handler(req, context)
  }, config)
}

/**
 * ヘルパー関数
 */
function isValidToken(_token: string): boolean {
  // JWT トークンの検証実装
  // ここでは簡略化
  return _token.length > 10
}

function extractUserIdFromToken(_token: string): string {
  // JWT トークンからユーザー ID を抽出
  // ここでは簡略化
  return 'user_123'
}
