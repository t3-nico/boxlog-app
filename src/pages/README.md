# src/pages - tRPC API専用（Pages Router）

**重要**: このディレクトリはtRPC API専用です。新規ページの追加は禁止。

---

## 📋 役割

### tRPC APIエンドポイント専用

```
src/pages/
└── api/
    └── trpc/
        └── [trpc].ts  ← tRPC APIハンドラー
```

**エンドポイト**: `/api/trpc/*`

---

## 🎯 App Routerとの使い分け

| 用途          | ディレクトリ          | ルーター                       |
| ------------- | --------------------- | ------------------------------ |
| **ページ**    | `src/app/`            | ✅ App Router                  |
| **tRPC API**  | `src/pages/api/trpc/` | ✅ Pages Router                |
| **その他API** | `src/app/api/`        | ✅ App Router (Route Handlers) |

---

## 🚨 重要な注意事項

### ❌ 禁止事項

```tsx
// ❌ Pages Routerに新規ページ追加禁止
src / pages / about.tsx; // NG
src / pages / dashboard / index.tsx; // NG
```

### ✅ 正しい追加方法

```tsx
// ✅ App Routerに追加
src / app / about / page.tsx; // OK
src / app / dashboard / page.tsx; // OK

// ✅ tRPC APIのみPages Router
src / pages / api / trpc / [trpc].ts; // OK（既存）
```

---

## 🔧 技術的背景

### なぜPages Routerが必要？

**tRPCの制約**:

```typescript
// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from '@trpc/server/adapters/next';

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  // ← Pages Router形式のAPIハンドラーが必須
});
```

**理由**:

- tRPCの`createNextApiHandler`はPages Router形式が必須
- App RouterのRoute Handlersでは代替不可能
- Next.js 14でも共存が公式サポート

---

## 📖 CLAUDE.md との整合性

### 公式方針

> **CLAUDE.md**: "99% App Router移行完了（Pages RouterはtRPC APIのみ共存）"

✅ **明示的に共存が許可されている**

### 移行状況

- ✅ すべてのページ: App Routerに移行済み
- ✅ tRPC API: Pages Routerで維持（技術的制約）
- ❌ Pages Routerでの新規ページ追加: 禁止

---

## 🔄 tRPC APIの仕組み

### リクエストフロー

```
Client
  ↓ (tRPC client)
/api/trpc/taskRouter.getAll
  ↓
src/pages/api/trpc/[trpc].ts (Pages Router)
  ↓
src/server/api/root.ts (appRouter)
  ↓
src/server/api/routers/tasks.ts (taskRouter)
  ↓
Database
```

### ファイル構成

```
src/
├── pages/
│   └── api/
│       └── trpc/
│           └── [trpc].ts        # ← APIハンドラー（Pages Router）
│
└── server/
    └── api/
        ├── root.ts              # ← ルーター統合
        ├── trpc.ts              # ← tRPC設定
        └── routers/
            ├── tasks.ts         # ← タスクAPI
            ├── events.ts        # ← イベントAPI
            └── ...
```

---

## 📝 [trpc].ts の役割

### 主要機能

1. **APIハンドラー**

   ```typescript
   export default createNextApiHandler({
     router: appRouter,
     createContext: createTRPCContext,
   });
   ```

2. **エラーハンドリング**

   ```typescript
   onError: ({ error, type, path }) => {
     console.error('tRPC Error:', { type, path, error });
   };
   ```

3. **キャッシュ設定**

   ```typescript
   responseMeta: ({ type }) => ({
     headers: {
       'cache-control': type === 'query' ? 's-maxage=1, stale-while-revalidate' : 'no-cache',
     },
   });
   ```

4. **リクエスト設定**
   ```typescript
   export const config = {
     api: {
       bodyParser: { sizeLimit: '10mb' },
       externalResolver: true,
     },
   };
   ```

---

## 🆕 新規API追加時のガイド

### tRPC APIを追加する場合

```typescript
// ✅ 正しい: src/server/api/routers/ に追加
// src/server/api/routers/newFeature.ts
export const newFeatureRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    // 実装
  }),
});

// src/server/api/root.ts に追加
export const appRouter = createTRPCRouter({
  tasks: taskRouter,
  events: eventRouter,
  newFeature: newFeatureRouter, // ← 追加
});
```

**重要**: `src/pages/api/trpc/[trpc].ts` の変更は不要！

### REST APIを追加する場合

```typescript
// ✅ 正しい: App RouterのRoute Handlers
// src/app/api/webhook/route.ts
export async function POST(request: Request) {
  // 実装
}
```

---

## 🔗 関連ドキュメント

- [Next.js App Router](https://nextjs.org/docs/app)
- [tRPC Documentation](https://trpc.io/docs)
- [Pages Router API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [CLAUDE.md](../../CLAUDE.md) - App Router移行方針

---

## 🐛 トラブルシューティング

### Q: 新規ページをどこに作る？

A: `src/app/` にApp Router形式で作成してください。

### Q: REST APIを追加したい

A: `src/app/api/` にRoute Handlers形式で作成してください。

### Q: tRPC APIを追加したい

A: `src/server/api/routers/` に新規ルーターを作成してください。

### Q: Pages Routerを削除できる？

A: いいえ。tRPCの技術的制約により必須です。

---

**最終更新**: 2025-10-06 | Issue #423
