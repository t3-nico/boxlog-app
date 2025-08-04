/**
 * アイコン取得の共通ユーティリティ関数
 * 
 * タスクステータス、優先度、アイテムタイプに応じたアイコンを提供
 */

import React from 'react'
import {
  Circle,
  CheckCircle2,
  Clock,
  XCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Tag as TagIcon,
  Folder,
  FileText,
  Bug,
  Lightbulb
} from 'lucide-react'
import { TaskStatus, TaskPriority, TaskType } from '@/types/box'

interface IconProps {
  className?: string
  size?: number
}

export const getStatusIcon = (status: TaskStatus, props?: IconProps) => {
  const iconProps = {
    className: props?.className || "h-4 w-4",
    size: props?.size
  }

  switch (status) {
    case 'Todo':
      return <Circle {...iconProps} style={{ color: 'rgb(var(--color-task-todo))' }} />
    case 'In Progress':
      return <Clock {...iconProps} style={{ color: 'rgb(var(--color-task-progress))' }} />
    case 'Done':
      return <CheckCircle2 {...iconProps} style={{ color: 'rgb(var(--color-task-completed))' }} />
    case 'Cancelled':
      return <XCircle {...iconProps} style={{ color: 'rgb(var(--color-task-cancelled))' }} />
    case 'Backlog':
      return <Minus {...iconProps} className={`${iconProps.className} text-gray-400`} />
    default:
      return <Circle {...iconProps} className={`${iconProps.className} text-gray-500`} />
  }
}

export const getPriorityIcon = (priority: TaskPriority, props?: IconProps) => {
  const iconProps = {
    className: props?.className || "h-4 w-4",
    size: props?.size
  }

  switch (priority) {
    case 'High':
      return <ArrowUp {...iconProps} style={{ color: 'rgb(var(--color-priority-high))' }} />
    case 'Medium':
      return <Minus {...iconProps} style={{ color: 'rgb(var(--color-priority-medium))' }} />
    case 'Low':
      return <ArrowDown {...iconProps} style={{ color: 'rgb(var(--color-priority-low))' }} />
    default:
      return <Minus {...iconProps} className={`${iconProps.className} text-gray-500`} />
  }
}

export const getTaskTypeIcon = (type: TaskType, props?: IconProps) => {
  const iconProps = {
    className: props?.className || "h-4 w-4",
    size: props?.size
  }

  switch (type) {
    case 'Task':
      return <CheckCircle2 {...iconProps} className={`${iconProps.className} text-blue-500`} />
    case 'Bug':
      return <Bug {...iconProps} className={`${iconProps.className} text-red-500`} />
    case 'Feature':
      return <Lightbulb {...iconProps} className={`${iconProps.className} text-yellow-500`} />
    case 'Documentation':
      return <FileText {...iconProps} className={`${iconProps.className} text-green-500`} />
    default:
      return <FileText {...iconProps} className={`${iconProps.className} text-gray-500`} />
  }
}

export const getItemTypeIcon = (type: string, props?: IconProps) => {
  const iconProps = {
    className: props?.className || "h-4 w-4",
    size: props?.size
  }

  switch (type.toLowerCase()) {
    case 'tag':
      return <TagIcon {...iconProps} className={`${iconProps.className} text-blue-500`} />
    case 'folder':
    case 'smart-folder':
      return <Folder {...iconProps} className={`${iconProps.className} text-yellow-500`} />
    case 'task':
      return <CheckCircle2 {...iconProps} className={`${iconProps.className} text-green-500`} />
    case 'urgent':
    case 'important':
      return <AlertTriangle {...iconProps} className={`${iconProps.className} text-red-500`} />
    default:
      return <Circle {...iconProps} className={`${iconProps.className} text-gray-500`} />
  }
}

// CSS classes for status colors (Tailwind)
export const getStatusColorClass = (status: TaskStatus): string => {
  switch (status) {
    case 'Todo':
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
    case 'In Progress':
      return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'
    case 'Done':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    case 'Cancelled':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'Backlog':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

export const getPriorityColorClass = (priority: TaskPriority): string => {
  switch (priority) {
    case 'High':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'Medium':
      return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800'
    case 'Low':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

export const getTypeColorClass = (type: TaskType): string => {
  switch (type) {
    case 'Bug':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'Feature':
      return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'
    case 'Documentation':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}