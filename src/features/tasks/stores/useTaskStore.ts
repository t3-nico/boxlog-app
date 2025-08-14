import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
  created_at: Date
  updated_at: Date
}

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface TaskStore {
  tasks: Task[]
  
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
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const dateTime = date.getTime()
  const startTime = start.getTime()
  const endTime = end.getTime()
  return dateTime >= startTime && dateTime <= endTime
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      createTask: (input) => {
        const now = new Date()
        const newTask: Task = {
          id: generateId(),
          ...input,
          created_at: now,
          updated_at: now
        }
        
        set(state => ({
          tasks: [...state.tasks, newTask]
        }))
        
        return newTask
      },
      
      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, ...updates, updated_at: new Date() }
              : task
          )
        }))
      },
      
      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }))
      },
      
      getTask: (id) => {
        return get().tasks.find(task => task.id === id)
      },
      
      getTasksForDate: (date) => {
        return get().tasks.filter(task =>
          isSameDay(task.planned_start, date)
        ).sort((a, b) => a.planned_start.getTime() - b.planned_start.getTime())
      },
      
      getTasksForDateRange: (start, end) => {
        return get().tasks.filter(task =>
          isDateInRange(task.planned_start, start, end)
        ).sort((a, b) => a.planned_start.getTime() - b.planned_start.getTime())
      },
      
      getTasksByStatus: (status) => {
        return get().tasks.filter(task => task.status === status)
      },
      
      updateTaskStatus: (id, status) => {
        get().updateTask(id, { status })
      },
      
      completeTask: (id) => {
        get().updateTask(id, { status: 'completed' })
      },
      
      clearAllTasks: () => {
        set({ tasks: [] })
      },
      
      importTasks: (tasks) => {
        set({ tasks })
      },
      
      getCompletionRate: (date) => {
        const dayTasks = get().getTasksForDate(date)
        if (dayTasks.length === 0) return 0
        
        const completedTasks = dayTasks.filter(task => task.status === 'completed')
        return Math.round((completedTasks.length / dayTasks.length) * 100)
      },
      
      getTotalPlannedTime: (date) => {
        const dayTasks = get().getTasksForDate(date)
        return dayTasks.reduce((total, task) => total + task.planned_duration, 0)
      }
    }),
    {
      name: 'task-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            const parsed = JSON.parse(str)
            return {
              ...parsed,
              state: {
                ...parsed.state,
                tasks: parsed.state.tasks.map((task: any) => ({
                  ...task,
                  planned_start: new Date(task.planned_start),
                  created_at: new Date(task.created_at),
                  updated_at: new Date(task.updated_at)
                }))
              }
            }
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          const processedValue = {
            ...value,
            state: {
              ...value.state,
              tasks: value.state.tasks.map((task: any) => ({
                ...task,
                planned_start: task.planned_start.toISOString(),
                created_at: task.created_at.toISOString(),
                updated_at: task.updated_at.toISOString()
              }))
            }
          }
          localStorage.setItem(name, JSON.stringify(processedValue))
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
)