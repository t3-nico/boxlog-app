# types/ - グローバル型定義

BoxLogアプリケーション全体で使用されるグローバル型定義を集約するディレクトリです。

## 📁 ファイル構成

| ファイル | 行数 | 役割 | 主要な型 |
|---------|------|------|---------|
| **index.ts** | 140行 | 統一エクスポート | Task, TaskStatus, TaskPriority |
| **task.ts** | 306行 | タスク型 | TaskLabel, TaskComment, TaskAttachment |
| **tags.ts** | 244行 | タグシステム | Tag, TagWithChildren, TagHierarchy |
| **supabase.ts** | 189行 | DB型 | Database, Tables, Enums |
| **smart-folders.ts** | 176行 | スマートフォルダー | SmartFolder, SmartFolderRule |
| **common.ts** | 150行 | 共通型 | User, UserSettings, Pagination |
| **i18n.ts** | 145行 | 国際化 | Locale, Translation, I18nConfig |
| **chronotype.ts** | 124行 | クロノタイプ | ChronotypeProfile, SleepPattern |
| **sidebar.ts** | 85行 | サイドバー | SidebarConfig, MenuItem |
| **unified.ts** | 75行 | 統一基本型 | ApiResponse, ApiError |
| **trash.ts** | 35行 | ゴミ箱 | TrashedItem, TrashFilter |
| **global.d.ts** | 20行 | グローバル型拡張 | BatteryManager, Navigator |

**合計**: 1,709行（12ファイル）

## 🎯 このディレクトリの目的

### ✅ 配置すべき型

**複数featureで共有される型のみ**を配置します：

```typescript
// ✅ グローバル型 - 3箇所以上で使用
export interface Task {
  id: string
  title: string
  status: TaskStatus
  // ...
}

// ✅ 基本型 - アプリ全体で使用
export type TaskStatus = 'backlog' | 'scheduled' | 'in_progress' | 'completed'
```

### ❌ 配置すべきでない型

**feature固有の型**は各featureディレクトリに配置（コロケーション原則）：

```typescript
// ❌ NG: カレンダー機能でのみ使用される型
// → src/features/calendar/types.ts に配置すべき
export interface CalendarViewSettings { ... }

// ❌ NG: タスク機能でのみ使用される型
// → src/features/tasks/types.ts に配置すべき
export interface TaskBoardColumn { ... }
```

## 🚀 基本的な使い方

### 1. 型のインポート

```typescript
// ✅ 推奨：index.tsから一括インポート
import { Task, TaskStatus, TaskPriority, Tag, User } from '@/types'

// ❌ 非推奨：個別ファイルへの直接アクセス
import { Task } from '@/types/task'
import { Tag } from '@/types/tags'
```

**理由**: `index.ts` が統一エクスポートを提供しているため

### 2. コンポーネントでの使用

```typescript
import { Task, TaskStatus } from '@/types'

interface TaskCardProps {
  task: Task
  onStatusChange: (status: TaskStatus) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  return (
    <div>
      <h3>{task.title}</h3>
      <p>Status: {task.status}</p>
    </div>
  )
}
```

### 3. API関連での使用

```typescript
import { Task, TaskInsert, TaskUpdate, ApiResponse } from '@/types'

// タスク作成
async function createTask(data: TaskInsert): Promise<ApiResponse<Task>> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return response.json()
}

// タスク更新
async function updateTask(id: string, data: TaskUpdate): Promise<ApiResponse<Task>> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  return response.json()
}
```

## 📋 主要な型カテゴリ

### 1. タスク関連（task.ts, index.ts）

```typescript
// 基本型
export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  planned_start: string
  planned_duration: number
  tags?: string[]
  // ...
}

// ステータス
export type TaskStatus = 'backlog' | 'scheduled' | 'in_progress' | 'completed' | 'stopped'

// 優先度
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// 操作型
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>
```

### 2. タグ関連（tags.ts）

```typescript
export interface Tag {
  id: string
  name: string
  color: string
  parent_id?: string
  // ...
}

export interface TagWithChildren extends Tag {
  children: Tag[]
}
```

### 3. ユーザー・設定関連（common.ts）

```typescript
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  settings?: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  // ...
}
```

### 4. API関連（unified.ts）

```typescript
export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  success: boolean
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

### 5. データベース型（supabase.ts）

```typescript
// Supabaseから自動生成される型定義
export interface Database {
  public: {
    Tables: {
      tasks: { ... }
      tags: { ... }
      // ...
    }
  }
}
```

## 💡 ベストプラクティス

### 1. 型 vs インターフェース

TypeScript公式推奨に従います：

```typescript
// ✅ interface優先（拡張可能性）
export interface Task {
  id: string
  title: string
}

// 拡張が容易
export interface ExtendedTask extends Task {
  description: string
}

// ✅ type使用可（Union Types）
export type TaskStatus = 'backlog' | 'scheduled' | 'in_progress'
export type TaskPriority = 'low' | 'medium' | 'high'
```

### 2. Utility Types活用

```typescript
// ✅ TypeScript標準Utility Types
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id'>>
export type TaskKeys = keyof Task
export type TaskValues = Task[keyof Task]
```

### 3. 型の命名規則

```typescript
// ✅ 明確な命名
export interface Task { ... }           // エンティティ
export type TaskStatus = ...           // 状態
export type TaskInsert = ...           // 作成用
export type TaskUpdate = ...           // 更新用
export interface TaskFilter { ... }    // フィルター用

