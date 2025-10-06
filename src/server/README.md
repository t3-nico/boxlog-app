# src/server - tRPC APIサーバー

**重要**: このディレクトリはtRPC APIサーバーの中核です。型安全なAPI設計を実現します。

---

## 📋 役割

### End-to-End Type Safetyを実現するAPIサーバー

```
src/server/
└── api/
    ├── root.ts              # メインルーター統合
    ├── trpc.ts              # tRPC設定・ミドルウェア
    └── routers/
        └── tasks.ts         # タスクAPIルーター
```

**主要機能**:
1. **型安全なAPI** - TypeScriptの型がクライアントまで自動伝播
2. **認証・認可** - ミドルウェアによる統一的な権限管理
3. **バリデーション** - Zodスキーマによる入出力検証
4. **エラーハンドリング** - 統一されたエラーフォーマット
5. **レート制限** - API濫用防止

---

## 🎯 TypeScript公式ベストプラクティス

| 原則 | 説明 | 実装状況 |
|------|------|---------|
| **End-to-End Type Safety** | クライアント～サーバー間の型安全性 | ✅ tRPC実装済み |
| **Server-side Validation** | サーバー側バリデーション | ✅ Zod統合 |
| **Middleware Pattern** | 横断的関心事の分離 | ✅ 認証・レート制限 |
| **Error Handling** | 統一的なエラー処理 | ✅ errorFormatter |

---

## 🔧 ファイル詳細

### 1. root.ts - メインルーター統合

**役割**: 全APIルーターを統合し、AppRouter型を生成

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc'
import { tasksRouter } from './routers/tasks'

export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  // 新規ルーターをここに追加
  // auth: authRouter,
  // users: usersRouter,
})

// この型がクライアント側で使用される
export type AppRouter = typeof appRouter
```

**使用方法**:
```typescript
// クライアント側で型推論
import { type AppRouter } from '@/server/api/root'

// tRPCクライアントが自動的に型を認識
const tasks = trpc.tasks.getAll.useQuery()
//    ^? Task[] - 型が自動推論される
```

---

### 2. trpc.ts - tRPC設定・ミドルウェア

**役割**: tRPCインスタンスの初期化とプロシージャ定義

#### 2.1 コンテキスト作成

```typescript
// リクエストごとのコンテキスト
export interface Context {
  req: NextApiRequest
  res: NextApiResponse
  userId?: string      // 認証済みユーザーID
  sessionId?: string   // セッションID
}

export async function createTRPCContext(
  opts: CreateNextContextOptions
): Promise<Context> {
  // リクエストヘッダーから認証情報を抽出
  const authHeader = opts.req.headers.authorization

  return {
    req: opts.req,
    res: opts.res,
    userId: extractUserId(authHeader),
    sessionId: extractSessionId(authHeader),
  }
}
```

#### 2.2 プロシージャの種類

```typescript
// 1. 公開プロシージャ（認証不要）
export const publicProcedure = t.procedure

// 使用例
export const publicRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` }
    }),
})

// 2. 認証必須プロシージャ
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

// 使用例
export const tasksRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.userId は必ず存在する（型保証）
      const tasks = await db.tasks.findMany({
        where: { userId: ctx.userId }
      })
      return tasks
    }),
})

// 3. 管理者専用プロシージャ
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const isAdmin = checkAdminPermission(ctx.userId)
  if (!isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

// 使用例
export const adminRouter = createTRPCRouter({
  deleteAllUsers: adminProcedure
    .mutation(async () => {
      // 管理者のみ実行可能
      await db.users.deleteMany()
    }),
})

// 4. レート制限付きプロシージャ
export const rateLimitedProcedure = publicProcedure.use(({ ctx, next }) => {
  const clientIp = getClientIP(ctx.req)
  const isAllowed = checkRateLimit(clientIp)

  if (!isAllowed) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
  }

  return next({ ctx })
})

// 使用例
export const publicApiRouter = createTRPCRouter({
  search: rateLimitedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      // レート制限を超えるとエラー
      return searchDatabase(input.query)
    }),
})
```

#### 2.3 エラーフォーマット

```typescript
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const isProduction = process.env.NODE_ENV === 'production'

    // プロダクションでは詳細を隠す
    const message = isProduction && error.code === 'INTERNAL_SERVER_ERROR'
      ? 'サーバーエラーが発生しました'
      : shape.message

    return {
      ...shape,
      message,
      data: {
        ...shape.data,
        // 開発環境でのみスタックトレース
        stack: isProduction ? undefined : error.stack,
      },
    }
  },
})
```

---

### 3. routers/tasks.ts - タスクAPIルーター

**役割**: タスク関連のAPI定義

#### 3.1 基本構造

