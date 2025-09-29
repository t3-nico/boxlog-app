# BoxLog 状態管理パターンガイド

## 📖 概要

BoxLogでは統一された状態管理パターンを採用し、Zustandベースの型安全で保守性の高いストア実装を提供しています。

## 🎯 設計思想

### 統一性
- すべてのストアが同じパターンに従う
- 一貫したAPI設計とエラーハンドリング
- DevTools統合とデバッグ支援

### 型安全性
- TypeScript完全対応
- `any`型の排除
- 実行時型チェック

### 拡張性
- プラグイン式のミドルウェア
- パターンの組み合わせ可能
- 将来機能への対応力

## 🏗️ ストアパターン一覧

### 1. Base Store（基本パターン）
最もシンプルなローカル状態管理

```typescript
import { StoreFactory } from '@/lib/store-factory'

export const useCounterStore = StoreFactory.create({
  type: 'base',
  name: 'counter-store',
  initialState: {
    count: 0,
    step: 1
  },
  actions: (set, get) => ({
    increment: () => set(state => ({ count: state.count + state.step })),
    decrement: () => set(state => ({ count: state.count - state.step })),
    setStep: (step: number) => set({ step }),
    reset: () => set({ count: 0 })
  })
})
```

#### 使用場面
- UIの一時的な状態
- フォームの入力状態
- モーダルの開閉状態
- カウンターやトグル

### 2. Async Store（非同期パターン）
API通信とデータフェッチを扱う

```typescript
export const useUserStore = StoreFactory.createAsync({
  type: 'async',
  name: 'user-store',
  initialState: [],
  fetcher: async () => {
    const response = await fetch('/api/users')
    return response.json()
  },
  mutator: async (updates) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(updates)
    })
    return response.json()
  },
  cacheTime: 5 * 60 * 1000, // 5分
  staleTime: 1 * 60 * 1000,  // 1分
  retry: 3
})
```

#### 特徴
- 自動キャッシュ管理
- 楽観的更新
- エラー時自動リトライ
- ローディング状態の自動管理

#### 使用場面
- REST API連携
- データ一覧の取得・更新
- フォーム送信
- 画像アップロード

### 3. Persisted Store（永続化パターン）
localStorage/sessionStorageとの連携

```typescript
export const useSettingsStore = StoreFactory.createPersisted({
  type: 'persisted',
  name: 'settings-store',
  initialState: {
    theme: 'light',
    language: 'ja',
    notifications: true
  },
  persist: {
    name: 'boxlog-settings',
    storage: 'localStorage',
    version: 1,
    partialize: (state) => ({
      theme: state.theme,
      language: state.language
      // notifications は永続化しない
    })
  },
  actions: (set, get) => ({
    setTheme: (theme) => set({ theme }),
    setLanguage: (language) => set({ language }),
    toggleNotifications: () => set(state => ({
      notifications: !state.notifications
    }))
  })
})
```

#### 特徴
- 自動ハイドレーション
- バージョン管理・マイグレーション
- 選択的永続化
- SSR対応

#### 使用場面
- ユーザー設定
- フィルター状態
- ウィンドウサイズ・位置
- ユーザープリファレンス

### 4. Realtime Store（リアルタイムパターン）
WebSocket/SSE/Pollingによるリアルタイム同期

```typescript
export const useChatStore = StoreFactory.createRealtime({
  type: 'realtime',
  name: 'chat-store',
  initialState: {
    messages: [],
    users: [],
    typing: []
  },
  connectionType: 'websocket',
  url: () => `ws://localhost:3000/api/chat/ws`,
  channels: ['messages', 'user-status'],
  messageHandler: (message) => {
    switch (message.type) {
      case 'new-message':
        return { messages: [...get().messages, message.data] }
      case 'user-joined':
        return { users: [...get().users, message.user] }
      default:
        return null
    }
  }
})
```

#### 特徴
- 自動再接続
- チャンネル購読管理
- 接続状態監視
- オフライン対応

#### 使用場面
- チャットシステム
- ライブ通知
- リアルタイムダッシュボード
- コラボレーション機能

### 5. Hybrid Store（ハイブリッドパターン）
複数パターンの組み合わせ

```typescript
export const useTaskStore = StoreFactory.createHybrid({
  type: 'hybrid',
  name: 'task-store',
  initialState: {
    tasks: [],
    filters: {}
  },
  persist: {
    name: 'boxlog-tasks',
    storage: 'localStorage',
    partialize: (state) => ({ filters: state.filters })
  },
  realtime: {
    connectionType: 'websocket',
    url: () => 'ws://localhost:3000/api/tasks/ws',
    channels: ['task-updates']
  }
})
```

#### 使用場面
- 大規模な機能
- 複雑な要件
- 段階的機能拡張

## 📚 使用方法とベストプラクティス

### 1. ストア選択のガイドライン

```typescript
// ❓ どのパターンを選ぶべきか？

