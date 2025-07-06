import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SmartFolder, FolderCondition, Task, FilterField, FilterOperator, FilterLogic } from '@/types/box'

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
  evaluateTask: (task: Task, conditions: FolderCondition[]) => boolean
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
    conditions: [],
    level: 1,
    path: 'All Tasks',
    icon: '📋',
    description: 'All tasks in the system',
    order: 1,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'recent',
    name: 'Recent',
    conditions: [],
    level: 1,
    path: 'Recent',
    icon: '🕐',
    description: 'Recently created or modified tasks',
    order: 2,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'favorites',
    name: 'Favorites',
    conditions: [],
    level: 1,
    path: 'Favorites',
    icon: '⭐',
    description: 'Favorite tasks',
    order: 3,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'trash',
    name: 'Trash',
    conditions: [],
    level: 1,
    path: 'Trash',
    icon: '🗑️',
    description: 'Deleted tasks',
    order: 4,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// 階層対応のデフォルトSmartFolders
const defaultSmartFolders: SmartFolder[] = [
  // Level 1 (Root folders)
  {
    id: 'priority-based',
    name: 'Priority Based',
    conditions: [],
    level: 1,
    path: 'Priority Based',
    children: ['high-priority', 'low-priority'],
    color: '#ef4444',
    icon: '🔥',
    description: 'Tasks organized by priority level',
    order: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'status-based',
    name: 'Status Based',
    conditions: [],
    level: 1,
    path: 'Status Based',
    children: ['active-work', 'pending-review'],
    color: '#3b82f6',
    icon: '📊',
    description: 'Tasks organized by current status',
    order: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'development',
    name: 'Development',
    conditions: [],
    level: 1,
    path: 'Development',
    children: ['frontend-work', 'backend-work'],
    color: '#22c55e',
    icon: '💻',
    description: 'Development-related tasks',
    order: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Level 2 (Sub-folders)
  {
    id: 'high-priority',
    name: 'High Priority',
    conditions: [
      {
        id: generateConditionId(),
        field: 'priority',
        operator: 'is',
        value: 'High'
      }
    ],
    parentId: 'priority-based',
    level: 2,
    path: 'Priority Based/High Priority',
    children: ['urgent-bugs'],
    color: '#ef4444',
    icon: '🚨',
    description: 'High priority tasks requiring immediate attention',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'low-priority',
    name: 'Low Priority',
    conditions: [
      {
        id: generateConditionId(),
        field: 'priority',
        operator: 'is',
        value: 'Low'
      }
    ],
    parentId: 'priority-based',
    level: 2,
    path: 'Priority Based/Low Priority',
    children: [],
    color: '#6b7280',
    icon: '📝',
    description: 'Low priority tasks for later consideration',
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'active-work',
    name: 'Active Work',
    conditions: [
      {
        id: generateConditionId(),
        field: 'status',
        operator: 'is',
        value: 'In Progress'
      }
    ],
    parentId: 'status-based',
    level: 2,
    path: 'Status Based/Active Work',
    children: [],
    color: '#3b82f6',
    icon: '⚡',
    description: 'Tasks currently being worked on',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pending-review',
    name: 'Pending Review',
    conditions: [
      {
        id: generateConditionId(),
        field: 'status',
        operator: 'is',
        value: 'Done'
      }
    ],
    parentId: 'status-based',
    level: 2,
    path: 'Status Based/Pending Review',
    children: [],
    color: '#8b5cf6',
    icon: '👀',
    description: 'Completed tasks awaiting review',
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'frontend-work',
    name: 'Frontend Work',
    conditions: [
      {
        id: generateConditionId(),
        field: 'tags',
        operator: 'contains',
        value: 'tag-1' // Frontend tag
      }
    ],
    parentId: 'development',
    level: 2,
    path: 'Development/Frontend Work',
    children: [],
    color: '#22c55e',
    icon: '🎨',
    description: 'Frontend development tasks',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'backend-work',
    name: 'Backend Work',
    conditions: [
      {
        id: generateConditionId(),
        field: 'tags',
        operator: 'contains',
        value: 'tag-2' // Backend tag
      }
    ],
    parentId: 'development',
    level: 2,
    path: 'Development/Backend Work',
    children: [],
    color: '#f97316',
    icon: '⚙️',
    description: 'Backend development tasks',
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Level 3 (Detail folders)
  {
    id: 'urgent-bugs',
    name: 'Urgent Bugs',
    conditions: [
      {
        id: generateConditionId(),
        field: 'priority',
        operator: 'is',
        value: 'High'
      },
      {
        id: generateConditionId(),
        field: 'type',
        operator: 'is',
        value: 'Bug',
        logic: 'and'
      }
    ],
    parentId: 'high-priority',
    level: 3,
    path: 'Priority Based/High Priority/Urgent Bugs',
    children: [],
    color: '#dc2626',
    icon: '🐛',
    description: 'Critical bugs requiring immediate fixes',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export const useSmartFolderStore = create<SmartFolderStore>()(
  persist(
    (set, get) => ({
      smartFolders: [...systemSmartFolders, ...defaultSmartFolders],

      addSmartFolder: (folder) => {
        const { smartFolders } = get()
        const parentFolder = folder.parentId ? smartFolders.find(f => f.id === folder.parentId) : null
        
        // Validate hierarchy level
        if (folder.level > 3) {
          throw new Error('Maximum hierarchy level is 3')
        }
        
        if (parentFolder && parentFolder.level >= 3) {
          throw new Error('Cannot add child to level 3 folder')
        }
        
        // Generate path
        const path = parentFolder ? `${parentFolder.path}/${folder.name}` : folder.name
        
        // Generate order (last in the list at this level)
        const siblingsAtLevel = parentFolder 
          ? smartFolders.filter(f => f.parentId === parentFolder.id)
          : smartFolders.filter(f => f.level === 1 && !f.isSystem)
        const maxOrder = siblingsAtLevel.length > 0 
          ? Math.max(...siblingsAtLevel.map(f => f.order))
          : 0
        
        const newFolder: SmartFolder = {
          ...folder,
          id: generateId(),
          path,
          children: [],
          order: folder.order ?? maxOrder + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        // Update parent's children array
        const updatedFolders = [...smartFolders, newFolder]
        if (parentFolder) {
          const parentIndex = updatedFolders.findIndex(f => f.id === parentFolder.id)
          if (parentIndex !== -1) {
            updatedFolders[parentIndex] = {
              ...parentFolder,
              children: [...(parentFolder.children || []), newFolder.id],
              updatedAt: new Date(),
            }
          }
        }
        
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

        return tasks.filter((task) => get().evaluateTask(task, folder.conditions))
      },

      getTaskCount: (tasks, folderId) => {
        return get().getMatchingTasks(tasks, folderId).length
      },

      // Hierarchy helpers
      getRootFolders: () => {
        const { smartFolders } = get()
        return smartFolders.filter(folder => folder.level === 1)
      },

      getChildFolders: (parentId) => {
        const { smartFolders } = get()
        return smartFolders.filter(folder => folder.parentId === parentId)
      },

      getFoldersByLevel: (level) => {
        const { smartFolders } = get()
        return smartFolders.filter(folder => folder.level === level)
      },

      getFolderHierarchy: () => {
        const { smartFolders } = get()
        return smartFolders.sort((a, b) => {
          // Sort by level first, then by path
          if (a.level !== b.level) {
            return a.level - b.level
          }
          return a.path.localeCompare(b.path)
        })
      },

      getFolderPath: (folderId) => {
        const { smartFolders } = get()
        const folder = smartFolders.find(f => f.id === folderId)
        return folder ? folder.path : ''
      },

      canAddChild: (parentId) => {
        const { smartFolders } = get()
        const parent = smartFolders.find(f => f.id === parentId)
        return parent ? parent.level < 3 : false
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