```typescript
// src/server/api/routers/tasks.ts
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  createTaskInputSchema,
  taskOutputSchema
} from '@/schemas/api/tasks'

export const tasksRouter = createTRPCRouter({
  // タスク作成
  create: protectedProcedure
    .input(createTaskInputSchema)
    .output(taskOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const task = await db.task.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
      })
      return task
    }),

  // タスク一覧取得
  getAll: protectedProcedure
    .input(z.object({
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const tasks = await db.task.findMany({
        where: {
          userId: ctx.userId,
          status: input.status,
        },
      })
      return tasks
    }),

  // タスク更新
  update: protectedProcedure
    .input(updateTaskInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      const task = await db.task.update({
        where: { id, userId: ctx.userId },
        data: updateData,
      })
      return task
    }),

  // タスク削除
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await db.task.delete({
        where: { id: input.id, userId: ctx.userId },
      })
      return { success: true }
    }),
})
```

---

## 🆕 新規ルーター追加ガイド

### Step 1: スキーマ定義

```typescript
// src/schemas/api/projects.ts
import { z } from 'zod'
import { idSchema, titleSchema, descriptionSchema } from './common'

export const createProjectInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  startDate: z.date(),
  endDate: z.date(),
})

export const projectSchema = createProjectInputSchema.extend({
  id: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Project = z.infer<typeof projectSchema>
```

### Step 2: ルーター作成

```typescript
// src/server/api/routers/projects.ts
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { createProjectInputSchema, projectSchema } from '@/schemas/api/projects'

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProjectInputSchema)
    .output(projectSchema)
    .mutation(async ({ input, ctx }) => {
      const project = await db.project.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
      })
      return project
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const projects = await db.project.findMany({
        where: { userId: ctx.userId },
      })
      return projects
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const project = await db.project.findUnique({
        where: { id: input.id, userId: ctx.userId },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'プロジェクトが見つかりません',
        })
      }

      return project
    }),
})
```

### Step 3: root.tsに統合

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc'
import { tasksRouter } from './routers/tasks'
import { projectsRouter } from './routers/projects'  // 追加

export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  projects: projectsRouter,  // 追加
})

export type AppRouter = typeof appRouter
```

### Step 4: クライアント側で使用

```typescript
// src/hooks/api/use-projects.ts
import { trpc } from '@/lib/trpc/client'

export const useProjects = () => {
  const { data: projects } = trpc.projects.getAll.useQuery()
  const createProject = trpc.projects.create.useMutation()

  return { projects, createProject }
}
```

---

## 🔍 高度なパターン

### 1. ネストされたルーター

```typescript
// src/server/api/routers/users/profile.ts
export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await db.profile.findUnique({ where: { userId: ctx.userId } })
  }),
  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      return await db.profile.update({
        where: { userId: ctx.userId },
        data: input,
      })
    }),
})

// src/server/api/routers/users/settings.ts
export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await db.settings.findUnique({ where: { userId: ctx.userId } })
  }),
})

// src/server/api/routers/users/index.ts
export const usersRouter = createTRPCRouter({
  profile: profileRouter,
  settings: settingsRouter,
})

// クライアント側
trpc.users.profile.get.useQuery()
trpc.users.settings.get.useQuery()
```

### 2. カスタムミドルウェア

```typescript
// ログ記録ミドルウェア
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const duration = Date.now() - start

  console.log(`[${type}] ${path} - ${duration}ms`)

  return result
})

