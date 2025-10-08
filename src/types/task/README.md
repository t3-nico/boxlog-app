# src/types/task - タスク型定義

タスク管理システムのための型定義を提供します。

## 📁 ファイル構成

```
src/types/task/
├── index.ts          # 統一エクスポート（後方互換性）
├── core.ts           # 基本型（Task, TaskLabel, TaskComment等）
├── extended.ts       # 拡張型（TaskDetailed, TaskBoard, TaskTemplate）
├── operations.ts     # 操作型（フィルター、ソート、統計）
└── README.md         # このファイル
```

## 🎯 各ファイルの役割

### core.ts（基本型）

```typescript
import type {
  Task, // 基本タスク型（BaseTaskのエイリアス）
  TaskType, // 'feature' | 'bug' | 'improvement' | ...
  TaskLabel, // ラベル情報
  TaskComment, // コメント
  TaskAttachment, // 添付ファイル
  TaskTimeEntry, // 時間追跡
  TaskHistory, // 変更履歴
} from './task/core'
```

### extended.ts（拡張型）

```typescript
import type {
  TaskDetailed, // 詳細なプロジェクト管理情報を含むタスク
  CreateTaskDetailedInput, // タスク作成入力
  UpdateTaskDetailedInput, // タスク更新入力
  TaskBoard, // カンバンボード設定
  TaskBoardColumn, // ボードカラム
  TaskTemplate, // タスクテンプレート
} from './task/extended'
```

### operations.ts（操作型）

```typescript
import type {
  TaskFilters, // フィルター条件
  TaskSort, // ソート条件
  TaskQuery, // クエリ条件（フィルター + ソート + ページング）
  TaskListResponse, // 一覧レスポンス
  TaskStats, // 統計情報
} from './task/operations'
```

## 📖 使用例

### 基本的なタスク操作

```typescript
import type { Task, TaskStatus } from '@/types/task'

const task: Task = {
  id: '1',
  title: 'タスク実装',
  status: 'in_progress',
  priority: 'high',
  description: '詳細説明',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
```

### 詳細タスク管理

```typescript
import type { TaskDetailed, CreateTaskDetailedInput } from '@/types/task'

const createInput: CreateTaskDetailedInput = {
  title: '新機能実装',
  description: '詳細な説明',
  status: 'todo',
  priority: 'high',
  type: 'feature',
  createdBy: 'user-1',
  assigneeId: 'user-2',
  estimatedHours: 8,
  labels: [{ id: '1', name: 'Frontend', color: '#3b82f6' }],
  tags: ['TypeScript', 'React'],
}
```

### タスクフィルタリング

```typescript
import type { TaskFilters, TaskQuery } from '@/types/task'

const filters: TaskFilters = {
  status: ['in_progress', 'review'],
  priority: ['high', 'critical'],
  assignee: ['user-1'],
  createdAfter: '2025-01-01',
  hasAttachments: true,
}

const query: TaskQuery = {
  filters,
  sort: [
    { field: 'priority', direction: 'desc' },
    { field: 'created_at', direction: 'asc' },
  ],
  page: 1,
  limit: 20,
  include: ['comments', 'attachments', 'labels'],
}
```

### タスク統計の取得

```typescript
import type { TaskStats } from '@/types/task'

function displayStats(stats: TaskStats) {
  console.log(`全タスク数: ${stats.total}`)
  console.log(`完了率: ${stats.completionRate}%`)
  console.log(`期限切れ: ${stats.overdue}件`)
  console.log(`推定工数合計: ${stats.totalEstimatedHours}時間`)
  console.log(`実績工数合計: ${stats.totalActualHours}時間`)
}
```

### タスクボードの設定

```typescript
import type { TaskBoard, TaskBoardColumn } from '@/types/task'

const board: TaskBoard = {
  id: 'board-1',
  name: '開発ボード',
  description: 'スプリント開発用カンバン',
  columns: [
    {
      id: 'col-1',
      name: 'ToDo',
      status: ['todo'],
      color: '#6b7280',
      order: 1,
      limit: 10, // WIP制限
    },
    {
      id: 'col-2',
      name: '進行中',
      status: ['in_progress'],
      color: '#3b82f6',
      order: 2,
      limit: 5,
    },
    {
      id: 'col-3',
      name: 'レビュー',
      status: ['review'],
      color: '#f59e0b',
      order: 3,
      limit: 3,
    },
    {
      id: 'col-4',
      name: '完了',
      status: ['done'],
      color: '#10b981',
      order: 4,
    },
  ],
  createdBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### タスクテンプレートの活用

```typescript
import type { TaskTemplate } from '@/types/task'

const bugTemplate: TaskTemplate = {
  id: 'template-1',
  name: 'バグ報告テンプレート',
  description: 'バグ報告用の標準テンプレート',
  defaultTitle: '[BUG] ',
  defaultDescription: `## 現象
何が起きているか

## 再現手順
1.
2.
3.

## 期待動作
本来どうあるべきか

## 環境
- ブラウザ:
- OS: `,
  defaultType: 'bug',
  defaultPriority: 'high',
  defaultTags: ['bug'],
  customFields: {
    severity: 'medium',
    affectedUsers: 0,
  },
  createdBy: 'user-1',
  createdAt: new Date().toISOString(),
  isPublic: true,
}
```

## 🔗 関連ファイル

- **基本型の定義**: [`src/types/index.ts`](../index.ts)
- **タスクストア**: `src/stores/taskStore.ts`
- **タスクAPI**: `src/server/routers/task/`
- **タスクコンポーネント**: `src/features/tasks/`

## 📝 型の使い分け

| 型             | 用途                           |
| -------------- | ------------------------------ |
| `Task`         | 基本的なタスク表示・一覧       |
| `TaskDetailed` | 詳細画面・プロジェクト管理機能 |
| `TaskFilters`  | 検索・フィルタリング機能       |
| `TaskStats`    | ダッシュボード・分析画面       |
| `TaskBoard`    | カンバンボード機能             |
| `TaskTemplate` | タスク作成の効率化             |

## 🚨 注意事項

1. **基本型の再エクスポート**: `TaskStatus`, `TaskPriority`, `Task` は `src/types/index.ts` が元の定義です
2. **後方互換性**: 既存コードは `import { TaskDetailed } from '@/types/task'` のまま動作します
3. **型の選択**: 必要最小限の型を使用（全体で `TaskDetailed` を使うのは過剰）

---

**📖 参照**: [`src/types/README.md`](../README.md)
**最終更新**: 2025-10-06
