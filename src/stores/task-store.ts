// @ts-nocheck TODO(#389): 型エラー13件を段階的に修正する
/**
 * タスクストア実装例
 * 新しい状態管理パターンシステムの使用方法を実証
 */

import { StoreFactory } from '@/lib/store-factory'
import type { Task, TaskStatus, TaskPriority } from '@/types'

/**
 * タスクの状態インターフェース
 */
export interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  filters: {
    status: TaskStatus[]
    priority: TaskPriority[]
    assignee: string[]
    tags: string[]
  }
  searchQuery: string
  sortBy: 'created' | 'updated' | 'dueDate' | 'priority'
  sortOrder: 'asc' | 'desc'
}

/**
 * タスクの初期状態
 */
const initialTaskState: TaskState = {
  tasks: [],
  selectedTaskId: null,
  filters: {
    status: [],
    priority: [],
    assignee: [],
    tags: []
  },
  searchQuery: '',
  sortBy: 'created',
  sortOrder: 'desc'
}

/**
 * タスクAPIクライアント
 */
const taskApi = {
  async fetchTasks(): Promise<Task[]> {
    const response = await fetch('/api/tasks')
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  },

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete task')
  }
}

/**
 * 基本タスクストア（ローカル状態管理）
 */
export const useTaskStore = StoreFactory.create<TaskState>({
  type: 'base',
  name: 'task-store',
  initialState: initialTaskState,
  devtools: true,
  actions: (set, get) => ({
    // タスク選択
    selectTask: (taskId: string | null) => {
      set({ selectedTaskId: taskId })
    },

    // フィルター設定
    setFilters: (filters: Partial<TaskState['filters']>) => {
      set(state => ({
        filters: { ...state.filters, ...filters }
      }))
    },

    // 検索クエリ設定
    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
    },

    // ソート設定
    setSorting: (sortBy: TaskState['sortBy'], sortOrder: TaskState['sortOrder']) => {
      set({ sortBy, sortOrder })
    },

    // フィルター条件に基づくタスク取得
    getFilteredTasks: () => {
      const state = get()
      return state.tasks.filter(task => {
        // ステータスフィルター
        if (state.filters.status.length > 0 && !state.filters.status.includes(task.status)) {
          return false
        }

        // 優先度フィルター
        if (state.filters.priority.length > 0 && !state.filters.priority.includes(task.priority)) {
          return false
        }

        // 担当者フィルター
        if (state.filters.assignee.length > 0 && !state.filters.assignee.includes(task.assigneeId || '')) {
          return false
        }

        // タグフィルター
        if (state.filters.tags.length > 0 && !state.filters.tags.some(tag => task.tags?.includes(tag))) {
          return false
        }

        // 検索クエリフィルター
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          return (
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags?.some(tag => tag.toLowerCase().includes(query))
          )
        }

        return true
      }).sort((a, b) => {
        const { sortBy, sortOrder } = state
        let comparison = 0

        switch (sortBy) {
          case 'created':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            break
          case 'updated':
            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            break
          case 'dueDate':
            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
            comparison = aDue - bDue
            break
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
            break
        }

        return sortOrder === 'asc' ? comparison : -comparison
      })
    }
  })
})

/**
 * 非同期タスクストア（API連携）
 */
export const useAsyncTaskStore = StoreFactory.createAsync<Task[]>({
  type: 'async',
  name: 'async-task-store',
  initialState: [],
  fetcher: taskApi.fetchTasks,
  mutator: async (updates: Partial<Task[]>) => {
    // バッチ更新の場合の処理
    return updates as Task[]
  },
  cacheTime: 5 * 60 * 1000, // 5分
  staleTime: 1 * 60 * 1000, // 1分
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  retry: 3,
  retryDelay: 1000
})

/**
 * 永続化タスクストア（ローカルストレージ保存）
 */
