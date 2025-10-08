/**
 * API ミドルウェア ユーティリティ関数
 */

import type { ErrorCode } from '@/config/error-patterns'
import { ERROR_CODES } from '@/config/error-patterns'
import { NextRequest, NextResponse } from 'next/server'
import type { ApiContext } from './types'

/**
 * リクエスト ID を生成
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ユーザー ID を抽出
 */
export function extractUserId(req: NextRequest): string | undefined {
  // Authorization ヘッダーまたはクッキーから抽出
  // 実装は認証システムに依存
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    // JWT トークンからユーザー ID を抽出する実装
    // ここでは簡略化
    return 'user_id_from_token'
  }
  return undefined
}

/**
 * セッション ID を抽出
 */
export function extractSessionId(req: NextRequest): string | undefined {
  // セッションクッキーから抽出
  const sessionCookie = req.cookies.get('session_id')
  return sessionCookie?.value
}

/**
 * ErrorCode から HTTP ステータスコードを取得
 */
export function getHttpStatusCode(errorCode: ErrorCode): number {
  // 認証エラー
  if (errorCode === ERROR_CODES.INVALID_TOKEN || errorCode === ERROR_CODES.EXPIRED_TOKEN) {
    return 401
  }
  if (errorCode === ERROR_CODES.NO_PERMISSION || errorCode === ERROR_CODES.INSUFFICIENT_SCOPE) {
    return 403
  }

  // バリデーションエラー
  if (errorCode >= 2000 && errorCode <= 2999) {
    return 400
  }

  // Not Found
  if (errorCode === ERROR_CODES.NOT_FOUND) {
    return 404
  }

  // レート制限
  if (errorCode >= 7000 && errorCode <= 7999) {
    return 429
  }

  // システム・外部サービスエラー
  if (errorCode >= 5000 && errorCode <= 6999) {
    return 503
  }

  // デフォルトは 500
  return 500
}

/**
 * JSON レスポンスを作成
 */
export function createJsonResponse(data: unknown, status: number, baseResponse?: NextResponse): NextResponse {
  const response = baseResponse || new NextResponse()

  response.headers.set('Content-Type', 'application/json')

  return NextResponse.json(data, {
    status,
    headers: response.headers,
  })
}

/**
 * リクエストをログ出力
 */
export function logRequest(req: NextRequest, context: ApiContext): void {
  console.log(`[API] ${req.method} ${req.url}`, {
    requestId: context.requestId,
    userId: context.userId,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  })
}

/**
 * メトリクスを記録
 */
export function recordMetrics(
  req: NextRequest,
  context: ApiContext,
  success: boolean,
  executionTime: number,
  errorCode?: ErrorCode
): void {
  // カスタムメトリクス収集システムに送信
  const metrics = {
    endpoint: req.url,
    method: req.method,
    success,
    executionTime,
    errorCode,
    requestId: context.requestId,
    timestamp: Date.now(),
  }

  console.log('[METRICS]', metrics)
  // 実際の実装では適切なメトリクス収集サービスに送信
}

/**
 * クライアント識別子を取得
 */
export function getClientId(req: NextRequest): string {
  // IP アドレスまたはユーザー ID をクライアント識別子として使用
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
}
