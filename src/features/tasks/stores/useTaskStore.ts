// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
import { StoreFactory } from '@/lib/store-factory'
import type { Task as BaseTask, TaskStatus, TaskPriority } from '@/types'

/**
 * LocalStorage用Taskインターフェース
 * BaseTaskをDate型で扱うように拡張
 */
interface Task extends Omit<BaseTask, 'planned_start' | 'created_at' | 'updated_at'> {
  planned_start: Date
  created_at: Date
  updated_at: Date
}

/**
 * LocalStorage保存用（Date → string変換後）
 */
interface TaskForStorage extends Omit<Task, 'planned_start' | 'created_at' | 'updated_at'> {
  planned_start: string
  created_at: string
  updated_at: string
}

/**
 * タスク作成入力
 */
interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: TaskStatus
  priority: TaskPriority
  description?: string
  tags?: string[]
}

interface TaskStoreState {
  tasks: Task[]
}

interface TaskStore extends TaskStoreState {
  // CRUD operations
  createTask: (input: CreateTaskInput) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTask: (id: string) => Task | undefined

  // Query operations
  getTasksForDate: (date: Date) => Task[]
  getTasksForDateRange: (start: Date, end: Date) => Task[]
  getTasksByStatus: (status: Task['status']) => Task[]

  // Status operations
  updateTaskStatus: (id: string, status: Task['status']) => void
  completeTask: (id: string) => void

  // Utility operations
  clearAllTasks: () => void
  importTasks: (tasks: Task[]) => void

  // Analytics
  getCompletionRate: (date: Date) => number
  getTotalPlannedTime: (date: Date) => number
}

// ユーティリティ関数
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const dateTime = date.getTime()
  const startTime = start.getTime()
  const endTime = end.getTime()
  return dateTime >= startTime && dateTime <= endTime
}

// 初期状態の定義
const initialTaskState = {
  tasks: [] as Task[]
}

// Date型のシリアライゼーション設定
const taskPersistConfig = {
  name: 'task-store',
  storage: 'localStorage' as const,
  migrate: (persistedState: any, _version: number) => {
    if (persistedState?.tasks) {
      return {
        ...persistedState,
        tasks: persistedState.tasks.map((task: TaskForStorage) => ({
          ...task,
          planned_start: new Date(task.planned_start),
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
        }))
      }
    }
    return persistedState
  },
  partialize: (state: typeof initialTaskState & TaskStore) => ({
    tasks: state.tasks.map((task: Task) => ({
      ...task,
      planned_start: task.planned_start.toISOString(),
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString(),
    }))
  })
}

export const useTaskStore = StoreFactory.createPersisted({
  type: 'persisted',
  name: 'task-store',
  initialState: initialTaskState,
  persist: taskPersistConfig,
  devtools: true,
  actions: (set, get) => ({
    createTask: (input: CreateTaskInput) => {
      const now = new Date()
      const newTask: Task = {
        id: generateId(),
        ...input,
        created_at: now,
        updated_at: now,
      }

      set((state: TaskStoreState) => ({
        tasks: [...state.tasks, newTask],
      }))

      return newTask
    },

    updateTask: (id: string, updates: Partial<Task>) => {
      set((state: TaskStoreState) => ({
        tasks: state.tasks.map((task: Task) => (
          task.id === id ? { ...task, ...updates, updated_at: new Date() } : task
        )),
      }))
    },

    deleteTask: (id: string) => {
      set((state: TaskStoreState) => ({
        tasks: state.tasks.filter((task: Task) => task.id !== id),
      }))
    },

    getTask: (id: string) => {
      return get().tasks.find((task: Task) => task.id === id)
    },

    getTasksForDate: (date: Date) => {
      return get()
        .tasks.filter((task: Task) => isSameDay(task.planned_start, date))
        .sort((a: Task, b: Task) => a.planned_start.getTime() - b.planned_start.getTime())
    },

    getTasksForDateRange: (start: Date, end: Date) => {
      return get()
        .tasks.filter((task: Task) => isDateInRange(task.planned_start, start, end))
        .sort((a: Task, b: Task) => a.planned_start.getTime() - b.planned_start.getTime())
    },

    getTasksByStatus: (status: Task['status']) => {
      return get().tasks.filter((task: Task) => task.status === status)
    },

    updateTaskStatus: (id: string, status: Task['status']) => {
      get().updateTask(id, { status })
    },

    completeTask: (id: string) => {
      get().updateTask(id, { status: 'completed' })
    },

    clearAllTasks: () => {
      set({ tasks: [] })
    },

    importTasks: (tasks: Task[]) => {
      set({ tasks })
    },

    getCompletionRate: (date: Date) => {
      const dayTasks = get().getTasksForDate(date)
      if (dayTasks.length === 0) return 0

      const completedTasks = dayTasks.filter((task: Task) => task.status === 'completed')
      return Math.round((completedTasks.length / dayTasks.length) * 100)
    },

    getTotalPlannedTime: (date: Date) => {
      const dayTasks = get().getTasksForDate(date)
      return dayTasks.reduce((total: number, task: Task) => total + task.planned_duration, 0)
    },
  }),
})
