// Legacy task types - use unified.ts types instead
// export type TaskType = 'Bug' | 'Feature' | 'Documentation'
// export type TaskStatus = 'Todo' | 'In Progress' | 'Backlog' | 'Cancelled' | 'Done'
// export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
}

export interface Comment {
  id: string
  content: string
  createdAt: Date
  author: string
}

// Legacy Tag interface - use unified.ts types instead
// export interface Tag {
//   id: string
//   name: string
//   color: string
//   icon?: string
//   description?: string
//   parentId?: string // For hierarchy support (up to 3 levels)
//   level: number // 1, 2, or 3
//   path: string // e.g., "Frontend/Components/Button"
//   children?: string[] // Child tag IDs
//   order: number // For sorting/ordering
//   createdAt: Date
//   updatedAt: Date
// }

export type FilterField = 'status' | 'priority' | 'type' | 'tags'
export type FilterOperator = 'is' | 'is_not' | 'contains'
export type FilterLogic = 'and' | 'or'

export interface FolderCondition {
  id: string
  field: FilterField
  operator: FilterOperator
  value: string | string[]
  logic?: FilterLogic // For connecting to next condition
}

// Legacy SmartFolder interface - use unified.ts types instead
// export interface SmartFolder {
//   id: string
//   name: string
//   conditions: FolderCondition[]
//   parentId?: string // For hierarchy support (up to 3 levels)
//   level: number // 1, 2, or 3
//   path: string // e.g., "Development/Frontend/Components"
//   children?: string[] // Child folder IDs
//   color?: string // Optional color for visual organization
//   icon?: string // Optional icon
//   description?: string // Optional description
//   order: number // For sorting/ordering
//   isSystem?: boolean // System-defined folders (All Tasks, Recent, etc.)
//   createdAt: Date
//   updatedAt: Date
// }

// Eagle-style sidebar section state
export interface SidebarSection {
  id: string
  name: string
  collapsed: boolean
  order: number
}

// System smart folder types
export type SystemSmartFolderType = 'all' | 'recent' | 'favorites' | 'trash'

export interface Task {
  id: string
  task: string // TASK-8782 format
  title: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  selected: boolean
  description?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  attachments?: Attachment[]
  comments?: Comment[]
  estimatedHours?: number
  actualHours?: number
  tags?: string[] // Tag IDs
}

export interface TaskFilters {
  search: string
  status: TaskStatus[]
  priority: TaskPriority[]
  type: TaskType[]
  tags: string[] // Tag IDs
  smartFolder?: string // SmartFolder ID
}

export interface SortConfig {
  key: keyof Task | null
  direction: 'asc' | 'desc'
}