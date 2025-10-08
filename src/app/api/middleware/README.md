# src/app/api/middleware - API ミドルウェアシステム

Next.js API Routes用の統一エラー処理・認証・レート制限システムを提供します。

## 📁 ファイル構成

```
src/app/api/middleware/
├── index.ts              # 統一エクスポート
├── types.ts              # 型定義
├── error-handler.ts      # エラーハンドリング
├── auth.ts               # 認証ミドルウェア
├── rate-limit.ts         # レート制限
├── cors.ts               # CORS設定・タイムアウト
├── utils.ts              # ヘルパー関数
└── README.md             # このファイル
```

## 🎯 各ファイルの役割

### types.ts（型定義）

```typescript
import type {
  ApiResponse, // API統一レスポンス型
  ApiContext, // リクエストコンテキスト
  ApiHandler, // ハンドラー関数型
  MiddlewareConfig, // ミドルウェア設定
} from './middleware/types'
```

### error-handler.ts（エラーハンドリング）

```typescript
import { withErrorHandling } from './middleware/error-handler'

const handler = withErrorHandling(
  async (req, context) => {
    // エラーは自動的にキャッチ・正規化されます
    return { data: 'success' }
  },
  {
    enableErrorReporting: true, // Sentryレポート有効化
    enableMetrics: true, // メトリクス収集
    requestTimeout: 30000, // 30秒タイムアウト
  }
)
```

### auth.ts（認証）

```typescript
import { withAuth } from './middleware/auth'

const protectedHandler = withAuth(async (req, context) => {
  // context.userId が自動的に設定されます
  return { userId: context.userId }
})
```

### rate-limit.ts（レート制限）

```typescript
import { withRateLimit } from './middleware/rate-limit'

const limitedHandler = withRateLimit(
  async (req, context) => {
    return { data: 'limited' }
  },
  {
    rateLimit: {
      windowMs: 60000, // 1分間
      maxRequests: 100, // 最大100リクエスト
    },
  }
)
```

### cors.ts（CORS・タイムアウト）

```typescript
import { setCorsHeaders, createTimeoutPromise } from './middleware/cors'

// CORS設定
const response = setCorsHeaders(req, ['https://example.com'])

// タイムアウト
const timeoutPromise = createTimeoutPromise(5000) // 5秒
```

### utils.ts（ユーティリティ）

```typescript
import {
  generateRequestId,
  extractUserId,
  extractSessionId,
  getHttpStatusCode,
  createJsonResponse,
  logRequest,
  recordMetrics,
  getClientId,
} from './middleware/utils'
```

## 📖 使用例

### 基本的なAPI（エラーハンドリングのみ）

```typescript
import { withErrorHandling } from '@/app/api/middleware'

export const GET = withErrorHandling(async (req, context) => {
  return {
    message: 'Hello World',
    requestId: context.requestId,
  }
})
```

### 認証が必要なAPI

```typescript
import { withAuth } from '@/app/api/middleware'

export const POST = withAuth(
  async (req, context) => {
    // Bearerトークンが検証済み
    const userId = context.userId

    const body = await req.json()
    // ... 処理

    return { success: true, userId }
  },
  {
    enableErrorReporting: true,
    enableMetrics: true,
  }
)
```

### レート制限付きAPI

```typescript
import { withRateLimit } from '@/app/api/middleware'

export const GET = withRateLimit(
  async (req, context) => {
    // 1分間に100リクエストまで
    return { data: 'rate-limited-data' }
  },
  {
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100,
    },
    enableMetrics: true,
  }
)
```

### 複合的なミドルウェア

```typescript
import { withAuth, withRateLimit } from '@/app/api/middleware'

// 認証 + レート制限
const handler = withAuth(
  async (req, context) => {
    return { userId: context.userId, data: 'protected' }
  },
  {
    enableErrorReporting: true,
  }
)

export const POST = withRateLimit(handler, {
  rateLimit: { windowMs: 60000, maxRequests: 10 },
})
```

### CORS設定付きAPI

```typescript
import { withErrorHandling } from '@/app/api/middleware'

export const GET = withErrorHandling(
  async (req, context) => {
    return { data: 'public' }
  },
  {
    enableCors: true,
    corsOrigins: ['https://example.com', 'https://app.example.com'],
  }
)
```

## 🔄 レスポンス形式

### 成功レスポンス

```json
{
  "success": true,
  "data": {
    "message": "Success"
  },
  "meta": {
    "requestId": "req_1234567890_abc123",
    "timestamp": "2025-10-06T12:00:00.000Z",
    "executionTime": 123
  }
}
```

### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": 1001,
    "category": "Authentication",
    "message": "Invalid token",
    "userMessage": "認証に失敗しました",
    "timestamp": "2025-10-06T12:00:00.000Z",
    "requestId": "req_1234567890_abc123"
  },
  "meta": {
    "requestId": "req_1234567890_abc123",
    "timestamp": "2025-10-06T12:00:00.000Z",
    "executionTime": 45
  }
}
```

## 🚨 エラーコードとHTTPステータス

| ErrorCode範囲 | HTTPステータス | 説明                         |
| ------------- | -------------- | ---------------------------- |
| 1000-1999     | 401/403        | 認証・認可エラー             |
| 2000-2999     | 400            | バリデーションエラー         |
| 3000-3999     | 404            | Not Found                    |
| 5000-6999     | 503            | システム・外部サービスエラー |
| 7000-7999     | 429            | レート制限                   |
| その他        | 500            | 内部サーバーエラー           |

## 🔗 関連ファイル

- **エラーパターン定義**: [`src/config/error-patterns/`](../../../config/error-patterns/)
- **グローバルエラーハンドラー**: [`src/lib/error-handler.ts`](../../../lib/error-handler.ts)
- **Sentry統合**: [`src/lib/sentry.ts`](../../../lib/sentry.ts)
- **メインエクスポート**: [`src/app/api/middleware.ts`](../middleware.ts)

## 📝 開発ガイドライン

1. **すべてのAPI Routeでミドルウェア使用**: エラーハンドリングの統一のため
2. **認証が必要な場合は withAuth 使用**: トークン検証を自動化
3. **公開APIはレート制限推奨**: DoS攻撃対策
4. **本番環境では enableErrorReporting: true**: Sentryでエラー追跡
5. **メトリクス収集で性能監視**: enableMetrics: true で実行時間を記録

---

**📖 参照**: [`src/app/api/middleware.ts`](../middleware.ts)
**最終更新**: 2025-10-06
