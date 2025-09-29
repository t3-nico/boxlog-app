# API自動バリデーション強化システム ガイド

## 📋 概要

BoxLogアプリケーションにおけるAPI自動バリデーション強化システム（Zod + tRPC）の完全ガイドです。
型安全な API 開発とランタイムバリデーションの自動化を実現します。

## 🏗️ システム構成

### コア技術スタック

- **tRPC**: エンドツーエンド型安全 API
- **Zod**: ランタイムスキーマバリデーション
- **React Query**: クライアント状態管理・キャッシュ
- **ビジネスルール辞書**: 自動ルール適用
- **エラーパターン辞書**: 統一エラーハンドリング

## 📁 ファイル構成

```
src/
├── server/api/              # tRPC サーバー設定
│   ├── root.ts             # メインルーター
│   ├── trpc.ts             # tRPC設定・ミドルウェア
│   └── routers/
│       └── tasks.ts        # タスク API ルーター
├── schemas/api/            # Zod スキーマ定義
│   ├── common.ts           # 共通スキーマ
│   └── tasks.ts            # タスクスキーマ
├── lib/
│   ├── trpc/               # tRPC クライアント
│   │   ├── index.ts        # メインクライアント
│   │   └── client.ts       # 設定関数
│   ├── business-rules-zod.ts # ビジネスルール統合
│   └── api/
│       └── error-handler.ts # エラーハンドリング
├── hooks/api/              # React フック
│   └── use-tasks.ts        # タスク操作フック
├── providers/
│   └── trpc-provider.tsx   # tRPC プロバイダー
└── pages/api/trpc/
    └── [trpc].ts           # Next.js API エンドポイント
```

## 🚀 基本的な使用方法

### 1. API定義（サーバー側）

```typescript
// src/server/api/routers/tasks.ts
export const tasksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTaskInputSchema)  // Zod自動バリデーション
    .output(taskOutputSchema)      // 出力型保証
    .mutation(async ({ input, ctx }) => {
      // ビジネスルール自動適用済み
      const task = await createTask(input)
      return task
    }),
})
```

### 2. スキーマ定義

```typescript
// src/schemas/api/tasks.ts
export const createTaskInputSchema = taskBaseSchema
  .omit({ status: true })
  .extend({
    dueDate: z.date()
      .min(new Date(), '期限は現在時刻以降を指定してください')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.parentTaskId && !data.projectId) {
        return false
      }
      return true
    },
    {
      message: '親タスクがある場合はプロジェクトも指定してください',
      path: ['projectId'],
    }
  )
```

### 3. クライアント側使用

```typescript
// コンポーネント内
import { useTaskOperations } from '@/hooks/api/use-tasks'

function TaskForm() {
  const { create, update, toggleComplete } = useTaskOperations()

  const handleSubmit = (data: CreateTaskInput) => {
    create.mutate(data, {
      onSuccess: (task) => {
        console.log('タスク作成成功:', task.title)
      },
      onError: (error) => {
        console.error('作成エラー:', error.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム内容 */}
    </form>
  )
}
```

## 🔧 高度な機能

### ビジネスルール統合

```typescript
// 自動的にビジネスルール辞書が適用される
const validatedSchema = createTaskValidationSchema(createTaskInputSchema)

// カスタムバリデーション追加
const customSchema = createComplexValidation(
  baseSchema,
  (data) => {
    // 複雑な条件チェック
    return {
      isValid: data.priority === 'high' || data.dueDate != null,
      message: '高優先度タスクまたは期限設定が必要です',
      path: ['priority', 'dueDate']
    }
  }
)
```

### エラーハンドリング

```typescript
import { useErrorHandler } from '@/lib/api/error-handler'

function MyComponent() {
  const { handleTRPCError, handleZodError } = useErrorHandler()

  const mutation = useMutation({
    onError: (error) => {
      if (error instanceof TRPCError) {
        const translated = handleTRPCError(error)
        toast.error(translated.userMessage)
      }
    }
  })
}
```

### 楽観的更新

```typescript
const updateTask = trpc.tasks.update.useMutation({
  onMutate: async (updateData) => {
    // 進行中のクエリをキャンセル
    await utils.tasks.list.cancel()

    // 現在のデータを保存
    const previousTasks = utils.tasks.list.getData()

    // 楽観的更新
    utils.tasks.list.setData(previousTasks, (old) => {
      return {
        ...old,
        tasks: old.tasks.map((task) =>
          task.id === updateData.id ? { ...task, ...updateData } : task
        ),
      }
    })

    return { previousTasks }
  },
  onError: (error, updateData, context) => {
    // エラー時にロールバック
    if (context?.previousTasks) {
      utils.tasks.list.setData(context.previousTasks, context.previousTasks)
    }
  },
})
```

## 📝 スキーマ設計パターン

### 1. 基本スキーマ

```typescript
export const taskBaseSchema = z.object({
  title: titleSchema,                    // 共通スキーマ使用
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  dueDate: futureDateSchema.optional(),
  estimatedHours: z.number().min(0.1).max(1000).optional(),
})
```

