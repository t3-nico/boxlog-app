/**
 * API エラーハンドリングミドルウェア
 * Next.js API Routes用の統一エラー処理システム
 */

import { NextRequest, NextResponse } from 'next/server'

import {
  AppError,
  createAppError,
  type ErrorCode,
  ERROR_CODES
} from '@/config/error-patterns'
import { globalErrorHandler } from '@/lib/error-handler'
import { reportToSentry } from '@/lib/sentry-integration'

/**
 * API レスポンスの型定義
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: ErrorCode
    category: string
    message: string
    userMessage: string
    timestamp: string
    requestId?: string
  }
  meta?: {
    requestId: string
    timestamp: string
    executionTime: number
  }
}

/**
 * API ハンドラーのコンテキスト
 */
export interface ApiContext {
  request: NextRequest
  requestId: string
  startTime: number
  userId?: string
  sessionId?: string
}

/**
 * API ハンドラー関数の型
 */
export type ApiHandler<T = unknown> = (
  req: NextRequest,
  context: ApiContext
) => Promise<T>

/**
 * ミドルウェア設定
 */
export interface MiddlewareConfig {
  enableErrorReporting?: boolean     // エラーレポートを有効にするか
  enableMetrics?: boolean           // メトリクス収集を有効にするか
  enableCors?: boolean              // CORS設定を有効にするか
  corsOrigins?: string[]            // 許可するCORSオリジン
  rateLimit?: {                     // レート制限設定
    windowMs: number
    maxRequests: number
  }
  requestTimeout?: number           // リクエストタイムアウト（ミリ秒）
  enableRequestLogging?: boolean    // リクエストログを有効にするか
}

/**
 * API エラーハンドリングミドルウェア
 */
export function withErrorHandling<T = unknown>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = generateRequestId()

    // コンテキスト作成
    const context: ApiContext = {
      request: req,
      requestId,
      startTime,
      userId: extractUserId(req),
      sessionId: extractSessionId(req)
    }

    // CORS設定
    const response = config.enableCors ? setCorsHeaders(req, config.corsOrigins) : undefined

    try {
      // リクエストログ
      if (config.enableRequestLogging) {
        logRequest(req, context)
      }

      // タイムアウト設定
      const timeoutPromise = config.requestTimeout
        ? createTimeoutPromise(config.requestTimeout)
        : null

      // ハンドラー実行
      const handlerPromise = handler(req, context)
      const result = timeoutPromise
        ? await Promise.race([handlerPromise, timeoutPromise])
        : await handlerPromise

      // 成功レスポンス
      const executionTime = Date.now() - startTime
      const apiResponse: ApiResponse<T> = {
        success: true,
        data: result,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          executionTime
        }
      }

      // メトリクス収集
      if (config.enableMetrics) {
        recordMetrics(req, context, true, executionTime)
      }

      return createJsonResponse(apiResponse, 200, response)

    } catch (error) {
      return await handleApiError(error, req, context, config, response)
    }
  }
}

/**
 * API エラー処理
 */
async function handleApiError(
  error: unknown,
  req: NextRequest,
  context: ApiContext,
  config: MiddlewareConfig,
  baseResponse?: NextResponse
): Promise<NextResponse> {
  const executionTime = Date.now() - context.startTime

  // エラーを AppError に正規化
  const appError = normalizeApiError(error, context)

  // エラー処理
  await globalErrorHandler.handleError(appError, undefined, {
    showUserNotification: false, // API では通知しない
    context: {
      ...context,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      executionTime
    }
  })

  // Sentry レポート
  if (config.enableErrorReporting) {
    reportToSentry(appError)
  }

  // メトリクス収集
  if (config.enableMetrics) {
    recordMetrics(req, context, false, executionTime, appError.code)
  }

  // エラーレスポンス
  const statusCode = getHttpStatusCode(appError.code)
  const apiResponse: ApiResponse = {
    success: false,
    error: {
      code: appError.code,
      category: appError.category,
      message: appError.message,
      userMessage: appError.userMessage.description,
      timestamp: new Date().toISOString(),
      requestId: context.requestId
    },
    meta: {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      executionTime
    }
  }

  return createJsonResponse(apiResponse, statusCode, baseResponse)
}

/**
 * エラーを AppError に正規化
 */
