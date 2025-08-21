import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SmartFolder, SmartFolderRule } from '@/types/smart-folders'
import { Task } from '@/types/unified'

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
  return 'cond_' + Math.random().toString(36).substring(2)
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

// 階層対応のデフォルトSmartFolders (TODO: 新しいSmartFolder型に合わせて修正が必要)
const defaultSmartFolders: SmartFolder[] = [
  // 一時的に空にしてビルドエラーを回避
]

export const useSmartFolderStore = create<SmartFolderStore>()(
  persist(
    (set, get) => ({
      smartFolders: [...systemSmartFolders, ...defaultSmartFolders],

      addSmartFolder: (folder) => {
        const { smartFolders } = get()
        // TODO: parentId property doesn't exist in new SmartFolder type
        // const parentFolder = folder.parentId ? smartFolders.find(f => f.id === folder.parentId) : null
        const parentFolder = null
        
        // TODO: Validate hierarchy level - temporarily disabled
        // if (folder.level > 3) {
        //   throw new Error('Maximum hierarchy level is 3')
        // }
        // 
        // if (parentFolder && parentFolder.level >= 3) {
        //   throw new Error('Cannot add child to level 3 folder')
        // }
        
        // Generate path - temporarily use folder name only
        const path = folder.name
        
        // TODO: Generate order - temporarily disabled
        const maxOrder = smartFolders.length
        
        const newFolder: SmartFolder = {
          ...folder,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        // TODO: Update parent's children array - temporarily disabled
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
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date() }
              : folder
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
        let currentLogic: FilterLogic = 'and'

        for (let i = 0; i < conditions.length; i++) {
          const condition = conditions[i]
          const conditionResult = evaluateCondition(task, condition)

          if (i === 0) {
            result = conditionResult
          } else {
            if (currentLogic === 'and') {
              result = result && conditionResult
            } else {
              result = result || conditionResult
            }
          }

          // Set logic for next iteration
          currentLogic = condition.logic || 'and'
        }

        return result
      },

      getMatchingTasks: (tasks, folderId) => {
        const { smartFolders } = get()
        const folder = smartFolders.find((f) => f.id === folderId)
        if (!folder) return []

        // TODO: evaluateTask needs to be fixed for new SmartFolderRule type
        return tasks // Return all tasks temporarily
      },

      getTaskCount: (tasks, folderId) => {
        return get().getMatchingTasks(tasks, folderId).length
      },

      // Hierarchy helpers
      getRootFolders: () => {
        const { smartFolders } = get()
        return smartFolders // TODO: filter logic needs to be implemented
      },

      getChildFolders: (parentId) => {
        const { smartFolders } = get()
        return [] // TODO: parentId logic needs to be implemented
      },

      getFoldersByLevel: (level) => {
        const { smartFolders } = get()
        return [] // TODO: level logic needs to be implemented
      },

      getFolderHierarchy: () => {
        const { smartFolders } = get()
        return smartFolders // TODO: hierarchy sorting needs to be implemented
      },

      getFolderPath: (folderId) => {
        const { smartFolders } = get()
        const folder = smartFolders.find(f => f.id === folderId)
        return folder ? folder.name : '' // TODO: path logic needs to be implemented
      },

      canAddChild: (parentId) => {
        return true // TODO: level checking needs to be implemented
      },
    }),
    {
      name: 'smart-folder-storage',
    }
  )
)

// Helper function to evaluate a single condition
function evaluateCondition(task: Task, condition: FolderCondition): boolean {
  const { field, operator, value } = condition

  let taskValue: any
  switch (field) {
    case 'status':
      taskValue = task.status
      break
    case 'priority':
      taskValue = task.priority
      break
    case 'type':
      taskValue = task.type
      break
    case 'tags':
      taskValue = task.tags || []
      break
    default:
      return false
  }

  switch (operator) {
    case 'is':
      if (field === 'tags' && Array.isArray(taskValue)) {
        return Array.isArray(value) 
          ? value.some(v => taskValue.includes(v))
          : taskValue.includes(value as string)
      }
      return taskValue === value

    case 'is_not':
      if (field === 'tags' && Array.isArray(taskValue)) {
        return Array.isArray(value)
          ? !value.some(v => taskValue.includes(v))
          : !taskValue.includes(value as string)
      }
      return taskValue !== value

    case 'contains':
      if (typeof taskValue === 'string') {
        return taskValue.toLowerCase().includes((value as string).toLowerCase())
      }
      if (Array.isArray(taskValue)) {
        return Array.isArray(value)
          ? value.some(v => taskValue.includes(v))
          : taskValue.includes(value as string)
      }
      return false

    default:
      return false
  }
}