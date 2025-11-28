/**
 * 🔄 BoxLog API Middleware
 *
 * APIミドルウェアの統合システム
 * - バージョニング・認証・レート制限・CORS等の統合管理
 */

import { NextRequest, NextResponse } from 'next/server'

import { safeJsonStringify } from './json-utils'
import type { ApiRequest } from './versioning'
import { withApiVersioning } from './versioning'

/**
 * 📊 API レスポンス統計
 */
interface ApiStats {
  requestCount: number
  errorCount: number
  averageResponseTime: number
  lastRequest: string
}

/**
 * 📋 ミドルウェア設定
 */
export interface ApiMiddlewareConfig {
  /** バージョニングを有効 */
  enableVersioning: boolean
  /** CORS設定 */
  cors: {
    enabled: boolean
    origins: string[]
    methods: string[]
    headers: string[]
    credentials: boolean
  }
  /** レート制限 */
  rateLimit: {
    enabled: boolean
    windowMs: number
    maxRequests: number
  }
  /** ログ設定 */
  logging: {
    enabled: boolean
    includeBody: boolean
    includeHeaders: boolean
  }
  /** メトリクス収集 */
  metrics: {
    enabled: boolean
    collectResponseTime: boolean
    collectErrorRate: boolean
  }
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: ApiMiddlewareConfig = {
  enableVersioning: true,
  cors: {
    enabled: true,
    origins: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'API-Version', 'X-Requested-With'],
    credentials: true,
  },
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production',
    windowMs: 60000, // 1分
    maxRequests: 100,
  },
  logging: {
    enabled: true,
    includeBody: process.env.NODE_ENV === 'development',
    includeHeaders: process.env.NODE_ENV === 'development',
  },
  metrics: {
    enabled: true,
    collectResponseTime: true,
    collectErrorRate: true,
  },
}

/**
 * 🎯 統合ミドルウェアクラス
 */
