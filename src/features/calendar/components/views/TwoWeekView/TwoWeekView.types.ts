import type { CSSProperties } from 'react'

import type { BaseViewProps, CalendarEvent } from '../shared'

// TwoWeekViewの固有Props（BaseViewPropsを継承して95%削減）
export interface TwoWeekViewProps extends BaseViewProps {
  startDate?: Date // 開始日（指定がない場合はdateRange.startを使用）
  weekStartsOn?: 0 | 1 // 週の開始日（0: 日曜始まり, 1: 月曜始まり）
}

// useTwoWeekViewフックのオプション
export interface UseTwoWeekViewOptions {
  startDate: Date
  events: CalendarEvent[]
  weekStartsOn?: 0 | 1 // 週の開始日（0: 日曜始まり, 1: 月曜始まり）
  onEventUpdate?: (event: CalendarEvent) => void
}

// useTwoWeekViewフックの返却値
export interface UseTwoWeekViewReturn {
  twoWeekDates: Date[] // 14日分の日付
  eventsByDate: Record<string, CalendarEvent[]>
  todayIndex: number // 今日のインデックス（-1 if not in range）
  scrollToToday: () => void
  scrollToNow: () => void
  currentWeekIndex: number // 今日がある週のインデックス（0 or 1）
  isCurrentTwoWeeks: boolean // 現在の2週間かどうか
}

// 2週間ビューでのイベント位置情報
export interface TwoWeekEventPosition {
  event: CalendarEvent
  dayIndex: number
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
}

// 時間スロット情報
export interface TwoWeekTimeSlot {
  time: string
  hour: number
  minute: number
  label: string
  isHour: boolean
  isHalfHour: boolean
  isQuarterHour: boolean
}

// 2週間ビューの設定
export interface TwoWeekViewSettings {
  startHour: number
  endHour: number
  timeInterval: 15 | 30 | 60 // minutes
  showQuarterLines: boolean
  showCurrentTime: boolean
  maxEventColumns: number
  eventMinHeight: number
  dayColumnWidth: number // 各日の列幅（%） = 100/14 = 7.14%
  enableHorizontalScroll: boolean
  showWeekSeparator: boolean
}

// 日付ヘッダーの情報
export interface TwoWeekDateDisplay {
  date: Date
  dayName: string
  dayNumber: number
  isToday: boolean
  isWeekend: boolean
  weekIndex: 0 | 1 // 第1週か第2週か
  events: CalendarEvent[]
  eventCount: number
}

// イベントのスタイル情報
export interface TwoWeekEventStyle {
  position: CSSProperties
  color: string
  textColor: string
  borderColor: string
  opacity: number
}

// TwoWeek Grid コンポーネントのProps
export interface TwoWeekGridProps {
  twoWeekDates: Date[]
  events: CalendarEvent[]
  eventsByDate: Record<string, CalendarEvent[]>
  todayIndex: number
  currentWeekIndex: number
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  className?: string
}

// 週分離用の設定
export interface WeekSeparatorProps {
  weekIndex: 0 | 1
  weekStartDate: Date
  weekEndDate: Date
  className?: string
}

// 横スクロール制御用の設定
export interface HorizontalScrollSettings {
  enableScroll: boolean
  scrollToToday: boolean
  scrollBehavior: 'auto' | 'smooth'
  containerWidth: string
  dayWidth: string
}
