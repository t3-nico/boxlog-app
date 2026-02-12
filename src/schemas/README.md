# src/schemas - APIバリデーションスキーマ

**重要**: このディレクトリはAPIの入出力バリデーション専用です。

---

## 📋 役割

### Zodスキーマによる型安全なAPI設計

```
src/schemas/
└── api/
    ├── common.ts    # 共通スキーマ定義（ID、日付、ページネーション等）
    └── tasks.ts     # タスクAPI用スキーマ
```

**主要機能**:

1. **ランタイムバリデーション** - Zodによる実行時型チェック
2. **TypeScript型生成** - スキーマから自動的に型を生成
3. **ビジネスルール統一** - データ制約を一箇所で管理

---

## 🎯 TypeScript公式ベストプラクティス

| 原則                         | 説明                     | 実装状況              |
| ---------------------------- | ------------------------ | --------------------- |
| **Schema-first Development** | スキーマ駆動開発         | ✅ 実装済み           |
| **Runtime Validation**       | ランタイムバリデーション | ✅ Zod使用            |
| **Single Source of Truth**   | 型の単一真実源           | ✅ スキーマから型生成 |
| **Type Safety**              | 型安全性の確保           | ✅ tRPC統合           |

---

## 🔧 使用方法

### 1. 基本的なスキーマ定義

```typescript
// src/schemas/api/tasks.ts
import { z } from 'zod';
import { idSchema, titleSchema, descriptionSchema } from './common';

export const createTaskInputSchema = z.object({
  title: titleSchema, // 1-200文字、トリム処理あり
  description: descriptionSchema, // 最大2000文字、任意
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
});

// TypeScript型を自動生成
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
```

### 2. tRPCルーターでの使用

```typescript
// src/server/api/routers/tasks.ts
import { createTaskInputSchema, taskOutputSchema } from '@/schemas/api/tasks';

export const tasksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTaskInputSchema) // ← 入力バリデーション
    .output(taskOutputSchema) // ← 出力型定義
    .mutation(async ({ input }) => {
      // input は自動的に型推論される
      const task = await db.task.create({ data: input });
      return task;
    }),
});
```

### 3. クライアント側での使用

```typescript
// src/hooks/api/use-tasks.ts
import { createTaskInputSchema, type CreateTaskInput } from '@/schemas/api/tasks';

export const useCreateTask = () => {
  const createTask = trpc.tasks.create.useMutation();

  const handleCreate = (data: CreateTaskInput) => {
    // バリデーション（任意）
    const result = createTaskInputSchema.safeParse(data);
    if (!result.success) {
      console.error(result.error);
      return;
    }

    // tRPCが自動的にサーバー側でバリデーション
    createTask.mutate(result.data);
  };

  return { handleCreate };
};
```

---

## 📁 ファイル構成

### common.ts - 共通スキーマ

**提供しているスキーマ**:

```typescript
// ID・識別子
idSchema; // UUID形式
emailSchema; // メールアドレス
passwordSchema; // パスワード（8文字以上、大小英数字含む）

// 文字列
titleSchema; // 1-200文字、改行禁止
descriptionSchema; // 最大2000文字
requiredStringSchema; // 必須文字列
trimmedStringSchema; // トリム処理付き

// 日付
dateSchema; // 日付型
futureDateSchema; // 未来の日付のみ

// Enum
prioritySchema; // 'low' | 'medium' | 'high'
statusSchema; // 'todo' | 'in_progress' | 'done' | 'archived'
colorSchema; // HEX色コード (#RRGGBB)

// ページネーション
paginationInputSchema; // ページ・件数・ソート順
paginationOutputSchema; // 総数・総ページ数・前後フラグ
searchInputSchema; // 検索クエリ + ページネーション

// API応答
apiSuccessSchema(T); // 成功レスポンス { success: true, data: T }
apiErrorSchema; // エラーレスポンス { success: false, error: {...} }
apiResponseSchema(T); // 成功 | エラー の Union型

// メタデータ
metadataSchema; // createdAt, updatedAt, version 等
fileSchema; // ファイルアップロード用
```

### tasks.ts - タスクAPI用スキーマ

**主要スキーマ**:

```typescript
// 基本
taskBaseSchema; // タスクの基本情報
taskSchema; // 完全なタスク（ID、メタデータ含む）

// 入力
createTaskInputSchema; // タスク作成
updateTaskInputSchema; // タスク更新（partial）
deleteTaskInputSchema; // タスク削除
searchTasksInputSchema; // タスク検索
getTasksInputSchema; // タスク一覧取得

// 出力
taskOutputSchema; // タスク1件
tasksListOutputSchema; // タスク一覧 + ページネーション
taskStatsOutputSchema; // タスク統計
taskHistoryOutputSchema; // タスク履歴

// バルク操作
bulkUpdateTasksInputSchema; // 一括更新（最大100件）
bulkDeleteTasksInputSchema; // 一括削除（最大100件）

// インポート/エクスポート
importTasksInputSchema; // タスクインポート
exportTasksInputSchema; // タスクエクスポート（JSON/CSV/XLSX）
```

---

## 🆕 新規スキーマ追加ガイド

### Step 1: 共通スキーマの確認

```typescript
// まず common.ts を確認
import { idSchema, titleSchema, descriptionSchema } from './common';

// 既存のスキーマを再利用できないか検討
```

### Step 2: 新規ファイル作成