export class ApiMiddleware {
  private config: ApiMiddlewareConfig
  private stats: Map<string, ApiStats> = new Map()
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(config: Partial<ApiMiddlewareConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 🚀 メインミドルウェア処理
   */
  async process(
    request: NextRequest,
    handler: (request: NextRequest, apiRequest?: ApiRequest) => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    const startTime = Date.now()
    const path = new URL(request.url).pathname

    try {
      // Pre-flight CORS処理
      if (request.method === 'OPTIONS') {
        return this.handleCors(request)
      }

      // レート制限チェック
      if (this.config.rateLimit.enabled) {
        const rateLimitResult = this.checkRateLimit(request)
        if (!rateLimitResult.allowed) {
          return this.createRateLimitResponse(rateLimitResult.resetTime)
        }
      }

      // リクエストログ
      if (this.config.logging.enabled) {
        this.logRequest(request)
      }

      let response: NextResponse

      // バージョニング統合
      if (this.config.enableVersioning && path.startsWith('/api')) {
        response = await withApiVersioning(handler)(request)
      } else {
        response = await handler(request)
      }

      // CORS ヘッダー追加
      if (this.config.cors.enabled) {
        response = this.applyCorsHeaders(request, response)
      }

      // メトリクス収集
      if (this.config.metrics.enabled) {
        this.collectMetrics(path, startTime, response.status)
      }

      // レスポンスログ
      if (this.config.logging.enabled) {
        this.logResponse(request, response, Date.now() - startTime)
      }

      return response
    } catch (error) {
      console.error('API middleware error:', error)

      // エラーメトリクス
      if (this.config.metrics.enabled) {
        this.collectMetrics(path, startTime, 500)
      }

      return NextResponse.json(
        {
          error: 'MIDDLEWARE_ERROR',
          message: 'Internal middleware error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  }

  /**
   * 🌐 CORS処理
   */
  private handleCors(request: NextRequest): NextResponse {
    const response = new NextResponse(null, { status: 204 })
    return this.applyCorsHeaders(request, response)
  }

  /**
   * 🌐 CORSヘッダーの適用
   */
  private applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
    const { cors } = this.config

    if (!cors.enabled) return response

    const origin = request.headers.get('origin')
    const requestedHeaders = request.headers.get('access-control-request-headers')

    // Origin の検証と設定
    if (cors.origins.includes('*') || (origin && cors.origins.includes(origin))) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
    }

    // Methods
    response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '))

    // Headers
    const allowedHeaders = [...cors.headers]
    if (requestedHeaders) {
      allowedHeaders.push(...requestedHeaders.split(',').map((h) => h.trim()))
    }
    response.headers.set('Access-Control-Allow-Headers', [...new Set(allowedHeaders)].join(', '))

    // Credentials
    if (cors.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Max Age
    response.headers.set('Access-Control-Max-Age', '86400') // 24時間

    return response
  }

  /**
   * ⏱️ レート制限チェック
   */
  private checkRateLimit(request: NextRequest): { allowed: boolean; resetTime: number } {
    const clientId = this.getClientIdentifier(request)
    const now = Date.now()
    const windowMs = this.config.rateLimit.windowMs

    const clientData = this.rateLimitStore.get(clientId)

    if (!clientData || now > clientData.resetTime) {
      // 新しいウィンドウ
      this.rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      })
      return { allowed: true, resetTime: now + windowMs }
    }

    if (clientData.count >= this.config.rateLimit.maxRequests) {
      // 制限に達している
      return { allowed: false, resetTime: clientData.resetTime }
    }

    // カウントを増加
    clientData.count++
    this.rateLimitStore.set(clientId, clientData)

    return { allowed: true, resetTime: clientData.resetTime }
  }

  /**
   * 🆔 クライアント識別子の取得
   */
  private getClientIdentifier(request: NextRequest): string {
    // IP アドレスやユーザーIDなどを使用
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 実際の実装では、認証情報がある場合はユーザーIDを使用
    return `${ip}:${userAgent.slice(0, 50)}`
  }

  /**
   * 🚫 レート制限レスポンスの作成
   */
  private createRateLimitResponse(resetTime: number): NextResponse {
    const response = NextResponse.json(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    )

    response.headers.set('X-RateLimit-Limit', this.config.rateLimit.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', '0')
    response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
    response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())

    return response
  }

  /**
   * 📝 リクエストログ
   */
  private logRequest(request: NextRequest): void {
    const url = new URL(request.url)
    const logData = {
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      ...(this.config.logging.includeHeaders ? { headers: Object.fromEntries(request.headers) } : {}),
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      userAgent: request.headers.get('user-agent'),
    }

    console.log('[API Request]', safeJsonStringify(logData as Parameters<typeof safeJsonStringify>[0], 2))
  }

  /**
   * 📝 レスポンスログ
   */
  private logResponse(request: NextRequest, response: NextResponse, duration: number): void {
    const url = new URL(request.url)
    const logData = {
      method: request.method,
      path: url.pathname,
      status: response.status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }

    console.log('[API Response]', safeJsonStringify(logData, 2))
  }

  /**
   * 📊 メトリクス収集
   */
  private collectMetrics(path: string, startTime: number, status: number): void {
    const duration = Date.now() - startTime
    const stats = this.stats.get(path) || {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastRequest: new Date().toISOString(),
    }

    stats.requestCount++
    if (status >= 400) {
      stats.errorCount++
    }

    // 移動平均を計算
    stats.averageResponseTime = Math.round(
      (stats.averageResponseTime * (stats.requestCount - 1) + duration) / stats.requestCount
    )

    stats.lastRequest = new Date().toISOString()

    this.stats.set(path, stats)
  }

  /**
   * 📊 統計情報の取得
   */
  getStats(): Map<string, ApiStats> {
    return new Map(this.stats)
  }

  /**
   * 🧹 統計情報のリセット
   */
  resetStats(): void {
    this.stats.clear()
    this.rateLimitStore.clear()
  }

  /**
   * ⚙️ 設定の更新
   */
  updateConfig(config: Partial<ApiMiddlewareConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * 🌍 グローバルミドルウェアインスタンス
 */
export const globalApiMiddleware = new ApiMiddleware()

/**
 * 🔧 便利な関数エクスポート
 */
export const processApiRequest = globalApiMiddleware.process.bind(globalApiMiddleware)
export const getApiStats = globalApiMiddleware.getStats.bind(globalApiMiddleware)
export const resetApiStats = globalApiMiddleware.resetStats.bind(globalApiMiddleware)

export default globalApiMiddleware
