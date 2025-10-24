// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
import type { Task as BaseTask, TaskPriority, TaskStatus } from '@/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

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

interface TaskFilters {
  search: string
  status: string[]
  priority: string[]
  type: string[]
  tags: string[]
  smartFolder: string
}

interface TaskStoreState {
  tasks: Task[]
  filters: TaskFilters
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

  // Filter operations
  setSearchFilter: (search: string) => void
  setStatusFilter: (status: string[]) => void
  setPriorityFilter: (priority: string[]) => void
  setTypeFilter: (type: string[]) => void
  setTagFilter: (tags: string[]) => void
  setSmartFolderFilter: (smartFolder: string) => void
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
const initialTaskState: TaskStoreState = {
  tasks: [],
  filters: {
    search: '',
    status: [],
    priority: [],
    type: [],
    tags: [],
    smartFolder: '',
  },
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialTaskState,

        createTask: (input: CreateTaskInput) => {
          const now = new Date()
          const newTask: Task = {
            id: generateId(),
            ...input,
            created_at: now,
            updated_at: now,
          }

          set((state) => ({
            tasks: [...state.tasks, newTask],
          }))

          return newTask
        },

        updateTask: (id: string, updates: Partial<Task>) => {
          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates, updated_at: new Date() } : task)),
          }))
        },

        deleteTask: (id: string) => {
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }))
        },

        getTask: (id: string) => {
          return get().tasks.find((task) => task.id === id)
        },

        getTasksForDate: (date: Date) => {
          return get()
            .tasks.filter((task) => isSameDay(task.planned_start, date))
            .sort((a, b) => a.planned_start.getTime() - b.planned_start.getTime())
        },

        getTasksForDateRange: (start: Date, end: Date) => {
          return get()
            .tasks.filter((task) => isDateInRange(task.planned_start, start, end))
            .sort((a, b) => a.planned_start.getTime() - b.planned_start.getTime())
        },

        getTasksByStatus: (status: Task['status']) => {
          return get().tasks.filter((task) => task.status === status)
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

          const completedTasks = dayTasks.filter((task) => task.status === 'completed')
          return Math.round((completedTasks.length / dayTasks.length) * 100)
        },

        getTotalPlannedTime: (date: Date) => {
          const dayTasks = get().getTasksForDate(date)
          return dayTasks.reduce((total, task) => total + task.planned_duration, 0)
        },

        // Filter operations
        setSearchFilter: (search: string) =>
          set((state) => ({
            filters: { ...state.filters, search },
          })),
        setStatusFilter: (status: string[]) =>
          set((state) => ({
            filters: { ...state.filters, status },
          })),
        setPriorityFilter: (priority: string[]) =>
          set((state) => ({
            filters: { ...state.filters, priority },
          })),
        setTypeFilter: (type: string[]) =>
          set((state) => ({
            filters: { ...state.filters, type },
          })),
        setTagFilter: (tags: string[]) =>
          set((state) => ({
            filters: { ...state.filters, tags },
          })),
        setSmartFolderFilter: (smartFolder: string) =>
          set((state) => ({
            filters: { ...state.filters, smartFolder },
          })),
      }),
      {
        name: 'task-store',
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name)
            if (!str) return null
            const { state } = JSON.parse(str)
            return {
              state: {
                ...state,
                tasks:
                  state.tasks?.map((task: TaskForStorage) => ({
                    ...task,
                    planned_start: new Date(task.planned_start),
                    created_at: new Date(task.created_at),
                    updated_at: new Date(task.updated_at),
                  })) || [],
              },
            }
          },
          setItem: (name, value) => {
            const { state } = value as { state: TaskStoreState }
            const str = JSON.stringify({
              state: {
                ...state,
                tasks: state.tasks.map((task) => ({
                  ...task,
                  planned_start: task.planned_start.toISOString(),
                  created_at: task.created_at.toISOString(),
                  updated_at: task.updated_at.toISOString(),
                })),
              },
            })
            localStorage.setItem(name, str)
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    {
      name: 'task-store',
    }
  )
)