```typescript
// src/schemas/api/projects.ts
import { z } from 'zod';
import { idSchema, titleSchema, descriptionSchema, dateSchema } from './common';

// 基本スキーマ
export const projectBaseSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine((data) => data.endDate > data.startDate, {
    message: '終了日は開始日より後に設定してください',
    path: ['endDate'],
  });

// 完全なスキーマ
export const projectSchema = projectBaseSchema.extend({
  id: idSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// 入力スキーマ
export const createProjectInputSchema = projectBaseSchema;
export const updateProjectInputSchema = projectBaseSchema.partial().extend({
  id: idSchema,
});

// 型エクスポート
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
```

### Step 3: tRPCルーターに統合

```typescript
// src/server/api/routers/projects.ts
import { createProjectInputSchema, projectSchema } from '@/schemas/api/projects';

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProjectInputSchema)
    .output(projectSchema)
    .mutation(async ({ input }) => {
      // 実装
    }),
});
```

---

## 🔍 バリデーション高度なパターン

### 1. カスタムバリデーション

```typescript
export const taskSchema = z
  .object({
    title: titleSchema,
    priority: prioritySchema,
    estimatedHours: z.number().min(0.1).max(1000).optional(),
  })
  .refine(
    (data) => {
      // 高優先度タスクは見積時間が必須
      if (data.priority === 'high') {
        return data.estimatedHours !== undefined;
      }
      return true;
    },
    {
      message: '高優先度タスクには見積時間を入力してください',
      path: ['estimatedHours'],
    },
  );
```

### 2. 変換処理（Transform）

```typescript
export const userInputSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  email: z.string().toLowerCase().email(),
  age: z.string().transform((val) => parseInt(val, 10)),
});

// 入力: { name: "  John  ", email: "JOHN@EXAMPLE.COM", age: "25" }
// 出力: { name: "John", email: "john@example.com", age: 25 }
```

### 3. 条件付きスキーマ

```typescript
export const taskInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('simple'),
    title: titleSchema,
  }),
  z.object({
    type: z.literal('detailed'),
    title: titleSchema,
    description: descriptionSchema,
    subtasks: z.array(z.string()),
  }),
]);
```

### 4. エラーメッセージのカスタマイズ

```typescript
import { formatValidationErrors } from './common';

const result = taskSchema.safeParse(data);
if (!result.success) {
  const errors = formatValidationErrors(result.error);
  // ["title: タイトルは必須です", "priority: 優先度を選択してください"]
  console.error(errors);
}
```

---

## 🧪 テスト方法

### スキーマのユニットテスト

```typescript
// src/schemas/api/tasks.test.ts
import { describe, it, expect } from 'vitest';
import { createTaskInputSchema } from './tasks';

describe('createTaskInputSchema', () => {
  it('有効なタスクを受け入れる', () => {
    const validTask = {
      title: 'テストタスク',
      priority: 'high',
      dueDate: new Date('2025-12-31'),
    };

    const result = createTaskInputSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it('タイトルが空の場合はエラー', () => {
    const invalidTask = {
      title: '',
      priority: 'high',
    };

    const result = createTaskInputSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('タイトル');
    }
  });

  it('過去の期限日はエラー', () => {
    const invalidTask = {
      title: 'テストタスク',
      priority: 'high',
      dueDate: new Date('2020-01-01'),
    };

    const result = createTaskInputSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
  });
});
```

---

## 📊 既存の使用箇所

**サーバー側**:

- `src/server/api/routers/tasks.ts` - タスクtRPCルーター

**クライアント側**:

- `src/hooks/api/use-tasks.ts` - タスク操作hooks

**ドキュメント**:

- Storybook → Docs/アーキテクチャ/APIバリデーション

---

## 🚨 重要な注意事項

### ❌ 禁止事項

```typescript
// ❌ any型の使用禁止
export const badSchema = z.object({
  data: z.any(), // NG
});

// ❌ 緩すぎるバリデーション
export const badSchema = z.object({
  title: z.string(), // NG: 最小・最大長の指定なし
});

// ❌ 共通スキーマの重複定義
export const myIdSchema = z.string().uuid(); // NG: common.tsのidSchemaを使う
```

### ✅ ベストプラクティス

```typescript
// ✅ 共通スキーマの再利用
import { idSchema, titleSchema } from './common';

// ✅ 適切なバリデーション
export const taskSchema = z.object({
  title: titleSchema, // 1-200文字、改行禁止
  priority: prioritySchema, // enum
});

// ✅ 型エクスポート
export type Task = z.infer<typeof taskSchema>;

// ✅ バリデーションヘルパー
export function validateTask(task: unknown): Task {
  return taskSchema.parse(task);
}
```

---

## 🔗 関連ドキュメント

- Storybook → Docs/アーキテクチャ/APIバリデーション - 詳細なバリデーションガイド
- [tRPC Documentation](https://trpc.io/docs) - tRPC公式ドキュメント
- [Zod Documentation](https://zod.dev) - Zod公式ドキュメント
- [CLAUDE.md](../../CLAUDE.md) - プロジェクト開発指針（Zodバリデーション必須）

---

## 🐛 トラブルシューティング

### Q: スキーマエラーが分かりにくい

```typescript
// A: formatValidationErrors を使用
import { formatValidationErrors } from './common';

const result = schema.safeParse(data);
if (!result.success) {
  const errors = formatValidationErrors(result.error);
  console.error(errors.join('\n'));
}
```

### Q: 型推論がうまくいかない

```typescript
// A: 明示的に型をエクスポート
export type Task = z.infer<typeof taskSchema>

// 使用側
import { type Task } from '@/schemas/api/tasks'
const task: Task = { ... }
```

### Q: 既存データに対してスキーマを適用したい

```typescript
// A: parse() でランタイムバリデーション
try {
  const validatedData = taskSchema.parse(existingData);
  // validatedData は型安全
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(formatValidationErrors(error));
  }
}
```

---

**最終更新**: 2025-10-06 | Issue #426
