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
    case 'backlog':
      return <Minus {...iconProps} className={`${iconProps.className} text-gray-400`} />
    case 'scheduled':
      return <Clock {...iconProps} style={{ color: 'rgb(var(--color-task-progress))' }} />
    case 'completed':
      return <CheckCircle2 {...iconProps} style={{ color: 'rgb(var(--color-task-completed))' }} />
    case 'rescheduled':
      return <Clock {...iconProps} style={{ color: 'rgb(var(--color-task-rescheduled))' }} />
    case 'stopped':
      return <XCircle {...iconProps} style={{ color: 'rgb(var(--color-task-cancelled))' }} />
    case 'delegated':
      return <ArrowUp {...iconProps} style={{ color: 'rgb(var(--color-task-delegated))' }} />
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
    case 'urgent':
      return <AlertTriangle {...iconProps} style={{ color: 'rgb(var(--color-priority-urgent))' }} />
    case 'high':
      return <ArrowUp {...iconProps} style={{ color: 'rgb(var(--color-priority-high))' }} />
    case 'medium':
      return <Minus {...iconProps} style={{ color: 'rgb(var(--color-priority-medium))' }} />
    case 'low':
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
    case 'task':
      return <CheckCircle2 {...iconProps} className={`${iconProps.className} text-blue-500`} />
    case 'milestone':
      return <AlertTriangle {...iconProps} className={`${iconProps.className} text-purple-500`} />
    case 'meeting':
      return <Clock {...iconProps} className={`${iconProps.className} text-yellow-500`} />
    case 'reminder':
      return <Circle {...iconProps} className={`${iconProps.className} text-green-500`} />
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
    case 'backlog':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900'
    case 'scheduled':
      return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'
    case 'completed':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    case 'rescheduled':
      return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800'
    case 'stopped':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'delegated':
      return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

export const getPriorityColorClass = (priority: TaskPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-900 bg-red-200 dark:text-red-200 dark:bg-red-900'
    case 'high':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'medium':
      return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800'
    case 'low':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

export const getTypeColorClass = (type: TaskType): string => {
  switch (type) {
    case 'task':
      return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'
    case 'milestone':
      return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-800'
    case 'meeting':
      return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800'
    case 'reminder':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}