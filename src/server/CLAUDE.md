# server/ - tRPC API開発ガイド

**対象**: AIアシスタント・開発者
**役割**: tRPCサーバー開発の必須ルールとパターン

---

## 📋 必須ルール

### 1. サービス層パターン（必須）

**ビジネスロジックはサービスクラスに集約**する。ルーターは入出力管理のみ。

```
src/server/
├── api/
│   ├── root.ts              # ルーター統合
│   ├── trpc.ts              # tRPC設定
│   └── routers/
│       ├── plans/
│       │   ├── crud.ts      # ルーター（薄い）
│       │   └── utils.ts     # ユーティリティ
│       ├── notifications.ts
│       └── profile.ts
└── services/                 # サービス層
    ├── plans/
    │   ├── plan-service.ts  # PlanService クラス
    │   ├── types.ts
    │   └── index.ts
    └── notifications/
        └── notification-service.ts
```

### 2. ルーターの責務

```typescript
// ✅ 正しいパターン（ルーターは薄く）
import { createPlanService, PlanServiceError } from '@/server/services/plans';

export const plansCrudRouter = createTRPCRouter({
  list: protectedProcedure.input(filterSchema).query(async ({ ctx, input }) => {
    const service = createPlanService(ctx.supabase);
    try {
      return await service.list({ userId: ctx.userId, ...input });
    } catch (error) {
      handleServiceError(error);
    }
  }),
});

// ❌ 禁止パターン（ルーターにロジック混在）
export const badRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ビジネスロジックがルーター内にある
    const query = ctx.supabase.from('plans').select('*');
    if (input?.status) query = query.eq('status', input.status);
    // ... 長いロジック
  }),
});
```

### 3. エラーハンドリング

**統一パターン**: 共通モジュール `@/server/services/errors` の `handleServiceError()` を使用

```typescript
// src/server/api/routers/plans/crud.ts
import { handleServiceError } from '@/server/services/errors';

export const plansCrudRouter = createTRPCRouter({
  list: protectedProcedure.input(filterSchema).query(async ({ ctx, input }) => {
    const service = createPlanService(ctx.supabase);
    try {
      return await service.list({ userId: ctx.userId, ...input });
    } catch (error) {
      handleServiceError(error); // 共通モジュールを使用
    }
  }),
});
```

**注意**: 各ルーターに独自の `handleServiceError` を定義しない。新しいエラーコードが必要な場合は `src/server/services/errors.ts` の `ERROR_CODE_MAP` に追加する。

---

## 🏗️ サービス層の実装パターン

### サービスクラス

```typescript
// src/server/services/notifications/notification-service.ts
export class NotificationService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async list(options: ListOptions): Promise<Notification[]> {
    const { userId, isRead, limit } = options;

    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit ?? 50);

    if (error) {
      throw new NotificationServiceError('FETCH_FAILED', error.message);
    }

    return data;
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotificationServiceError('UPDATE_FAILED', error.message);
    }
  }
}

export class NotificationServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}
```

### ファクトリ関数

```typescript
export function createNotificationService(supabase: SupabaseClient<Database>) {
  return new NotificationService(supabase);
}
```

---

## 📁 ファイル配置ルール

### 新規サービス作成時

```
src/server/services/{domain}/
├── {domain}-service.ts    # サービスクラス
├── types.ts               # 型定義
├── index.ts               # エクスポート
└── __tests__/
    └── {domain}-service.test.ts
```

### 命名規則

| 種類           | 命名                    | 例                          |
| -------------- | ----------------------- | --------------------------- |
| サービスクラス | `{Domain}Service`       | `NotificationService`       |
| エラークラス   | `{Domain}ServiceError`  | `NotificationServiceError`  |
| ファクトリ     | `create{Domain}Service` | `createNotificationService` |
| 型ファイル     | `types.ts`              | -                           |

---

## 🔧 プロシージャの種類

| プロシージャ           | 用途          | 認証           |
| ---------------------- | ------------- | -------------- |
| `publicProcedure`      | 公開API       | 不要           |
| `protectedProcedure`   | 認証必須API   | 必要           |
| `adminProcedure`       | 管理者API     | 必要（管理者） |
| `rateLimitedProcedure` | レート制限API | 不要           |

```typescript
// 使用例
export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure.input(filterSchema).query(...),
  markAsRead: protectedProcedure.input(idSchema).mutation(...),
})
```

---

## ⚠️ 禁止事項

1. **`any` 型の使用禁止**
2. **バリデーションの省略禁止** - 必ず `.input(zodSchema)` を使用
3. **ルーター内でのビジネスロジック禁止** - サービス層に委譲
4. **直接 `TRPCError` を throw 禁止** - `handleServiceError()` を使用

---

## 🧪 テスト

### サービス層のテスト

```typescript
// src/server/services/notifications/__tests__/notification-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { NotificationService } from '../notification-service';
import { createMockSupabase } from '@/test/trpc-test-helpers';

describe('NotificationService', () => {
  it('should fetch notifications', async () => {
    const mockSupabase = createMockSupabase();
    // モック設定...

    const service = new NotificationService(mockSupabase as any);
    const result = await service.list({ userId: 'test-user' });

    expect(result).toBeDefined();
  });
});
```

### ルーターのテスト

テストヘルパー: `/src/test/trpc-test-helpers.ts`

```typescript
import { createAuthenticatedContext, createTestCaller } from '@/test/trpc-test-helpers';

describe('notificationsRouter', () => {
  it('should list notifications', async () => {
    const ctx = createAuthenticatedContext('test-user-id');
    const caller = createTestCaller(notificationsRouter, ctx);

    const result = await caller.list();
    expect(result).toBeDefined();
  });
});
```

---

## 📚 関連ドキュメント

- `/src/server/README.md` - 詳細なAPI設計ガイド
- `/src/test/trpc-test-helpers.ts` - テストヘルパー
- `/src/features/HOOKS_PATTERN.md` - フロントエンドフックパターン
- `/CLAUDE.md` - プロジェクト全体の開発指針

---

**最終更新**: 2026-01-06
