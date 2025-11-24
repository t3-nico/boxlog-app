import type { CSSProperties } from 'react'

import type { BasePlanPosition, BaseViewProps, CalendarPlan, DateTimeSelection } from '../shared'

// WeekViewの固有Props（BaseViewPropsを継承して95%削減）
export interface WeekViewProps extends BaseViewProps {
  weekStartsOn?: 0 | 1 // 0: 日曜始まり, 1: 月曜始まり
  onTimeRangeSelect?: (selection: DateTimeSelection) => void
}

// WeekGridコンポーネントのProps
export interface WeekGridProps {
  weekDates: Date[]
  events: CalendarPlan[]
  eventsByDate: Record<string, CalendarPlan[]>
  todayIndex: number
  timezone: string
  onEventClick?: (plan: CalendarPlan) => void
  onEventContextMenu?: (event: CalendarPlan, mouseEvent: React.MouseEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventUpdate?: (plan: CalendarPlan) => void
  onTimeRangeSelect?: (selection: DateTimeSelection) => void
  className?: string
}

// useWeekViewフックのオプション
export interface UseWeekViewOptions {
  startDate: Date
  events: CalendarPlan[]
  weekStartsOn?: 0 | 1
  onEventUpdate?: (plan: CalendarPlan) => void
}

// useWeekViewフックの返却値
export interface UseWeekViewReturn {
  weekDates: Date[]
  eventsByDate: Record<string, CalendarPlan[]>
  todayIndex: number
  scrollToNow: () => void
  isCurrentWeek: boolean
}

// useWeekEventsフックのオプション
export interface UseWeekEventsOptions {
  weekDates: Date[]
  events: CalendarPlan[]
}

// useWeekEventsフックの返却値
export interface UseWeekEventsReturn {
  eventsByDate: Record<string, CalendarPlan[]>
  eventPositions: WeekEventPosition[]
  maxConcurrentEvents: number
}

// 週ビューでのプラン位置情報
// WeekPlanPositionはBasePlanPositionにdayIndexを追加
export interface WeekPlanPosition extends BasePlanPosition {
  dayIndex: number
}

// 後方互換性のためのエイリアス
/** @deprecated Use WeekPlanPosition instead */
export type WeekEventPosition = WeekPlanPosition

// 時間スロット情報
export interface WeekTimeSlot {
  time: string
  hour: number
  minute: number
  label: string
  isHour: boolean
  isHalfHour: boolean
  isQuarterHour: boolean
}

// 週ビューの設定
export interface WeekViewSettings {
  startHour: number
  endHour: number
  timeInterval: 15 | 30 | 60 // minutes
  showQuarterLines: boolean
  showCurrentTime: boolean
  maxEventColumns: number
  eventMinHeight: number
  dayColumnWidth: number // 各日の列幅（%）
  showWeekends: boolean
  weekStartsOn: 0 | 1
}

// 日付ヘッダーの情報
export interface WeekDateDisplay {
  date: Date
  dayName: string
  dayNumber: number
  isToday: boolean
  isWeekend: boolean
  events: CalendarPlan[]
  eventCount: number
}

// イベントのスタイル情報
export interface WeekEventStyle {
  position: CSSProperties
  color: string
  textColor: string
  borderColor: string
  opacity: number
}
