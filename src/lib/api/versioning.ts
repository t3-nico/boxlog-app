/**
 * 🔄 BoxLog API Versioning System
 *
 * APIバージョニングの統一管理システム
 * - URLベースバージョニング (/api/v1/users)
 * - ヘッダーベースバージョニング (API-Version: 1.0)
 * - 後方互換性管理・自動マイグレーション
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 APIバージョン定義
 */
export const API_VERSIONS = {
  V1: '1.0',
  V2: '2.0',
  CURRENT: '1.0',
  SUPPORTED: ['1.0', '2.0'],
  DEPRECATED: [] as string[],
  MINIMUM: '1.0',
} as const

/**
 * 🎯 バージョン情報の型定義
 */
export interface ApiVersion {
  /** バージョン番号 */
  version: string
  /** メジャーバージョン */
  major: number
  /** マイナーバージョン */
  minor: number
  /** パッチバージョン */
  patch?: number
  /** サポート状態 */
  status: 'supported' | 'deprecated' | 'unsupported'
  /** 非推奨日 */
  deprecationDate?: string
  /** サポート終了日 */
  endOfLifeDate?: string
}

/**
 * 📊 APIエンドポイント情報
 */
export interface ApiEndpoint {
  /** エンドポイントパス */
  path: string
  /** サポートバージョン */
  supportedVersions: string[]
  /** 最小必須バージョン */
  minimumVersion?: string
  /** 非推奨バージョン */
  deprecatedVersions?: string[]
  /** 変更履歴 */
  changes?: Array<{
    version: string
    type: 'added' | 'modified' | 'deprecated' | 'removed'
    description: string
    breaking: boolean
  }>
}

/**
 * 🔧 リクエスト情報
 */
export interface ApiRequest {
  /** 要求バージョン */
  requestedVersion: string
  /** 検出方法 */
  versionSource: 'url' | 'header' | 'default'
  /** 元のパス */
  originalPath: string
  /** 正規化パス */
  normalizedPath: string
  /** バージョン情報 */
  version: ApiVersion
}

/**
 * ⚙️ バージョニング設定
 */
export interface ApiVersioningConfig {
  /** デフォルトバージョン */
  defaultVersion: string
  /** URLプレフィックス */
  urlPrefix: string
  /** ヘッダー名 */
  versionHeader: string
  /** 厳密モード */
  strictMode: boolean
  /** 非推奨警告を有効 */
  enableDeprecationWarnings: boolean
  /** サポートされていないバージョンを拒否 */
  rejectUnsupported: boolean
  /** バージョン情報をレスポンスヘッダーに含める */
  includeVersionInResponse: boolean
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: ApiVersioningConfig = {
  defaultVersion: API_VERSIONS.CURRENT,
  urlPrefix: '/api',
  versionHeader: 'API-Version',
  strictMode: false,
  enableDeprecationWarnings: true,
  rejectUnsupported: false,
  includeVersionInResponse: true,
}

/**
 * 🎯 APIバージョニング管理クラス
 */
export class ApiVersionManager {
  private config: ApiVersioningConfig
  private endpoints: Map<string, ApiEndpoint> = new Map()
  private versionInfo: Map<string, ApiVersion> = new Map()

  constructor(config: Partial<ApiVersioningConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeVersions()
  }

  /**
   * 🚀 バージョン情報の初期化
   */
  private initializeVersions(): void {
    // サポートされているバージョンを登録
    API_VERSIONS.SUPPORTED.forEach((version) => {
      const [major = 0, minor = 0] = version.split('.').map(Number)
      const isDeprecated = API_VERSIONS.DEPRECATED.includes(version)

      this.versionInfo.set(version, {
        version,
        major,
        minor,
        status: isDeprecated ? 'deprecated' : 'supported',
        deprecationDate: isDeprecated ? '2025-12-31' : undefined,
        endOfLifeDate: isDeprecated ? '2026-06-30' : undefined,
      })
    })
  }

  /**
   * 📋 エンドポイントの登録
   */
  registerEndpoint(path: string, endpoint: Omit<ApiEndpoint, 'path'>): void {
    this.endpoints.set(path, { path, ...endpoint })
  }

  /**
   * 🔍 リクエストからバージョン情報を抽出
   */
  parseRequest(request: NextRequest): ApiRequest {
    const url = new URL(request.url)
    let requestedVersion = this.config.defaultVersion
    let versionSource: ApiRequest['versionSource'] = 'default'
    const originalPath = url.pathname
    let normalizedPath = originalPath

    // 1. URLからバージョンを検出
    const urlVersionMatch = originalPath.match(/^\/api\/v(\d+(?:\.\d+)?)\/(.*)$/)
    if (urlVersionMatch) {
      requestedVersion = urlVersionMatch[1]!
      versionSource = 'url'
      normalizedPath = `/api/${urlVersionMatch[2]!}`
    }

    // 2. ヘッダーからバージョンを検出（URLが優先）
    const headerVersion = request.headers.get(this.config.versionHeader)
    if (headerVersion && versionSource === 'default') {
      requestedVersion = headerVersion
      versionSource = 'header'
    }

    // 3. バージョン情報の取得
    const version = this.getVersionInfo(requestedVersion)

    return {
      requestedVersion,
      versionSource,
      originalPath,
      normalizedPath,
      version,
    }
  }