function normalizeApiError(error: unknown, context: ApiContext): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // 一般的なエラーパターンから ErrorCode を推定
    let errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR

    if (error.message.includes('timeout')) {
      errorCode = ERROR_CODES.API_TIMEOUT
    } else if (error.message.includes('validation')) {
      errorCode = ERROR_CODES.INVALID_FORMAT
    } else if (error.message.includes('unauthorized') || error.message.includes('auth')) {
      errorCode = ERROR_CODES.INVALID_TOKEN
    } else if (error.message.includes('forbidden')) {
      errorCode = ERROR_CODES.NO_PERMISSION
    } else if (error.message.includes('not found')) {
      errorCode = ERROR_CODES.NOT_FOUND
    } else if (error.message.includes('rate limit')) {
      errorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED
    }

    return createAppError(error.message, errorCode, {
      source: 'api',
      requestId: context.requestId,
      userId: context.userId,
      sessionId: context.sessionId,
      context: {
        url: context.request.url,
        method: context.request.method
      }
    }, error)
  }

  // 不明なエラー
  return createAppError(
    'Unknown error occurred',
    ERROR_CODES.UNEXPECTED_ERROR,
    {
      source: 'api',
      requestId: context.requestId,
      context: { originalError: String(error) }
    }
  )
}

/**
 * ErrorCode から HTTP ステータスコードを取得
 */
function getHttpStatusCode(errorCode: ErrorCode): number {
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
function createJsonResponse(
  data: unknown,
  status: number,
  baseResponse?: NextResponse
): NextResponse {
  const response = baseResponse || new NextResponse()

  response.headers.set('Content-Type', 'application/json')

  return NextResponse.json(data, {
    status,
    headers: response.headers
  })
}

/**
 * CORS ヘッダーを設定
 */
function setCorsHeaders(req: NextRequest, allowedOrigins?: string[]): NextResponse {
  const response = new NextResponse()
  const origin = req.headers.get('origin')

  if (allowedOrigins && origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (!allowedOrigins) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

/**
 * リクエスト ID を生成
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ユーザー ID を抽出
 */
function extractUserId(req: NextRequest): string | undefined {
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
function extractSessionId(req: NextRequest): string | undefined {
  // セッションクッキーから抽出
  const sessionCookie = req.cookies.get('session_id')
  return sessionCookie?.value
}

/**
 * タイムアウト Promise を作成
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(createAppError(
        `Request timeout after ${timeout}ms`,
        ERROR_CODES.API_TIMEOUT
      ))
    }, timeout)
  })
}

/**
 * リクエストをログ出力
 */
function logRequest(req: NextRequest, context: ApiContext): void {
  console.log(`[API] ${req.method} ${req.url}`, {
    requestId: context.requestId,
    userId: context.userId,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  })
}

/**
 * メトリクスを記録
 */
function recordMetrics(
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
    timestamp: Date.now()
  }

  console.log('[METRICS]', metrics)
  // 実際の実装では適切なメトリクス収集サービスに送信
}

/**
 * 認証ミドルウェア
 */
export function withAuth<T = unknown>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig = {}
) {
  return withErrorHandling(async (req, context) => {
    // 認証チェック
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAppError(
        'Authorization header missing or invalid',
        ERROR_CODES.INVALID_TOKEN,
        { source: 'auth-middleware' }
      )
    }

    // トークン検証（実装は認証システムに依存）
    const token = authHeader.substring(7)
    if (!isValidToken(token)) {
      throw createAppError(
        'Invalid or expired token',
        ERROR_CODES.EXPIRED_TOKEN,
        { source: 'auth-middleware' }
      )
    }

    // ユーザー情報をコンテキストに追加
    context.userId = extractUserIdFromToken(token)

    return handler(req, context)
  }, config)
}

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
        throw createAppError(
          'Rate limit exceeded',
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          {
            source: 'rate-limit-middleware',
            context: { clientId, limit: maxRequests, window }
          }
        )
      }
    }

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

function extractUserIdFromToken(token: string): string {
  // JWT トークンからユーザー ID を抽出
  // ここでは簡略化
  return 'user_123'
}

function getClientId(req: NextRequest): string {
  // IP アドレスまたはユーザー ID をクライアント識別子として使用
  return req.headers.get('x-forwarded-for') ||
         req.headers.get('x-real-ip') ||
         'unknown'
}

/**
 * 使用例を示すサンプルハンドラー
 */
export const sampleApiHandler = withAuth(async (req, context) => {
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