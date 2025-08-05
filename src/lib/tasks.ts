import { Task, TaskType, TaskStatus, TaskPriority } from '@/types/box'

export const taskTypes: TaskType[] = ['task', 'milestone']

export const initialTasks: Task[] = [
  // TODO: 新しいTaskType/TaskStatus/TaskPriority型に合わせて修正が必要
]

// IDを生成する関数
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// ステータス色を取得する関数
export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'backlog':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

// 優先度色を取得する関数
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

// タイプ色を取得する関数
export function getTypeColor(type: TaskType): string {
  switch (type) {
    case 'task':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
    case 'milestone':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}