// ❌ 曖昧な命名
export interface TaskData { ... }      // 何のデータ？
export type TaskType = ...             // 型の型？
```

### 4. any型禁止

```typescript
// ✅ 明確な型定義
export interface TaskComment {
  id: string
  content: string
  userId: string
}

// ❌ any型禁止（CLAUDE.mdルール）
export interface TaskComment {
  id: string
  content: any        // NG
  metadata: any       // NG
}
```

## 🆕 新しい型を追加する場合

### 判断基準

| 条件 | 配置場所 |
|------|---------|
| **3箇所以上で使用** | `src/types/` にグローバル型として追加 |
| **1-2箇所のみ** | 各featureの `types.ts` にローカル型として追加 |
| **feature固有** | そのfeatureディレクトリに配置 |

### 追加手順

#### 1. グローバル型を追加する場合

```typescript
// src/types/your-feature.ts
export interface YourFeature {
  id: string
  name: string
  // ...
}

export type YourFeatureStatus = 'active' | 'inactive'
```

#### 2. index.tsに追加

```typescript
// src/types/index.ts
export * from './your-feature'
```

#### 3. 使用例をREADMEに追加

このREADMEを更新してください。

## ⚠️ レガシー型について

### 削除予定の型

以下の型は `@deprecated` マークが付いており、将来削除されます：

```typescript
// ❌ 使用禁止
/**
 * @deprecated 旧CreateTaskData - TaskInsertを使用してください
 */
export interface CreateTaskData { ... }

/**
 * @deprecated 旧SmartFilter - 将来削除予定
 */
export interface SmartFilter { ... }
```

**新しいコードでは使用しないでください**。

### 移行ガイド

| 旧型 | 新型 |
|------|------|
| `CreateTaskData` | `TaskInsert` |
| `SmartFilter` | `SmartFolder` |
| `APIResponse` | `ApiResponse` (unified.ts) |
| `APIError` | `ApiError` (unified.ts) |

## 📊 使用状況

現在、`@/types` からのインポートは **80箇所** で使用されています。

```bash
# 使用箇所を確認
grep -r "import.*from.*'@/types'" src --include="*.ts" --include="*.tsx"
```

主な使用箇所：
- `src/features/tasks/` - タスク管理機能
- `src/features/tags/` - タグ管理機能
- `src/stores/` - Zustand状態管理
- `src/server/routers/` - tRPCルーター

## ❓ よくある質問

### Q1: どこに型を定義すべきか？

**A**: 3箇所以上で使用される場合のみ `src/types/` に配置してください。

```typescript
// ✅ 正しい判断
// カレンダー・ボード・テーブルで使用 → src/types/
export interface Task { ... }

// ❌ 間違った判断
// カレンダー機能でのみ使用 → src/features/calendar/types.ts
export interface CalendarViewSettings { ... }
```

### Q2: `@deprecated` 型はいつ削除されるか？

**A**: すべての使用箇所が新しい型に移行した後、次のメジャーバージョンで削除予定です。

参考: [Issue #430](https://github.com/t3-nico/boxlog-app/issues/430)

### Q3: 新しい型を追加する際の注意点は？

**A**:
1. まず既存の型で代用できないか確認
2. 使用箇所が3箇所未満ならfeatureローカルに配置
3. 必ず `index.ts` に追加してエクスポート
4. このREADMEに使用例を追加

### Q4: 型ファイルが300行を超えたら？

**A**: CLAUDE.mdルールに従い、ファイルを分割してください。

例: `task.ts`（306行）→ `task/` ディレクトリに分割

参考: [Issue #429](https://github.com/t3-nico/boxlog-app/issues/429)

### Q5: `common.ts` と `unified.ts` の違いは？

**A**:
- **unified.ts**: 基本エンティティ型（Task, Tag等）、API型
- **common.ts**: アプリケーション共通型（User, Settings等）、ユーティリティ型

現在、重複があるため整理中です。

参考: [Issue #431](https://github.com/t3-nico/boxlog-app/issues/431)

## 🔗 関連ドキュメント

- [CLAUDE.md](../CLAUDE.md) - TypeScript厳格型付けルール
- [src/CLAUDE.md](../CLAUDE.md#63-型定義とスキーマ) - 型定義配置ルール
- [TypeScript公式 - Type vs Interface](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [TypeScript公式 - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## 🔍 関連Issue

- [#428](https://github.com/t3-nico/boxlog-app/issues/428) - このREADME追加
- [#429](https://github.com/t3-nico/boxlog-app/issues/429) - task.ts分割（306行→300行以下）
- [#430](https://github.com/t3-nico/boxlog-app/issues/430) - レガシー型定義削除
- [#431](https://github.com/t3-nico/boxlog-app/issues/431) - common.tsとunified.ts統合

---

**最終更新**: 2025-10-06
**使用箇所**: 80箇所