// ✅ Base Store を選ぶ場合
- ローカルUI状態のみ
- APIとの通信なし
- 永続化不要
- 例：モーダル状態、フォーム入力、カウンター

// ✅ Async Store を選ぶ場合
- API連携が主目的
- データフェッチが頻繁
- キャッシュが必要
- 例：ユーザー一覧、商品カタログ、検索結果

// ✅ Persisted Store を選ぶ場合
- 設定やプリファレンス
- ページリロード後も保持したい
- ユーザー体験の継続性
- 例：テーマ設定、フィルター状態、ウィンドウ配置

// ✅ Realtime Store を選ぶ場合
- リアルタイム更新が必要
- 複数ユーザーでの共有状態
- イベント駆動の更新
- 例：チャット、通知、ライブダッシュボード

// ✅ Hybrid Store を選ぶ場合
- 複数パターンの組み合わせが必要
- 段階的な機能拡張
- 複雑なユースケース
- 例：タスク管理、プロジェクト管理
```

### 2. 命名規則

```typescript
// ✅ 推奨命名パターン

// ストア名
export const useTaskStore = StoreFactory.create({ /* ... */ })
export const useUserProfileStore = StoreFactory.create({ /* ... */ })

// ファクトリー設定のname
name: 'task-store'           // ケバブケース
name: 'user-profile-store'   // 複数語はハイフン区切り

// アクション名
actions: (set, get) => ({
  // CRUD操作
  createTask: (input) => { /* ... */ },
  updateTask: (id, updates) => { /* ... */ },
  deleteTask: (id) => { /* ... */ },
  getTask: (id) => { /* ... */ },

  // 状態操作
  setFilter: (filter) => { /* ... */ },
  resetFilters: () => { /* ... */ },
  toggleSelection: (id) => { /* ... */ },

  // 非同期操作
  fetchTasks: () => { /* ... */ },
  saveTasks: () => { /* ... */ },
  syncTasks: () => { /* ... */ }
})
```

### 3. 型定義のベストプラクティス

```typescript
// ✅ 型安全性を最大化する型定義

// 1. 状態インターフェースの明確化
interface TaskState {
  tasks: Task[]
  selectedId: string | null
  filters: TaskFilters
  sorting: TaskSort
}

// 2. アクションの型安全性
interface TaskActions {
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setFilter: <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K]
  ) => void
}

// 3. 完全な型定義
type TaskStore = BaseStore & TaskState & TaskActions

// 4. ヘルパー型の活用
export const useTaskStore = StoreFactory.create<TaskState>({
  // 型推論が正しく動作
})
```

### 4. エラーハンドリング

```typescript
// ✅ 統一されたエラーハンドリング

export const useApiStore = StoreFactory.createAsync({
  type: 'async',
  name: 'api-store',
  fetcher: async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      // エラーは自動的にストアのerror状態に設定される
      throw error
    }
  },
  // エラー時の動作をカスタマイズ
  retry: 3,
  retryDelay: 1000
})

// 使用側でのエラーハンドリング
const Component = () => {
  const { data, error, fetchStatus, refresh } = useApiStore()

  if (error) {
    return (
      <div className="error">
        エラーが発生しました: {error.message}
        <button onClick={refresh}>再試行</button>
      </div>
    )
  }

  // ...
}
```

### 5. パフォーマンス最適化

```typescript
// ✅ セレクタを使用した効率的な購読

// ❌ 悪い例：全体の状態を購読
const Component = () => {
  const store = useTaskStore() // 全状態変更で再レンダリング
  return <div>{store.tasks.length}</div>
}

// ✅ 良い例：必要な部分のみ購読
const Component = () => {
  const taskCount = useTaskStore(state => state.tasks.length)
  return <div>{taskCount}</div>
}

// ✅ 複数値の効率的な購読
const Component = () => {
  const { tasks, selectedId } = useTaskStore(
    state => ({
      tasks: state.tasks,
      selectedId: state.selectedId
    }),
    shallow // shallow比較でパフォーマンス向上
  )

  // ...
}
```

## 🛠️ 高度な使用例

### 1. 複数ストアの連携

```typescript
// StoreComposerを使用した複数ストア管理
import { StoreComposer } from '@/lib/store-factory'

const taskComposer = new StoreComposer()
  .add('tasks', useTaskStore)
  .add('tags', useTagStore)
  .add('projects', useProjectStore)

