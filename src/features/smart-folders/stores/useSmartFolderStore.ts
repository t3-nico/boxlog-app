import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { SmartFolder, SmartFolderRule, SmartFolderRuleLogic } from '@/types/smart-folders'
import { Task } from '@/types/unified'

// Internal type aliases (uppercase to match SmartFolderRuleLogic)
type FilterLogic = 'AND' | 'OR'

interface FolderCondition {
  field: string
  operator: string
  value: unknown
  logic?: FilterLogic
}

interface SmartFolderStore {
  smartFolders: SmartFolder[]

  // Actions
  addSmartFolder: (folder: Omit<SmartFolder, 'id' | 'createdAt' | 'updatedAt' | 'children' | 'path'>) => void
  updateSmartFolder: (id: string, updates: Partial<SmartFolder>) => void
  deleteSmartFolder: (id: string) => void
  getSmartFolder: (id: string) => SmartFolder | undefined

  // Hierarchy helpers
  getRootFolders: () => SmartFolder[]
  getChildFolders: (parentId: string) => SmartFolder[]
  getFoldersByLevel: (level: number) => SmartFolder[]
  getFolderHierarchy: () => SmartFolder[]
  getFolderPath: (folderId: string) => string
  canAddChild: (parentId: string) => boolean

  // Condition helpers
  evaluateTask: (task: Task, rules: SmartFolderRule[]) => boolean
  getMatchingTasks: (tasks: Task[], folderId: string) => Task[]
  getTaskCount: (tasks: Task[], folderId: string) => number
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const generateConditionId = (): string => {
  return `cond_${Math.random().toString(36).substring(2)}`
}

// Eagle-style system smart folders
const systemSmartFolders: SmartFolder[] = [
  {
    id: 'all-tasks',
    name: 'All Tasks',
    rules: [],
    userId: 'system',
    description: 'All tasks in the system',
    icon: '📋',
    color: '#6B7280',
    orderIndex: 1,
    isSystem: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'recent',
    name: 'Recent',
    rules: [],
    userId: 'system',
    description: 'Recently created or modified tasks',
    icon: '🕐',
    color: '#6B7280',
    orderIndex: 2,
    isSystem: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'favorites',
    name: 'Favorites',
    rules: [],
    userId: 'system',
    description: 'Favorite tasks',
    icon: '⭐',
    color: '#6B7280',
    orderIndex: 3,
    isSystem: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'trash',
    name: 'Trash',
    rules: [],
    userId: 'system',
    description: 'Deleted tasks',
    icon: '🗑️',
    color: '#6B7280',
    orderIndex: 4,
    isSystem: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// 階層対応のデフォルトSmartFolders (Type migration tracked in Issue #88)
const defaultSmartFolders: SmartFolder[] = [
  // 一時的に空にしてビルドエラーを回避
]

export const useSmartFolderStore = create<SmartFolderStore>()(
  devtools(
    persist(
      (set, get) => ({
        smartFolders: [...systemSmartFolders, ...defaultSmartFolders],

        addSmartFolder: (folder) => {
          const { smartFolders } = get()

          // const parentFolder = folder.parentId ? smartFolders.find(f => f.id === folder.parentId) : null
          const parentFolder = null

          // if (folder.level > 3) {
          //   throw new Error('Maximum hierarchy level is 3')
          // }
          //
          // if (parentFolder && parentFolder.level >= 3) {
          //   throw new Error('Cannot add child to level 3 folder')
          // }

          // Generate path - temporarily use folder name only
          const path = folder.name

          const maxOrder = smartFolders.length

          const newFolder: SmartFolder = {
            ...folder,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const updatedFolders = [...smartFolders, newFolder]
          // if (parentFolder) {
          //   const parentIndex = updatedFolders.findIndex(f => f.id === parentFolder.id)
          //   if (parentIndex !== -1) {
          //     updatedFolders[parentIndex] = {
          //       ...parentFolder,
          //       children: [...(parentFolder.children || []), newFolder.id],
          //       updatedAt: new Date(),
          //     }
          //   }
          // }

          set({ smartFolders: updatedFolders })
        },

        updateSmartFolder: (id, updates) => {
          set((state) => ({
            smartFolders: state.smartFolders.map((folder) =>
              folder.id === id ? { ...folder, ...updates, updatedAt: new Date() } : folder
            ),
          }))
        },

        deleteSmartFolder: (id) => {
          set((state) => ({
            smartFolders: state.smartFolders.filter((folder) => folder.id !== id),
          }))
        },

        getSmartFolder: (id) => {
          const { smartFolders } = get()
          return smartFolders.find((folder) => folder.id === id)
        },

        evaluateTask: (task, conditions) => {
          if (conditions.length === 0) return true

          let result = true
          let currentLogic: FilterLogic = 'AND'

          for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i] as FolderCondition
            const conditionResult = evaluateCondition(task, condition)

            if (i === 0) {
              result = conditionResult
            } else {
              if (currentLogic === 'AND') {
                result = result && conditionResult
              } else {
                result = result || conditionResult
              }
            }

            // Set logic for next iteration
            if (condition) {
              currentLogic = condition.logic || 'AND'
            }
          }

          return result
        },

        getMatchingTasks: (tasks, folderId) => {
          const { smartFolders } = get()
          const folder = smartFolders.find((f) => f.id === folderId)
          if (!folder) return []

          return tasks // Return all tasks temporarily
        },

        getTaskCount: (tasks, folderId) => {
          return get().getMatchingTasks(tasks, folderId).length
        },

        // Hierarchy helpers
        getRootFolders: () => {
          const { smartFolders } = get()
          return smartFolders // Filter implementation tracked in Issue #88
        },

        getChildFolders: (_parentId) => {
          const { smartFolders: _smartFolders } = get()
          return [] // ParentId logic tracked in Issue #88
        },

        getFoldersByLevel: (_level) => {
          const { smartFolders: _smartFolders } = get()
          return [] // Level logic tracked in Issue #88
        },

        getFolderHierarchy: () => {
          const { smartFolders } = get()
          return smartFolders // Hierarchy sorting tracked in Issue #88
        },

        getFolderPath: (folderId) => {
          const { smartFolders } = get()
          const folder = smartFolders.find((f) => f.id === folderId)
          return folder ? folder.name : '' // Path logic tracked in Issue #88
        },

        canAddChild: (_parentId) => {
          return true // Level checking tracked in Issue #88
        },
      }),
      {
        name: 'smart-folder-storage',
      }
    ),
    {
      name: 'smart-folder-store',
    }
  )
)

// Helper function to get task field value
function getTaskFieldValue(task: Task, field: string): string | number | boolean | Date | string[] | null | undefined {
  switch (field) {
    case 'status':
      return task.status
    case 'priority':
      return task.priority
    case 'type':
      return task.type
    case 'tags':
      return task.tags || []
    default:
      return null
  }
}

// Helper function to evaluate 'is' operator
function evaluateIsOperator(taskValue: unknown, value: unknown, field: string): boolean {
  if (field === 'tags' && Array.isArray(taskValue)) {
    return Array.isArray(value) ? value.some((v) => taskValue.includes(v)) : taskValue.includes(value as string)
  }
  return taskValue === value
}

// Helper function to evaluate 'is_not' operator
function evaluateIsNotOperator(taskValue: unknown, value: unknown, field: string): boolean {
  if (field === 'tags' && Array.isArray(taskValue)) {
    return Array.isArray(value) ? !value.some((v) => taskValue.includes(v)) : !taskValue.includes(value as string)
  }
  return taskValue !== value
}

// Helper function to evaluate 'contains' operator
function evaluateContainsOperator(taskValue: unknown, value: unknown): boolean {
  if (typeof taskValue === 'string') {
    return taskValue.toLowerCase().includes((value as string).toLowerCase())
  }
  if (Array.isArray(taskValue)) {
    return Array.isArray(value) ? value.some((v) => taskValue.includes(v)) : taskValue.includes(value as string)
  }
  return false
}

// Helper function to evaluate a single condition
function evaluateCondition(task: Task, condition: FolderCondition): boolean {
  const { field, operator, value } = condition

  const taskValue = getTaskFieldValue(task, field)
  if (taskValue === null) {
    return false
  }

  switch (operator) {
    case 'is':
      return evaluateIsOperator(taskValue, value, field)
    case 'is_not':
      return evaluateIsNotOperator(taskValue, value, field)
    case 'contains':
      return evaluateContainsOperator(taskValue, value)
    default:
      return false
  }
}