  /**
   * 📊 バージョン情報の取得
   */
  getVersionInfo(version: string): ApiVersion {
    const info = this.versionInfo.get(version)
    if (info) return info

    // バージョンが見つからない場合は未サポートとして扱う
    const [major = 0, minor = 0] = version.split('.').map(Number)
    return {
      version,
      major,
      minor,
      status: 'unsupported',
    }
  }

  /**
   * ✅ バージョンの検証
   */
  validateVersion(apiRequest: ApiRequest): {
    valid: boolean
    warnings: string[]
    errors: string[]
  } {
    const { version, requestedVersion, normalizedPath } = apiRequest
    const warnings: string[] = []
    const errors: string[] = []

    // サポートされていないバージョン
    if (version.status === 'unsupported') {
      const message = `API version ${requestedVersion} is not supported. Supported versions: ${API_VERSIONS.SUPPORTED.join(', ')}`
      if (this.config.rejectUnsupported) {
        errors.push(message)
      } else {
        warnings.push(message)
      }
    }

    // 非推奨バージョン
    if (version.status === 'deprecated' && this.config.enableDeprecationWarnings) {
      warnings.push(
        `API version ${requestedVersion} is deprecated and will be removed on ${version.endOfLifeDate || 'TBD'}`
      )
    }

    // エンドポイント固有の検証
    const endpoint = this.endpoints.get(normalizedPath)
    if (endpoint) {
      if (!endpoint.supportedVersions.includes(requestedVersion)) {
        errors.push(`Endpoint ${normalizedPath} does not support version ${requestedVersion}`)
      }

      if (endpoint.deprecatedVersions?.includes(requestedVersion)) {
        warnings.push(`Endpoint ${normalizedPath} is deprecated for version ${requestedVersion}`)
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    }
  }

  /**
   * 🔄 レスポンスの処理
   */
  processResponse(apiRequest: ApiRequest, response: NextResponse): NextResponse {
    if (!this.config.includeVersionInResponse) return response

    // バージョン情報をヘッダーに追加
    response.headers.set('X-API-Version', apiRequest.requestedVersion)
    response.headers.set('X-API-Version-Source', apiRequest.versionSource)
    response.headers.set('X-API-Current-Version', API_VERSIONS.CURRENT)

    // 非推奨警告
    if (apiRequest.version.status === 'deprecated') {
      response.headers.set('X-API-Deprecation-Warning', 'true')
      if (apiRequest.version.endOfLifeDate) {
        response.headers.set('X-API-End-Of-Life', apiRequest.version.endOfLifeDate)
      }
    }

    return response
  }

  /**
   * 🚨 エラーレスポンスの生成
   */
  createErrorResponse(apiRequest: ApiRequest, errors: string[], warnings: string[] = []): NextResponse {
    const response = NextResponse.json(
      {
        error: 'API_VERSION_ERROR',
        message: 'Invalid API version',
        details: {
          requestedVersion: apiRequest.requestedVersion,
          supportedVersions: API_VERSIONS.SUPPORTED,
          currentVersion: API_VERSIONS.CURRENT,
          errors,
          warnings,
        },
      },
      { status: 400 }
    )

    return this.processResponse(apiRequest, response)
  }

  /**
   * 📋 サポートされているバージョン一覧
   */
  getSupportedVersions(): ApiVersion[] {
    return Array.from(this.versionInfo.values()).filter((v) => v.status === 'supported')
  }

  /**
   * 📋 非推奨バージョン一覧
   */
  getDeprecatedVersions(): ApiVersion[] {
    return Array.from(this.versionInfo.values()).filter((v) => v.status === 'deprecated')
  }

  /**
   * 🔄 バージョン比較
   */
  compareVersions(version1: string, version2: string): -1 | 0 | 1 {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part < v2Part) return -1
      if (v1Part > v2Part) return 1
    }

    return 0
  }

  /**
   * 🔄 マイグレーションパスの取得
   */
  getMigrationPath(fromVersion: string, toVersion: string): string[] {
    // 簡単な実装：直接マイグレーション
    // 実際の実装では、段階的なマイグレーションパスを提供
    if (this.compareVersions(fromVersion, toVersion) === 0) {
      return []
    }

    return [fromVersion, toVersion]
  }
}

/**
 * 🌍 グローバルバージョンマネージャー
 */
export const globalVersionManager = new ApiVersionManager()

/**
 * 🪝 API バージョニング ミドルウェア
 */
export function withApiVersioning(
  handler: (request: NextRequest, apiRequest: ApiRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // リクエストからバージョン情報を解析
      const apiRequest = globalVersionManager.parseRequest(request)

      // バージョンの検証
      const validation = globalVersionManager.validateVersion(apiRequest)

      // エラーがある場合はエラーレスポンスを返す
      if (!validation.valid) {
        return globalVersionManager.createErrorResponse(apiRequest, validation.errors, validation.warnings)
      }

      // ハンドラーを実行
      const response = await handler(request, apiRequest)

      // レスポンスを処理
      return globalVersionManager.processResponse(apiRequest, response)
    } catch (error) {
      console.error('API versioning error:', error)
      return NextResponse.json(
        {
          error: 'INTERNAL_VERSION_ERROR',
          message: 'Internal versioning system error',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * 🔧 便利な関数エクスポート
 */
export const parseApiVersion = globalVersionManager.parseRequest.bind(globalVersionManager)
export const validateApiVersion = globalVersionManager.validateVersion.bind(globalVersionManager)
export const registerApiEndpoint = globalVersionManager.registerEndpoint.bind(globalVersionManager)

export default globalVersionManager
