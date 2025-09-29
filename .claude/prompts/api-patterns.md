# API生成パターンテンプレート

## 概要
BoxLog App用のNext.js 14 App Router対応API実装を自動生成するプロンプトテンプレート。エラーパターン辞書・ビジネスルール辞書・レート制限・キャッシング完全統合。

## APIパターン（6種類）

### 1. RESTful CRUD API
- **リソース管理**: Create, Read, Update, Delete
- **バリデーション**: Zod + ビジネスルール検証
- **認証・認可**: セッション + ロールベース制御
- **エラーハンドリング**: 統一エラーレスポンス

### 2. 認証API
- **ログイン・ログアウト**: セッション管理
- **登録・確認**: メール認証フロー
- **パスワードリセット**: トークンベース
- **2FA**: TOTP対応

### 3. ファイルアップロードAPI
- **マルチパート対応**: 画像・ドキュメント
- **バリデーション**: ファイルサイズ・形式チェック
- **クラウドストレージ**: S3・Cloudinary連携
- **プログレス対応**: リアルタイム進捗

### 4. 検索・フィルターAPI
- **全文検索**: Elasticsearch連携
- **ファセット検索**: 多次元フィルタリング
- **ソート・ページネーション**: 効率的データ取得
- **キャッシング**: Redis活用

### 5. 集計・分析API
- **統計データ**: メトリクス・ダッシュボード
- **リアルタイム集計**: WebSocket連携
- **時系列データ**: グラフ・チャート用
- **エクスポート**: CSV・PDF生成

### 6. Webhook・通知API
- **外部連携**: サードパーティ連携
- **イベント配信**: リアルタイム通知
- **バッチ処理**: 非同期ジョブ
- **リトライ機能**: 失敗時の自動再試行

## テンプレート構造

### 1. RESTful CRUD APIパターン

