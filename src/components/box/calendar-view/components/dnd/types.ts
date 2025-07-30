import type { CalendarEvent } from '@/types/events'

// ドラッグタイプの定義
export const DragTypes = {
  EVENT: 'calendar-event'
} as const

// ドラッグされるアイテムの型
export interface DraggedEvent {
  type: typeof DragTypes.EVENT
  event: CalendarEvent
  originalDayIndex: number
  originalTopPosition: number
}

// ドロップ結果の型
export interface DropResult {
  dayIndex: number
  topPosition: number
  targetDate: Date
}