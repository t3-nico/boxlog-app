/**
 * 🩺 API Health Check Endpoint (v1.0)
 *
 * APIバージョニングシステムのテスト・動作確認用エンドポイント
 * /api/v1/health または API-Version: 1.0 header で呼び出し
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * 🌍 API Health Check レスポンス型定義
 */
interface HealthCheckResponse {
  status: 'ok' | 'error'
  version: string
  timestamp: string
  uptime: number
  environment: string
  features: {
    versioning: boolean
    rateLimit: boolean
    cors: boolean
    metrics: boolean
  }
}

/**
 * 📊 GET /api/v1/health - Health Check API
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const healthResponse: HealthCheckResponse = {
      status: 'ok',
      version: '1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        versioning: true,
        rateLimit: process.env.NODE_ENV === 'production',
        cors: true,
        metrics: true,
      },
    }

    return NextResponse.json(healthResponse, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