### 2. 入力スキーマ（作成・更新）

```typescript
// 作成用（一部フィールド除外・追加バリデーション）
export const createTaskInputSchema = taskBaseSchema
  .omit({ status: true })
  .extend({
    dueDate: z.date().min(new Date()).optional(),
  })

// 更新用（全フィールド任意・条件バリデーション）
export const updateTaskInputSchema = taskBaseSchema
  .partial()
  .extend({ id: idSchema })
  .refine((data) => {
    if (data.completed === true) {
      return data.progress === 100 || data.progress === undefined
    }
    return true
  })
```

### 3. 出力スキーマ

```typescript
export const taskOutputSchema = taskBaseSchema.extend({
  id: idSchema,
  completed: z.boolean(),
  ...metadataSchema.shape,  // 作成日時、更新日時等
})
```

## 🎯 ベストプラクティス

### 1. エラーメッセージの日本語化

```typescript
// 分かりやすいエラーメッセージ
z.string()
  .min(1, 'タイトルは必須です')
  .max(200, 'タイトルは200文字以内で入力してください')

// 業務ロジックに応じたメッセージ
.refine(
  (title) => !title.includes('禁止ワード'),
  'タイトルに禁止されている単語が含まれています'
)
```

### 2. 型の再利用

```typescript
// 型エクスポートで一元管理
export type Task = z.infer<typeof taskSchema>
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>

// フロントエンドで型安全に使用
const [task, setTask] = useState<Task | null>(null)
```

### 3. バリデーションの分離

```typescript
// 共通バリデーションを関数化
export function validateTaskTitle(title: string): boolean {
  return titleSchema.safeParse(title).success
}

export function validateTaskDueDate(dueDate: Date): boolean {
  return futureDateSchema.safeParse(dueDate).success
}
```

## 🧪 テスト戦略

### 1. スキーマバリデーションテスト

```typescript
describe('タスクスキーマバリデーション', () => {
  it('正常なデータが検証をパスする', () => {
    const validInput: CreateTaskInput = {
      title: '新しいタスク',
      priority: 'medium',
    }

    expect(createTaskInputSchema.safeParse(validInput).success).toBe(true)
  })

  it('無効なデータで検証が失敗する', () => {
    const invalidInput = { title: '' }
    const result = createTaskInputSchema.safeParse(invalidInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('必須')
    }
  })
})
```

### 2. API統合テスト

```typescript
describe('tRPC API統合テスト', () => {
  it('タスク作成APIが正常に動作する', async () => {
    const caller = tasksRouter.createCaller(mockContext)

    const input: CreateTaskInput = {
      title: 'テストタスク',
      priority: 'high',
    }

    const result = await caller.create(input)

    expect(result.id).toBeDefined()
    expect(result.title).toBe(input.title)
  })
})
```

## 🔍 トラブルシューティング

### よくある問題と解決策

#### 1. Transform後のスキーマでメソッドが使用できない

```typescript
// ❌ 問題のあるコード
const schema = z.string().transform(val => val.trim()).min(1)

// ✅ 正しいコード
const schema = z.string().min(1).transform(val => val.trim())
```

#### 2. UUIDバリデーションエラー

```typescript
// テストでは有効なUUIDを使用
const testId = '550e8400-e29b-41d4-a716-446655440000'
```

#### 3. 日付バリデーションの不一致

```typescript
// 共通スキーマを使用して一貫性確保
import { futureDateSchema } from '@/schemas/api/common'
```

## 📊 パフォーマンス考慮事項

### 1. スキーマの最適化

- 複雑なrefineは最小限に
- 共通スキーマの再利用
- transform処理の軽量化

### 2. キャッシュ戦略

```typescript
// 適切なstaleTime設定
const query = trpc.tasks.list.useQuery(input, {
  staleTime: 2 * 60 * 1000,  // 2分間新鮮
  cacheTime: 5 * 60 * 1000,  // 5分間保持
})
```

### 3. バッチ処理

```typescript
// 複数操作の一括実行
const bulkUpdate = trpc.tasks.bulkUpdate.useMutation({
  onSuccess: () => {
    // 一度だけキャッシュ更新
    utils.tasks.list.invalidate()
  }
})
```

## 🔗 関連ドキュメント

- [ビジネスルール辞書ガイド](./BUSINESS_RULES_GUIDE.md)
- [エラーパターン辞書](../src/config/error-patterns.ts)
- [tRPC公式ドキュメント](https://trpc.io/)
- [Zod公式ドキュメント](https://zod.dev/)

## 📈 今後の拡張予定

- [ ] GraphQL スキーマ自動生成
- [ ] OpenAPI仕様書自動生成
- [ ] バリデーションルールの動的更新
- [ ] より高度なキャッシュ戦略
- [ ] リアルタイム同期機能

---

**作成日**: 2025-01-15
**最終更新**: 2025-01-15
**バージョン**: 1.0.0