/**
 * 🔧 Configuration API Endpoint
 *
 * 設定システムの情報取得・検証APIエンドポイント
 * - 現在の設定確認
 * - 設定検証結果
 * - 環境情報取得
 */

import { NextRequest, NextResponse } from 'next/server'

import { loadConfig } from '@/config/loader'

/**
 * Configuration structure type
 */
interface ConfigStructure {
  app?: Record<string, unknown>
  database?: { password?: string; host?: string; name?: string }
  auth?: { jwtSecret?: string }
  features?: Record<string, boolean>
  email?: { password?: string; host?: string; from?: string }
  apis?: {
    openai?: { apiKey?: string }
    vercel?: { token?: string }
  }
  server?: { session?: { secret?: string } }
  logging?: Record<string, unknown>
}

/**
 * 🔧 Configuration Info レスポンス型定義
 */
interface ConfigInfoResponse {
  environment: string
  timestamp: string
  validation: {
    success: boolean
    errors: number
    warnings: number
  }
  sections: {
    [key: string]: {
      loaded: boolean
      keys: number
      hasSecrets?: boolean
    }
  }
  features: {
    enabled: string[]
    disabled: string[]
  }
  health: {
    database: 'configured' | 'missing' | 'invalid'
    auth: 'configured' | 'missing' | 'invalid'
    email: 'configured' | 'missing' | 'invalid'
    apis: 'configured' | 'missing' | 'partial'
  }
}

/**
 * 📊 セクション情報の構築
 */
function buildSectionInfo(
  config: ConfigStructure
): Record<string, { loaded: boolean; keys: number; hasSecrets?: boolean }> {
  return {
    app: {
      loaded: !!config.app,
      keys: config.app ? Object.keys(config.app).length : 0,
    },
    database: {
      loaded: !!config.database,
      keys: config.database ? Object.keys(config.database).length : 0,
      hasSecrets: !!config.database?.password,
    },
    auth: {
      loaded: !!config.auth,
      keys: config.auth ? Object.keys(config.auth).length : 0,
      hasSecrets: !!config.auth?.jwtSecret,
    },
    features: {
      loaded: !!config.features,
      keys: config.features ? Object.keys(config.features).length : 0,
    },
    email: {
      loaded: !!config.email,
      keys: config.email ? Object.keys(config.email).length : 0,
      hasSecrets: !!config.email?.password,
    },
    apis: {
      loaded: !!config.apis,
      keys: config.apis ? Object.keys(config.apis).length : 0,
      hasSecrets: !!config.apis?.openai?.apiKey,
    },
    server: {
      loaded: !!config.server,
      keys: config.server ? Object.keys(config.server).length : 0,
      hasSecrets: !!config.server?.session?.secret,
    },
    logging: {
      loaded: !!config.logging,
      keys: config.logging ? Object.keys(config.logging).length : 0,
    },
  }
}

/**
 * 🚀 機能フラグ情報の構築
 */
function buildFeatureFlags(config: ConfigStructure): { enabled: string[]; disabled: string[] } {
  const features: { enabled: string[]; disabled: string[] } = { enabled: [], disabled: [] }

  if (config.features) {
    Object.entries(config.features).forEach(([key, value]) => {
      if (value === true) {
        features.enabled.push(key)
      } else {
        features.disabled.push(key)
      }
    })
  }

  return features
}

/**
 * 🏥 API健康チェック情報の構築
 */
function buildApiHealthStatus(config: ConfigStructure): 'configured' | 'missing' | 'partial' {
  let configuredCount = 0
  let totalCount = 0

  if (config.apis?.openai) {
    totalCount++
    if (config.apis.openai.apiKey) configuredCount++
  }
  if (config.apis?.vercel) {
    totalCount++
    if (config.apis.vercel.token) configuredCount++
  }

  if (totalCount === 0) return 'missing'
  if (configuredCount === totalCount) return 'configured'
  return 'partial'
}

/**
 * 🏥 ヘルスチェック情報の構築
 */
function buildHealthInfo(config: ConfigStructure): {
  database: 'configured' | 'missing' | 'invalid'
  auth: 'configured' | 'missing' | 'invalid'
  email: 'configured' | 'missing' | 'invalid'
  apis: 'configured' | 'missing' | 'partial'
} {
  return {
    database: config.database?.host && config.database?.name ? 'configured' : 'missing',
    auth: config.auth?.jwtSecret ? 'configured' : 'missing',
    email: config.email?.host && config.email?.from ? 'configured' : 'missing',
    apis: buildApiHealthStatus(config),
  }
}

/**
 * 📊 GET /api/config - Configuration Information API
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 設定の読み込み・検証
    const configResult = await loadConfig({
      useCache: false,
      preferEnvVars: true,
      strict: false,
    })

    const environment = process.env.NODE_ENV || 'development'

    const response: ConfigInfoResponse = {
      environment,
      timestamp: new Date().toISOString(),
      validation: {
        success: configResult.success,
        errors: configResult.errors.length,
        warnings: configResult.warnings?.length || 0,
      },
      sections: {},
      features: {
        enabled: [],
        disabled: [],
      },
      health: {
        database: 'missing',
        auth: 'missing',
        email: 'missing',
        apis: 'missing',
      },
    }

    // 設定が成功した場合の詳細情報
    if (configResult.success && configResult.data) {
      const config = configResult.data as ConfigStructure

      response.sections = buildSectionInfo(config)
      response.features = buildFeatureFlags(config)
      response.health = buildHealthInfo(config)
    }

    // 開発環境でのみ、検証エラー詳細を含める
    if (environment === 'development' && !configResult.success) {
      return NextResponse.json(
        {
          ...response,
          errors: configResult.errors,
          warnings: configResult.warnings,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Configuration API error:', error)
    return NextResponse.json(
      {
        error: 'CONFIG_API_ERROR',
        message: 'Failed to retrieve configuration information',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * 🔄 POST /api/config - Configuration Validation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const { strict = false, clearCache = false } = body

    if (clearCache) {
      const { clearConfigCache } = await import('@/config/loader')
      clearConfigCache()
    }

    // 設定の再検証
    const configResult = await loadConfig({
      useCache: false,
      preferEnvVars: true,
      strict,
    })

    const validationResponse = {
      success: configResult.success,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      strict,
      summary: {
        errors: configResult.errors.length,
        warnings: configResult.warnings?.length || 0,
      },
    }

    // 開発環境またはエラーがある場合は詳細を返す
    if (process.env.NODE_ENV === 'development' || !configResult.success) {
      return NextResponse.json(
        {
          ...validationResponse,
          errors: configResult.errors,
          warnings: configResult.warnings,
        },
        { status: configResult.success ? 200 : 400 }
      )
    }

    return NextResponse.json(validationResponse, { status: 200 })
  } catch (error) {
    console.error('Configuration validation API error:', error)
    return NextResponse.json(
      {
        error: 'CONFIG_VALIDATION_ERROR',
        message: 'Configuration validation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
