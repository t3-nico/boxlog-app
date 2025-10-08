import type { CalendarEvent } from '@/features/calendar/types'

// Calendar操作の種類
export type CalendarAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'duplicated'
  | 'bulk-deleted'
  | 'sync-started'
  | 'sync-completed'
  | 'sync-failed'

// Calendar Toast用の拡張型
export interface CalendarToastOptions {
  event?: CalendarEvent
  events?: CalendarEvent[]
  count?: number
  undoAction?: () => void | Promise<void>
  viewAction?: () => void
  retryAction?: () => void | Promise<void>
  fromDate?: Date
  toDate?: Date
}

// メッセージテンプレート型
export interface ToastTemplate {
  title: string
  description?: (options: CalendarToastOptions) => string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
}

export type ToastTemplates = Record<CalendarAction, ToastTemplate>