export const usePersistentTaskStore = StoreFactory.createPersisted<TaskState>({
  type: 'persisted',
  name: 'persistent-task-store',
  initialState: initialTaskState,
  persist: {
    name: 'boxlog-task-state',
    storage: 'localStorage',
    version: 1,
    partialize: (state) => ({
      // 永続化対象を限定（タスクデータは除外し、UI状態のみ保存）
      filters: state.filters,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    migrate: (persistedState: any, version: number) => {
      // バージョン1のマイグレーション例
      if (version === 1) {
        return {
          ...initialTaskState,
          ...persistedState
        }
      }
      return persistedState
    }
  },
  actions: (set, get) => ({
    // タスクフィルタリング設定の永続化
    updatePersistentFilters: (filters: Partial<TaskState['filters']>) => {
      set(state => ({
        filters: { ...state.filters, ...filters }
      }))
    },

    // 検索・ソート設定の永続化
    updatePersistentSettings: (settings: {
      searchQuery?: string
      sortBy?: TaskState['sortBy']
      sortOrder?: TaskState['sortOrder']
    }) => {
      set(settings)
    }
  })
})

/**
 * リアルタイムタスクストア（WebSocket連携）
 */
export const useRealtimeTaskStore = StoreFactory.createRealtime<TaskState>({
  type: 'realtime',
  name: 'realtime-task-store',
  initialState: initialTaskState,
  connectionType: 'websocket',
  url: () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/api/tasks/ws`
  },
  reconnectInterval: 5000,
  maxRetries: 5,
  heartbeatInterval: 30000,
  channels: ['task-updates', 'task-assignments'],
  messageHandler: (message: any) => {
    switch (message.type) {
      case 'task-created':
        return {
          tasks: [...(useRealtimeTaskStore.getState().data?.tasks || []), message.task]
        }
      case 'task-updated':
        return {
          tasks: (useRealtimeTaskStore.getState().data?.tasks || []).map(task =>
            task.id === message.task.id ? { ...task, ...message.task } : task
          )
        }
      case 'task-deleted':
        return {
          tasks: (useRealtimeTaskStore.getState().data?.tasks || []).filter(
            task => task.id !== message.taskId
          )
        }
      default:
        return null
    }
  },
  errorHandler: (error: Error) => {
    console.error('Task WebSocket error:', error)
  },
  connectionHandler: (status) => {
    console.log('Task WebSocket status:', status)
  }
})

/**
 * ハイブリッドタスクストア（永続化 + リアルタイム）
 */
export const useHybridTaskStore = StoreFactory.createHybrid<TaskState>({
  type: 'hybrid',
  name: 'hybrid-task-store',
  initialState: initialTaskState,
  persist: {
    name: 'boxlog-hybrid-task-state',
    storage: 'localStorage',
    version: 1,
    partialize: (state) => ({
      filters: state.filters,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    })
  },
  realtime: {
    connectionType: 'websocket',
    url: () => `ws://localhost:3000/api/tasks/ws`,
    channels: ['task-updates'],
    messageHandler: (message: any) => {
      // リアルタイム更新処理
      return message.data
    }
  },
  actions: (set, get) => ({
    // ハイブリッド機能の統合アクション
    syncAndPersist: async () => {
      const state = get()
      // リアルタイムデータの同期
      await state.forceSync?.()
      // 永続化の実行
      state.persist?.()
    }
  })
})

/**
 * タスクストアの使用例とヘルパー関数
 */
export const taskStoreHelpers = {
  // 複数ストアの統合使用
  useTaskManagement: () => {
    const localStore = useTaskStore()
    const asyncStore = useAsyncTaskStore()
    const persistentStore = usePersistentTaskStore()

    return {
      // ローカル状態
      ...localStore,
      // 非同期データ
      tasks: asyncStore.data || [],
      isLoading: asyncStore.fetchStatus === 'loading',
      error: asyncStore.error,
      refetch: asyncStore.refresh,
      // 永続化設定
      persistentFilters: persistentStore.filters,
      persistentSettings: {
        searchQuery: persistentStore.searchQuery,
        sortBy: persistentStore.sortBy,
        sortOrder: persistentStore.sortOrder
      }
    }
  },

  // タスク操作のヘルパー
  createTaskWithOptimisticUpdate: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const asyncStore = useAsyncTaskStore.getState()

    // 楽観的更新
    const tempTask: Task = {
      ...task,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    asyncStore.optimisticUpdate(tasks => [...tasks, tempTask])

    try {
      // 実際のAPI呼び出し
      const createdTask = await taskApi.createTask(task)

      // 楽観的更新を実データで置換
      asyncStore.optimisticUpdate(tasks =>
        tasks.map(t => t.id === tempTask.id ? createdTask : t)
      )

      return createdTask
    } catch (error) {
      // エラー時のロールバック
      asyncStore.optimisticUpdate(tasks =>
        tasks.filter(t => t.id !== tempTask.id)
      )
      throw error
    }
  }
}

/**
 * ストア統計とデバッグ
 */
export const taskStoreDebug = {
  // 全タスクストアの状態確認
  getStoreStats: () => {
    return StoreFactory.getStats()
  },

  // タスクストアの状態ダンプ
  dumpTaskStores: () => {
    return {
      basic: StoreFactory.get('task-store')?.getState(),
      async: StoreFactory.get('async-task-store')?.getState(),
      persistent: StoreFactory.get('persistent-task-store')?.getState(),
      realtime: StoreFactory.get('realtime-task-store')?.getState(),
      hybrid: StoreFactory.get('hybrid-task-store')?.getState()
    }
  }
}