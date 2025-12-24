/**
 * 🧪 API Version Testing Endpoint
 *
 * バージョニングシステムのテスト用エンドポイント
 * - URLバージョニング: /api/v1/version-test, /api/v2/version-test
 * - ヘッダーバージョニング: API-Version: 1.0 または 2.0
 * - デフォルト動作のテスト
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * 🎯 Version Test レスポンス型定義
 */
interface VersionTestResponse {
  message: string
  version: {
    requested: string
    actual: string
    source: 'url' | 'header' | 'default'
    major: number
    minor: number
    status: 'supported' | 'deprecated' | 'unsupported'
  }
  request: {
    method: string
    url: string
    headers: {
      userAgent?: string
      apiVersion?: string
      origin?: string
    }
    timestamp: string
  }
  features: {
    [key: string]: unknown
  }
}

/**
 * 📊 GET /api/version-test - Version Testing API
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)

    // バージョン別の機能差分をシミュレート
    const versionFeatures = getVersionFeatures('1.0')

    const response: VersionTestResponse = {
      message: 'API Version Testing - v1.0',
      version: {
        requested: '1.0',
        actual: '1.0',
        source: 'default',
        major: 1,
        minor: 0,
        status: 'supported',
      },
      request: {
        method: request.method,
        url: url.pathname,
        headers: {
          ...(request.headers.get('user-agent') && { userAgent: request.headers.get('user-agent')! }),
          ...(request.headers.get('API-Version') && { apiVersion: request.headers.get('API-Version')! }),
          ...(request.headers.get('origin') && { origin: request.headers.get('origin')! }),
        },
        timestamp: new Date().toISOString(),
      },
      features: versionFeatures,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Version test API error:', error)
    return NextResponse.json(
      {
        error: 'VERSION_TEST_ERROR',
        message: 'Version testing failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * 🔧 POST /api/version-test - Version Testing with Request Body
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))

    const response: VersionTestResponse = {
      message: 'POST Version Test - v1.0',
      version: {
        requested: '1.0',
        actual: '1.0',
        source: 'default',
        major: 1,
        minor: 0,
        status: 'supported',
      },
      request: {
        method: request.method,
        url: new URL(request.url).pathname,
        headers: {
          ...(request.headers.get('user-agent') && { userAgent: request.headers.get('user-agent')! }),
          ...(request.headers.get('API-Version') && { apiVersion: request.headers.get('API-Version')! }),
          ...(request.headers.get('origin') && { origin: request.headers.get('origin')! }),
        },
        timestamp: new Date().toISOString(),
      },
      features: {
        ...getVersionFeatures('1.0'),
        requestBody: body,
        bodyProcessing: 'basic',
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Version test POST API error:', error)
    return NextResponse.json(
      {
        error: 'VERSION_TEST_POST_ERROR',
        message: 'POST version testing failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * 🎯 バージョン別機能の差分シミュレーション
 */
function getVersionFeatures(version: string): { [key: string]: unknown } {
  const baseFeatures = {
    basicAuth: true,
    rateLimit: true,
    logging: true,
  }

  switch (version) {
    case '2.0':
      return {
        ...baseFeatures,
        enhancedAuth: true,
        advancedRateLimit: true,
        metrics: true,
        caching: true,
        webhooks: true,
        batchProcessing: true,
      }

    case '1.0':
    default:
      return {
        ...baseFeatures,
        enhancedAuth: false,
        advancedRateLimit: false,
        metrics: false,
        caching: false,
      }
  }
}
