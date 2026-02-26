/**
 * 認証ミドルウェア
 *
 * Supabase JWT検証を使用した認証チェック
 *
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */

import { createAppError, ERROR_CODES } from '@/config/error-patterns';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandling } from './error-handler';
import type { ApiHandler, MiddlewareConfig } from './types';

/**
 * 認証ミドルウェア
 *
 * Bearer トークンを検証し、ユーザー情報をコンテキストに追加します
 */
export function withAuth<T = unknown>(handler: ApiHandler<T>, config: MiddlewareConfig = {}) {
  return withErrorHandling(async (req, context) => {
    // 認証チェック
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAppError('Authorization header missing or invalid', ERROR_CODES.INVALID_TOKEN, {
        source: 'auth-middleware',
      });
    }

    // トークン検証（Supabase JWT検証）
    const token = authHeader.substring(7);
    const userId = await validateTokenAndGetUserId(token);

    if (!userId) {
      throw createAppError('Invalid or expired token', ERROR_CODES.EXPIRED_TOKEN, {
        source: 'auth-middleware',
      });
    }

    // ユーザー情報をコンテキストに追加
    context.userId = userId;

    return handler(req, context);
  }, config);
}

/**
 * トークンを検証してユーザーIDを取得
 *
 * @param token - JWT トークン
 * @returns ユーザーID（検証失敗時はnull）
 */
async function validateTokenAndGetUserId(token: string): Promise<string | null> {
  try {
    const supabase = await createClient();

    // Supabase auth.getUser() でトークン検証
    // getUser()は内部的にJWT署名を検証し、有効期限もチェックする
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      logger.error('Token validation error:', error.message);
      return null;
    }

    if (!data.user) {
      logger.warn('Token validated but no user found');
      return null;
    }

    return data.user.id;
  } catch (err) {
    logger.error('Unexpected error during token validation:', err);
    return null;
  }
}
