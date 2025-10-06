/**
 * API エラーハンドリングミドルウェア
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  AppError,
  createAppError,
  type ErrorCode,
  ERROR_CODES
} from '@/config/error-patterns'
import { globalErrorHandler } from '@/lib/error-handler'
import { reportToSentry } from '@/lib/sentry'
import type { ApiContext, ApiHandler, ApiResponse, MiddlewareConfig } from './types'
import {
  generateRequestId,
  extractUserId,
  extractSessionId,
  getHttpStatusCode,
  createJsonResponse,
  logRequest,
  recordMetrics
} from './utils'
import { setCorsHeaders, createTimeoutPromise } from './cors'

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
      userMessage: appError.userMessage || appError.message,
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
    }, error.message)
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