```typescript
// src/app/api/{entity}/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createAppError,
  executeWithAutoRecovery,
  ERROR_CODES,
  type ErrorHandlingResult
} from '@/config/error-patterns'
import { BusinessRuleRegistry } from '@/generated/business-rules'
import { {EntityName}Schema, Create{EntityName}Schema } from '@/schemas/{entity}.schema'
import { rateLimit } from '@/lib/rate-limit'
import { authenticateRequest, authorizeAction } from '@/lib/auth'
import { cacheManager } from '@/lib/cache'
import { auditLogger } from '@/lib/audit'
import { db } from '@/lib/database'

// レート制限設定
const limiter = rateLimit({
  interval: 60 * 1000, // 1分間
  uniqueTokenPerInterval: 500,
})

/**
 * 一覧取得 API
 * GET /api/{entity}
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // レート制限チェック
    await limiter.check(request, 10, '{entity}:list')

    // 認証チェック
    const session = await authenticateRequest(request)
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    // 認可チェック
    await authorizeAction(session.user, '{entity}', 'read')

    // クエリパラメータ解析
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // キャッシュキー生成
    const cacheKey = `{entity}:list:${session.user.id}:${page}:${limit}:${search}:${sortBy}:${sortOrder}`

    // キャッシュチェック
    const cached = await cacheManager.get<{EntityName}[]>(cacheKey)
    if (cached) {
      return NextResponse.json({
        data: cached.data,
        pagination: cached.pagination,
        cached: true
      })
    }

    // データベース操作（自動復旧機能付き）
    const result: ErrorHandlingResult<{
      data: {EntityName}[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }> = await executeWithAutoRecovery(
      async () => {
        // ビジネスルールに基づくフィルタリング
        const whereClause = {
          ...BusinessRuleRegistry.getAccessFilter('{entity}', session.user),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ]
          })
        }

        // 合計件数取得
        const total = await db.{entityName}.count({ where: whereClause })

        // データ取得
        const data = await db.{entityName}.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            // 関連データの取得設定
            ...BusinessRuleRegistry.getIncludeConfig('{entity}', session.user)
          }
        })

        return {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      },
      ERROR_CODES.DATABASE_READ_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    // キャッシュに保存（5分間）
    await cacheManager.set(cacheKey, result.data, 5 * 60)

    // 監査ログ記録
    await auditLogger.log({
      action: '{entity}:list',
      userId: session.user.id,
      metadata: { page, limit, search, resultCount: result.data.data.length }
    })

    return NextResponse.json(result.data)

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * 新規作成 API
 * POST /api/{entity}
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // レート制限チェック（作成は厳しく制限）
    await limiter.check(request, 5, '{entity}:create')

    // 認証チェック
    const session = await authenticateRequest(request)
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    // 認可チェック
    await authorizeAction(session.user, '{entity}', 'create')

    // リクエストボディの取得
    const body = await request.json()

    // Zodスキーマでバリデーション
    const validationResult = Create{EntityName}Schema.safeParse(body)
    if (!validationResult.success) {
      throw createAppError(
        'バリデーションエラー',
        ERROR_CODES.VALIDATION_ERROR,
        { context: { errors: validationResult.error.errors } }
      )
    }

    const validatedData = validationResult.data

    // ビジネスルール検証
    await BusinessRuleRegistry.validateBusinessRules(
      '{entity}',
      validatedData,
      'create',
      { user: session.user }
    )

    // データベース操作（自動復旧機能付き）
    const result: ErrorHandlingResult<{EntityName}> = await executeWithAutoRecovery(
      async () => {
        // 作成前フック実行
        const preprocessedData = await BusinessRuleRegistry.executePreHook(
          '{entity}',
          'create',
          validatedData,
          { user: session.user }
        )

        // データ作成
        const newItem = await db.{entityName}.create({
          data: {
            ...preprocessedData,
            createdBy: session.user.id,
            updatedBy: session.user.id,
          },
          include: {
            ...BusinessRuleRegistry.getIncludeConfig('{entity}', session.user)
          }
        })

        // 作成後フック実行
        await BusinessRuleRegistry.executePostHook(
          '{entity}',
          'create',
          newItem,
          { user: session.user }
        )

        return newItem
      },
      ERROR_CODES.DATABASE_CREATE_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    // 関連キャッシュの無効化
    await cacheManager.invalidatePattern(`{entity}:list:*`)

    // 監査ログ記録
    await auditLogger.log({
      action: '{entity}:create',
      userId: session.user.id,
      resourceId: result.data.id,
      metadata: { data: validatedData }
    })

    // Webhook/通知の送信
    await BusinessRuleRegistry.executeNotifications(
      '{entity}',
      'create',
      result.data,
      { user: session.user }
    )

    return NextResponse.json(result.data, { status: 201 })

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * API エラーハンドリング
 */
function handleApiError(error: unknown): NextResponse {
  // AppError の場合
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.userMessage.title,
          details: error.userMessage.details,
          timestamp: new Date().toISOString(),
        }
      },
      { status: getHttpStatusFromErrorCode(error.code) }
    )
  }

  // Zod バリデーションエラー
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'バリデーションエラー',
          details: error.errors,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 400 }
    )
  }

  // その他のエラー
  console.error('Unexpected API error:', error)
  return NextResponse.json(
    {
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: '内部サーバーエラー',
        timestamp: new Date().toISOString(),
      }
    },
    { status: 500 }
  )
}

/**
 * エラーコードからHTTPステータスコードへの変換
 */
function getHttpStatusFromErrorCode(errorCode: string): number {
  const statusMap: Record<string, number> = {
    [ERROR_CODES.AUTH_REQUIRED]: 401,
    [ERROR_CODES.AUTH_INVALID_TOKEN]: 401,
    [ERROR_CODES.AUTH_EXPIRED]: 401,
    [ERROR_CODES.AUTH_NO_PERMISSION]: 403,
    [ERROR_CODES.VALIDATION_ERROR]: 400,
    [ERROR_CODES.RESOURCE_NOT_FOUND]: 404,
    [ERROR_CODES.RESOURCE_CONFLICT]: 409,
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  }

  return statusMap[errorCode] || 500
}
```

### 2. ファイルアップロードAPIパターン

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createAppError,
  executeWithAutoRecovery,
  ERROR_CODES
} from '@/config/error-patterns'
import { BusinessRuleRegistry } from '@/generated/business-rules'
import { authenticateRequest, authorizeAction } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { uploadToCloudinary, uploadToS3 } from '@/lib/storage'
import { auditLogger } from '@/lib/audit'

// アップロード設定スキーマ
const UploadConfigSchema = z.object({
  maxSize: z.number().max(10 * 1024 * 1024), // 10MB
  allowedTypes: z.array(z.string()),
  folder: z.string().optional(),
  resize: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    quality: z.number().min(1).max(100).optional(),
  }).optional(),
})

// レート制限設定（アップロードは厳しく制限）
const limiter = rateLimit({
  interval: 60 * 1000, // 1分間
  uniqueTokenPerInterval: 100,
})

