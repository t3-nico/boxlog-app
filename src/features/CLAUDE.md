# features/ - 機能開発ルール

BoxLog機能モジュール開発ガイドライン。

## 🏗️ 機能モジュール構造

### 標準ディレクトリ構成

```
features/tasks/
├── components/      # 機能専用UIコンポーネント
│   ├── TaskList.tsx
│   ├── TaskList.test.tsx
│   ├── TaskCard.tsx
│   └── TaskCard.test.tsx
├── hooks/           # 機能専用カスタムフック
│   ├── useTaskFilter.ts
│   └── useTaskFilter.test.ts
├── stores/          # 状態管理（Zustand）
│   ├── useTaskStore.ts
│   └── useTaskStore.test.ts
├── utils/           # 機能専用ユーティリティ
│   ├── taskHelpers.ts
│   └── taskHelpers.test.ts
├── types.ts         # 機能専用型定義
└── index.ts         # エクスポート管理
```

---

## 🎯 機能モジュール開発ステップ

### Step 1: 型定義

```tsx
// features/tasks/types.ts
export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface TaskFilters {
  status?: Task['status']
  priority?: Task['priority']
  searchQuery?: string
}
```

### Step 2: 状態管理

```tsx
// features/tasks/stores/useTaskStore.ts
import { create } from 'zustand'
import { Task } from '../types'

interface TaskStore {
  tasks: Task[]
  filters: TaskFilters
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setFilters: (filters: TaskFilters) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filters: {},
  fetchTasks: async () => {
    // 実装
  },
  // ...
}))
```

### Step 3: カスタムフック

```tsx
// features/tasks/hooks/useTaskFilter.ts
import { useMemo } from 'react'
import { useTaskStore } from '../stores/useTaskStore'

export const useTaskFilter = () => {
  const { tasks, filters } = useTaskStore()

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.searchQuery && !task.title.includes(filters.searchQuery)) return false
      return true
    })
  }, [tasks, filters])

  return { filteredTasks }
}
```

### Step 4: UIコンポーネント

```tsx
// features/tasks/components/TaskList.tsx
import { FC } from 'react'
import { colors, spacing } from '@/config/theme'
import { useTaskFilter } from '../hooks/useTaskFilter'
import { TaskCard } from './TaskCard'

export const TaskList: FC = () => {
  const { filteredTasks } = useTaskFilter()

  return (
    <div className={`${colors.background.base} ${spacing.component.lg}`}>
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

### Step 5: エクスポート管理

```tsx
// features/tasks/index.ts
export { TaskList, TaskCard } from './components'
export { useTaskStore } from './stores/useTaskStore'
export { useTaskFilter } from './hooks/useTaskFilter'
export type { Task, TaskFilters } from './types'
```

---

## 🚨 必須ルール

### 1. バリデーション実装

```tsx
// ✅ Zodスキーマ使用
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  status: z.enum(['todo', 'in_progress', 'done']),
})

const createTask = async (taskData: Omit<Task, 'id'>) => {
  // バリデーション
  const result = taskSchema.safeParse(taskData)
  if (!result.success) {
    throw new Error(result.error.message)
  }

  // タスク作成
  await api.createTask(result.data)
}
```

### 2. エラーハンドリング

```tsx
import { AppError, ERROR_CODES } from '@/lib/errors'

try {
  await createTask(taskData)
} catch (error) {
  throw new AppError('タスク作成に失敗しました', ERROR_CODES.DATA_VALIDATION_ERROR, {
    context: { taskData },
    originalError: error,
  })
}
```

### 3. スタイリング

```tsx
// ✅ 必須：themeシステム
import { colors, typography, spacing } from '@/config/theme'

<div className={colors.background.card}>
  <h2 className={typography.heading.h2}>タイトル</h2>
</div>

// ❌ 禁止：直接指定
<div className="bg-white p-4">
```

---

## 🧪 テスト戦略

### コンポーネントテスト

```tsx
// features/tasks/components/TaskList.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from './TaskList'
import { useTaskStore } from '../stores/useTaskStore'

describe('TaskList', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', status: 'todo' },
        { id: '2', title: 'Task 2', status: 'done' },
      ],
    })
  })

  it('should render all tasks', () => {
    render(<TaskList />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })
})
```

### ストアテスト

```tsx
// features/tasks/stores/useTaskStore.test.ts
import { describe, it, expect } from 'vitest'
import { useTaskStore } from './useTaskStore'

describe('useTaskStore', () => {
  it('should add task', () => {
    const { addTask, tasks } = useTaskStore.getState()
    addTask({ title: 'New Task', status: 'todo' })
    expect(tasks).toHaveLength(1)
  })
})
```

---

## 📦 機能間の依存関係

### 許可される依存

```tsx
// ✅ 許可：共通モジュール
import { colors } from '@/config/theme'
import { useAuth } from '@/features/auth/hooks/useAuth'

// ✅ 許可：上位の共通処理
import { api } from '@/lib/api'
import { z } from 'zod'
```

### 禁止される依存

```tsx
// ❌ 禁止：他の機能モジュールへの直接依存
import { SomeComponent } from '@/features/other-feature/components'
```

---

## 🔗 関連ドキュメント

- **共通ライブラリ**: [`../lib/CLAUDE.md`](../lib/CLAUDE.md)
- **状態管理**: Zustand（`stores/` ディレクトリ）
- **テスト戦略**: [`../../docs/testing/CLAUDE.md`](../../docs/testing/CLAUDE.md)
- **コンポーネント**: [`../components/CLAUDE.md`](../components/CLAUDE.md)

---

**📖 最終更新**: 2025-09-30
