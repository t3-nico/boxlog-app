/**
 * API ミドルウェア型定義
 */

import type { ErrorCode } from '@/config/error-patterns'
import type { NextRequest } from 'next/server'

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
export type ApiHandler<T = unknown> = (req: NextRequest, context: ApiContext) => Promise<T>

/**
 * ミドルウェア設定
 */
export interface MiddlewareConfig {
  enableErrorReporting?: boolean // エラーレポートを有効にするか
  enableMetrics?: boolean // メトリクス収集を有効にするか
  enableCors?: boolean // CORS設定を有効にするか
  corsOrigins?: string[] // 許可するCORSオリジン
  rateLimit?: {
    // レート制限設定
    windowMs: number
    maxRequests: number
  }
  requestTimeout?: number // リクエストタイムアウト（ミリ秒）
  enableRequestLogging?: boolean // リクエストログを有効にするか
}