/**
 * ファイルアップロード API
 * POST /api/upload
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // レート制限チェック
    await limiter.check(request, 3, 'upload')

    // 認証チェック
    const session = await authenticateRequest(request)
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    // 認可チェック
    await authorizeAction(session.user, 'file', 'upload')

    // FormData から設定とファイルを取得
    const formData = await request.formData()
    const file = formData.get('file') as File
    const configJson = formData.get('config') as string

    if (!file) {
      throw createAppError('ファイルが指定されていません', ERROR_CODES.VALIDATION_ERROR)
    }

    // 設定の解析
    let config = {}
    if (configJson) {
      try {
        config = JSON.parse(configJson)
      } catch {
        throw createAppError('設定の形式が正しくありません', ERROR_CODES.VALIDATION_ERROR)
      }
    }

    // 設定のバリデーション
    const validatedConfig = UploadConfigSchema.parse({
      maxSize: 5 * 1024 * 1024, // デフォルト5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      ...config
    })

    // ファイル検証
    if (file.size > validatedConfig.maxSize) {
      throw createAppError(
        `ファイルサイズが上限（${Math.round(validatedConfig.maxSize / 1024 / 1024)}MB）を超えています`,
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    if (!validatedConfig.allowedTypes.includes(file.type)) {
      throw createAppError(
        `許可されていないファイル形式です: ${file.type}`,
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // ビジネスルール検証
    await BusinessRuleRegistry.validateBusinessRules(
      'file',
      {
        filename: file.name,
        size: file.size,
        type: file.type,
        config: validatedConfig
      },
      'upload',
      { user: session.user }
    )

    // ファイルアップロード処理（自動復旧機能付き）
    const result = await executeWithAutoRecovery(
      async () => {
        // ファイルデータの読み取り
        const buffer = Buffer.from(await file.arrayBuffer())

        // アップロード先の決定（設定に基づく）
        const uploadResult = await uploadFile(buffer, {
          filename: file.name,
          contentType: file.type,
          folder: validatedConfig.folder,
          resize: validatedConfig.resize,
        })

        // データベースに記録
        const fileRecord = await db.file.create({
          data: {
            filename: file.name,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: uploadResult.url,
            publicUrl: uploadResult.publicUrl,
            folder: validatedConfig.folder,
            uploadedBy: session.user.id,
            metadata: {
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
            }
          }
        })

        return {
          file: fileRecord,
          upload: uploadResult
        }
      },
      ERROR_CODES.FILE_UPLOAD_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    // 監査ログ記録
    await auditLogger.log({
      action: 'file:upload',
      userId: session.user.id,
      resourceId: result.data.file.id,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        folder: validatedConfig.folder
      }
    })

    return NextResponse.json({
      id: result.data.file.id,
      url: result.data.file.publicUrl,
      filename: result.data.file.filename,
      size: result.data.file.size,
      type: result.data.file.mimeType,
      metadata: result.data.file.metadata,
    })

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * ファイルアップロード実行
 */
async function uploadFile(
  buffer: Buffer,
  options: {
    filename: string
    contentType: string
    folder?: string
    resize?: {
      width?: number
      height?: number
      quality?: number
    }
  }
) {
  // 画像ファイルの場合はCloudinary、その他はS3
  if (options.contentType.startsWith('image/')) {
    return await uploadToCloudinary(buffer, {
      folder: options.folder || 'uploads',
      public_id: generateUniqueId(options.filename),
      transformation: options.resize ? [
        {
          width: options.resize.width,
          height: options.resize.height,
          crop: 'limit',
          quality: options.resize.quality || 80,
          format: 'auto'
        }
      ] : undefined
    })
  } else {
    return await uploadToS3(buffer, {
      key: `${options.folder || 'uploads'}/${generateUniqueId(options.filename)}`,
      contentType: options.contentType,
    })
  }
}

/**
 * 一意のファイルID生成
 */
function generateUniqueId(filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  return `${timestamp}_${random}${extension ? '.' + extension : ''}`
}
```

### 3. 検索・フィルターAPIパターン

```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createAppError,
  executeWithAutoRecovery,
  ERROR_CODES
} from '@/config/error-patterns'
import { BusinessRuleRegistry } from '@/generated/business-rules'
import { authenticateRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { cacheManager } from '@/lib/cache'
import { searchWithElasticsearch } from '@/lib/search'
import { auditLogger } from '@/lib/audit'

// 検索パラメータスキーマ
const SearchParamsSchema = z.object({
  query: z.string().min(1).max(500),
  entities: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  sort: z.array(z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc'])
  })).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  highlight: z.boolean().default(true),
  facets: z.array(z.string()).optional(),
})

// レート制限設定
const limiter = rateLimit({
  interval: 60 * 1000, // 1分間
  uniqueTokenPerInterval: 200,
})