// 複合セレクター
const getTasksWithTags = taskComposer.createSelector(
  ({ tasks, tags }) => tasks.data?.map(task => ({
    ...task,
    tagNames: task.tagIds?.map(id =>
      tags.getTagById(id)?.name
    ).filter(Boolean)
  }))
)

// 複合アクション
const createTaskWithTags = taskComposer.createAction(
  ({ tasks, tags }) => async (taskData, tagNames) => {
    // タグを作成または取得
    const tagIds = await Promise.all(
      tagNames.map(name => tags.findOrCreateTag(name))
    )

    // タスクを作成
    return tasks.createTask({ ...taskData, tagIds })
  }
)
```

### 2. カスタムミドルウェア

```typescript
// ログミドルウェアの例
const loggerMiddleware = (store: any) => (set: any, get: any) =>
  (...args: any[]) => {
    console.log('Store action:', args)
    const result = set(...args)
    console.log('New state:', get())
    return result
  }

// 使用例
StoreFactory.registerMiddleware('logger', loggerMiddleware)

export const useDebugStore = StoreFactory.create({
  type: 'base',
  name: 'debug-store',
  middleware: ['logger'], // ログミドルウェアを適用
  // ...
})
```

### 3. デバッグとモニタリング

```typescript
// 開発時のデバッグ機能
import { StoreDebugger } from '@/lib/store-factory'

// 全ストアの状態確認
console.log(StoreDebugger.dump())

// 特定ストアの状態確認
console.log(StoreDebugger.dump('task-store'))

// リアルタイム監視
const unwatch = StoreDebugger.watch('task-store', (state) => {
  console.log('Task store updated:', state)
})

// パフォーマンス監視
const stopMonitoring = StoreDebugger.startPerformanceMonitoring('task-store')
```

## 🧪 テスト戦略

### 1. ユニットテスト

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTaskStore } from '@/stores/task-store'

describe('Task Store', () => {
  beforeEach(() => {
    // ストアをリセット
    useTaskStore.getState().reset?.()
  })

  it('should create a task', async () => {
    const { result } = renderHook(() => useTaskStore())

    await act(async () => {
      await result.current.createTask({
        title: 'Test Task',
        status: 'todo'
      })
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test Task')
  })

  it('should handle async errors', async () => {
    const { result } = renderHook(() => useTaskStore())

    // API失敗をシミュレート
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    await act(async () => {
      await result.current.fetchTasks()
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.fetchStatus).toBe('error')
  })
})
```

### 2. 統合テスト

```typescript
// 複数ストア間の連携テスト
describe('Task and Tag Integration', () => {
  it('should create task with tags', async () => {
    const taskStore = useTaskStore.getState()
    const tagStore = useTagStore.getState()

    // タグを作成
    await tagStore.createTag({ name: 'urgent', color: '#ff0000' })
    const tags = tagStore.getAllTags()

    // タスクを作成
    await taskStore.createTask({
      title: 'Important Task',
      tagIds: [tags[0].id]
    })

    // 連携確認
    const tasks = taskStore.tasks
    expect(tasks[0].tagIds).toContain(tags[0].id)
  })
})
```

## 📈 監視とメトリクス

### 1. ストア使用統計

```typescript
// ストア統計の取得
const stats = StoreFactory.getStats()
console.log(stats)
// {
//   total: 15,
//   byType: {
//     base: 8,
//     async: 4,
//     persisted: 2,
//     realtime: 1,
//     hybrid: 0
//   },
//   avgCreationTime: 1200
// }
```

### 2. パフォーマンス監視

```typescript
// ストアのパフォーマンス追跡
const performanceData = {
  renderCount: 0,
  lastRenderTime: 0,
  averageRenderTime: 0
}

const MonitoredComponent = () => {
  const startTime = performance.now()
  const tasks = useTaskStore(state => state.tasks)

  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    performanceData.renderCount++
    performanceData.lastRenderTime = renderTime
    performanceData.averageRenderTime =
      (performanceData.averageRenderTime + renderTime) / 2
  })

  return <TaskList tasks={tasks} />
}
```

## 🚀 まとめ

BoxLogの状態管理パターンシステムは以下の利点を提供します：

### ✅ 開発者体験の向上
- 統一されたAPI設計
- 型安全性の保証
- 豊富なDevTools支援

### ✅ 保守性の向上
- 一貫したコード構造
- 明確な責任分離
- 包括的なテスト支援

### ✅ パフォーマンスの最適化
- 効率的な再レンダリング制御
- 自動キャッシュ管理
- 最適化されたデータフロー

### ✅ 拡張性の確保
- プラグイン式アーキテクチャ
- パターンの組み合わせ対応
- 将来機能への対応力

新しいストアを作成する際は、このガイドを参考に適切なパターンを選択し、ベストプラクティスに従って実装してください。