// キャッシュミドルウェア
const cacheMiddleware = t.middleware(async ({ path, input, next }) => {
  const cacheKey = `${path}:${JSON.stringify(input)}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const result = await next()
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 60) // 60秒キャッシュ

  return result
})

// 使用
export const cachedProcedure = protectedProcedure
  .use(loggerMiddleware)
  .use(cacheMiddleware)
```

### 3. サブスクリプション（リアルタイム）

```typescript
import { observable } from '@trpc/server/observable'

export const tasksRouter = createTRPCRouter({
  onTaskUpdate: protectedProcedure
    .subscription(({ ctx }) => {
      return observable<Task>((emit) => {
        const onUpdate = (task: Task) => {
          if (task.userId === ctx.userId) {
            emit.next(task)
          }
        }

        // イベントリスナー登録
        eventEmitter.on('task:updated', onUpdate)

        // クリーンアップ
        return () => {
          eventEmitter.off('task:updated', onUpdate)
        }
      })
    }),
})

// クライアント側
trpc.tasks.onTaskUpdate.useSubscription(undefined, {
  onData(task) {
    console.log('Task updated:', task)
  },
})
```

---

## 🧪 テスト方法

### ルーターのユニットテスト

```typescript
// src/server/api/routers/tasks.test.ts
import { describe, it, expect, vi } from 'vitest'
import { appRouter } from '../root'
import { createTRPCContext } from '../trpc'

describe('tasksRouter', () => {
  it('認証済みユーザーはタスクを作成できる', async () => {
    const ctx = await createTRPCContext({
      req: { headers: { authorization: 'Bearer valid-token' } },
      res: {},
    })

    const caller = appRouter.createCaller(ctx)

    const task = await caller.tasks.create({
      title: 'テストタスク',
      priority: 'high',
    })

    expect(task.title).toBe('テストタスク')
    expect(task.userId).toBe(ctx.userId)
  })

  it('未認証ユーザーはエラーになる', async () => {
    const ctx = await createTRPCContext({
      req: { headers: {} },
      res: {},
    })

    const caller = appRouter.createCaller(ctx)

    await expect(
      caller.tasks.create({ title: 'テストタスク', priority: 'high' })
    ).rejects.toThrow('UNAUTHORIZED')
  })
})
```

---

## 🔗 連携ファイル

### Pages Router - APIハンドラー

```typescript
// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
})
```

**詳細**: [src/pages/README.md](../../pages/README.md)

### クライアント - tRPC設定

```typescript
// src/lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@/server/api/root'

export const trpc = createTRPCReact<AppRouter>()
```

### スキーマ - バリデーション

```typescript
// src/schemas/api/tasks.ts
import { z } from 'zod'

export const createTaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high']),
})
```

**詳細**: [src/schemas/README.md](../schemas/README.md)

---

## 🚨 重要な注意事項

### ❌ 禁止事項

```typescript
// ❌ any型の使用禁止
export const badRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const data: any = await fetchData()  // NG
      return data
    }),
})

// ❌ バリデーションの省略禁止
export const badRouter = createTRPCRouter({
  create: protectedProcedure
    // .input(...) がない！
    .mutation(async ({ input }) => {  // NG
      return await db.create(input)
    }),
})

// ❌ エラーハンドリングの省略禁止
export const badRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // NOT_FOUNDのハンドリングなし
      return await db.findUnique({ where: { id: input.id } })  // NG
    }),
})
```

### ✅ ベストプラクティス

```typescript
// ✅ 厳密な型定義
export const goodRouter = createTRPCRouter({
  get: protectedProcedure
    .input(idSchema)
    .output(taskSchema)
    .query(async ({ input, ctx }) => {
      const task = await db.task.findUnique({
        where: { id: input.id, userId: ctx.userId },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'タスクが見つかりません',
        })
      }

      return task
    }),
})

// ✅ バリデーション必須
import { createTaskInputSchema } from '@/schemas/api/tasks'

export const goodRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTaskInputSchema)  // Zodスキーマ
    .mutation(async ({ input, ctx }) => {
      // input は自動的にバリデーション済み
      return await db.task.create({ data: input })
    }),
})

// ✅ エラーハンドリング
export const goodRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.task.delete({
          where: { id: input.id, userId: ctx.userId },
        })
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスクの削除に失敗しました',
          cause: error,
        })
      }
    }),
})
```

---

## 📊 既存の使用箇所

**Pages Router**:
- `src/pages/api/trpc/[trpc].ts` - APIハンドラー

**クライアント設定**:
- `src/lib/trpc/client.ts` - tRPCクライアント
- `src/lib/trpc/index.ts` - エクスポート

**ドキュメント**:
- `src/pages/README.md` - tRPC API説明
- `src/schemas/README.md` - バリデーション説明
- `docs/API_VALIDATION_GUIDE.md` - 詳細ガイド

---

## 🔗 関連ドキュメント

- [tRPC Documentation](https://trpc.io/docs) - tRPC公式ドキュメント
- [Next.js tRPC Guide](https://trpc.io/docs/nextjs) - Next.js統合ガイド
- [Zod Documentation](https://zod.dev) - Zodバリデーション
- [src/schemas/README.md](../schemas/README.md) - スキーマ定義ガイド
- [src/pages/README.md](../pages/README.md) - Pages Router統合
- [CLAUDE.md](../../CLAUDE.md) - プロジェクト開発指針

---

## 🐛 トラブルシューティング

### Q: クライアント側で型が推論されない

```typescript
// A: AppRouter型が正しくエクスポートされているか確認
// src/server/api/root.ts
export type AppRouter = typeof appRouter  // これが必要

// src/lib/trpc/client.ts
import { type AppRouter } from '@/server/api/root'
export const trpc = createTRPCReact<AppRouter>()  // 型パラメータ必須
```

### Q: 認証エラーが発生する

```typescript
// A: createTRPCContext でユーザーIDが正しく設定されているか確認
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const authHeader = opts.req.headers.authorization
  console.log('Auth header:', authHeader)  // デバッグ

  return {
    req: opts.req,
    res: opts.res,
    userId: extractUserId(authHeader),
  }
}
```

### Q: バリデーションエラーの詳細が分からない

```typescript
// A: クライアント側でエラー詳細を確認
const mutation = trpc.tasks.create.useMutation({
  onError: (error) => {
    console.error('Validation error:', error.data?.zodError)
    console.error('Full error:', error)
  },
})
```

---

**最終更新**: 2025-10-06 | Issue #427