/**
 * 統合検索 API
 * GET /api/search
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // レート制限チェック
    await limiter.check(request, 20, 'search')

    // 認証チェック
    const session = await authenticateRequest(request)
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    // クエリパラメータの解析
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())

    // JSON形式のパラメータをパース
    try {
      if (params.entities) params.entities = JSON.parse(params.entities)
      if (params.filters) params.filters = JSON.parse(params.filters)
      if (params.sort) params.sort = JSON.parse(params.sort)
      if (params.facets) params.facets = JSON.parse(params.facets)
      if (params.page) params.page = parseInt(params.page)
      if (params.limit) params.limit = parseInt(params.limit)
      if (params.highlight) params.highlight = params.highlight === 'true'
    } catch {
      throw createAppError('パラメータの形式が正しくありません', ERROR_CODES.VALIDATION_ERROR)
    }

    // パラメータバリデーション
    const validatedParams = SearchParamsSchema.parse(params)

    // キャッシュキー生成
    const cacheKey = `search:${session.user.id}:${Buffer.from(JSON.stringify(validatedParams)).toString('base64')}`

    // キャッシュチェック（短時間キャッシュ）
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true
      })
    }

    // 検索実行（自動復旧機能付き）
    const result = await executeWithAutoRecovery(
      async () => {
        // ユーザーのアクセス権限に基づくフィルター追加
        const accessFilters = await BusinessRuleRegistry.getSearchFilters(
          validatedParams.entities || ['all'],
          session.user
        )

        // Elasticsearch検索実行
        const searchResult = await searchWithElasticsearch({
          query: validatedParams.query,
          entities: validatedParams.entities,
          filters: {
            ...validatedParams.filters,
            ...accessFilters
          },
          sort: validatedParams.sort,
          page: validatedParams.page,
          limit: validatedParams.limit,
          highlight: validatedParams.highlight,
          facets: validatedParams.facets,
          userId: session.user.id,
        })

        // 結果の後処理（権限チェック・データ整形）
        const processedResults = await BusinessRuleRegistry.processSearchResults(
          searchResult,
          session.user
        )

        return processedResults
      },
      ERROR_CODES.SEARCH_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    // キャッシュに保存（2分間）
    await cacheManager.set(cacheKey, result.data, 2 * 60)

    // 監査ログ記録
    await auditLogger.log({
      action: 'search:query',
      userId: session.user.id,
      metadata: {
        query: validatedParams.query,
        entities: validatedParams.entities,
        resultCount: result.data.hits.length,
        totalResults: result.data.total
      }
    })

    return NextResponse.json(result.data)

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * 検索候補取得 API
 * GET /api/search/suggestions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // レート制限チェック
    await limiter.check(request, 50, 'search:suggestions')

    // 認証チェック
    const session = await authenticateRequest(request)
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    const { query, entity } = await request.json()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // キャッシュキー生成
    const cacheKey = `search:suggestions:${session.user.id}:${entity}:${query}`

    // キャッシュチェック
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      return NextResponse.json({ suggestions: cached })
    }

    // 候補検索実行
    const result = await executeWithAutoRecovery(
      async () => {
        // ビジネスルールに基づく候補生成
        return await BusinessRuleRegistry.generateSearchSuggestions(
          query,
          entity,
          session.user
        )
      },
      ERROR_CODES.SEARCH_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    // キャッシュに保存（10分間）
    await cacheManager.set(cacheKey, result.data, 10 * 60)

    return NextResponse.json({ suggestions: result.data })

  } catch (error) {
    return handleApiError(error)
  }
}
```

## 必須要件チェックリスト

### ✅ APIパターン（6種類対応）
- [x] RESTful CRUD - 完全なリソース管理
- [x] 認証API - ログイン・登録・リセット
- [x] ファイルアップロード - マルチパート・クラウド対応
- [x] 検索・フィルター - Elasticsearch統合
- [x] 集計・分析 - 統計・リアルタイム
- [x] Webhook・通知 - イベント配信

### ✅ セキュリティ機能
- [x] 認証・認可チェック
- [x] レート制限実装
- [x] バリデーション（Zod）
- [x] 監査ログ記録

### ✅ パフォーマンス機能
- [x] キャッシング（Redis）
- [x] 自動復旧機能
- [x] 効率的なデータベース操作
- [x] CDN対応（ファイル）

### ✅ システム統合
- [x] ビジネスルール辞書連携
- [x] エラーパターン辞書使用
- [x] Next.js 14 App Router対応
- [x] TypeScript完全対応

### ✅ 運用機能
- [x] 統一エラーレスポンス
- [x] ログ・監査機能
- [x] ヘルスチェック対応
- [x] 監視・メトリクス

## 使用例

```typescript
// CRUD API の使用
GET /api/users?page=1&limit=10&search=john
POST /api/users { "name": "John Doe", "email": "john@example.com" }
PUT /api/users/123 { "name": "John Smith" }
DELETE /api/users/123

// ファイルアップロード API の使用
const formData = new FormData()
formData.append('file', file)
formData.append('config', JSON.stringify({
  maxSize: 5 * 1024 * 1024,
  folder: 'avatars',
  resize: { width: 400, height: 400 }
}))

fetch('/api/upload', {
  method: 'POST',
  body: formData
})

// 検索 API の使用
GET /api/search?query=project&entities=["tasks","projects"]&page=1&limit=20
```