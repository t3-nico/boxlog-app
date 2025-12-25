# src/app/api - API Routes

Next.js API Routesディレクトリです。tRPC APIとの共存構成になっています。

## 📁 ディレクトリ構成

```
src/app/api/
├── middleware/           # API middleware（認証・レート制限）
│   ├── types.ts         # 型定義
│   ├── error-handler.ts # エラーハンドリング
│   ├── auth.ts          # 認証
│   ├── rate-limit.ts    # レート制限
│   ├── cors.ts          # CORS設定
│   ├── utils.ts         # ヘルパー関数
│   ├── index.ts         # 統一エクスポート
│   └── README.md        # Middleware詳細ドキュメント
├── middleware.ts        # Middlewareエクスポート
└── README.md            # このファイル
```

## 🎯 Middleware システム

詳細は [`middleware/README.md`](middleware/README.md) を参照してください。

### 主要機能

1. **エラーハンドリング** (`withErrorHandling`)
   - 統一エラーレスポンス
   - Sentry連携
   - メトリクス収集

2. **認証** (`withAuth`)
   - Bearer token検証
   - ユーザー情報取得

3. **レート制限** (`withRateLimit`)
   - クライアントIP別制限
   - インメモリ実装

4. **CORS** (`setCorsHeaders`)
   - オリジン制御
   - プリフライト対応

## 📖 使用例

### 基本的なAPI

```typescript
import { withErrorHandling } from '@/app/api/middleware';

export const GET = withErrorHandling(async (req, context) => {
  return { message: 'Hello World', requestId: context.requestId };
});
```

### 認証付きAPI

```typescript
import { withAuth } from '@/app/api/middleware';

export const POST = withAuth(async (req, context) => {
  const userId = context.userId;
  const body = await req.json();
  // ... 処理
  return { success: true, userId };
});
```

### レート制限付きAPI

```typescript
import { withRateLimit } from '@/app/api/middleware';

export const GET = withRateLimit(
  async (req, context) => {
    return { data: 'rate-limited-data' };
  },
  {
    rateLimit: {
      windowMs: 60000, // 1分間
      maxRequests: 100, // 最大100リクエスト
    },
  },
);
```

## 🔄 tRPC APIとの関係

### 共存構成

- **tRPC API**: `pages/api/trpc/[trpc].ts` (Pages Router)
- **REST API**: `src/app/api/` (App Router)

### 使い分け

| 用途        | 推奨              |
| ----------- | ----------------- |
| 型安全なAPI | tRPC              |
| 外部公開API | REST (App Router) |
| Webhooks    | REST (App Router) |
| 内部API     | tRPC              |

## 🚨 重要な注意事項

1. **エラーハンドリング必須**: すべてのAPIで`withErrorHandling`使用
2. **認証確認**: 保護されたエンドポイントは`withAuth`使用
3. **レート制限推奨**: 公開APIは`withRateLimit`使用
4. **型安全性**: TypeScript strict mode準拠

## 📝 レスポンス形式

### 成功レスポンス

```json
{
  "success": true,
  "data": { ... },
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

## 🔗 関連ドキュメント

- **Middleware詳細**: [`middleware/README.md`](middleware/README.md)
- **エラーパターン**: [`src/config/error-patterns/`](../../config/error-patterns/)
- **tRPC Router**: [`src/server/routers/`](../../server/routers/)

---

**📖 参照**: [Next.js API Routes公式ドキュメント](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
**最終更新**: 2025-10-06
