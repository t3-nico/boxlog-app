/**
 * ベースビュー型定義
 * 全カレンダービューで共通するプロパティ
 */

// CalendarPlanの型定義（外部からも使用されるため再エクスポート）
export type { CalendarPlan } from './plan.types'
import type { ViewDateRange } from '../../../../types/calendar.types'
import type { CalendarPlan } from './plan.types'

// ViewDateRange を calendar.types.ts から再エクスポート
export type { ViewDateRange } from '../../../../types/calendar.types'

export type CalendarViewType = 'day' | '3day' | '5day' | 'week' | 'agenda'

/**
 * 全ビューで共通するベースプロパティ
 */
export interface BaseViewProps {
  // Core data
  dateRange: ViewDateRange
  plans: CalendarPlan[]
  currentDate: Date

  // Display options
  showWeekends?: boolean | undefined
  className?: string | undefined

  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined

  // Plan handlers
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
  onCreatePlan?: ((date: Date, time?: string) => void) | undefined
  onUpdatePlan?:
    | ((planIdOrPlan: string | CalendarPlan, updates?: { startTime: Date; endTime: Date }) => void | Promise<void>)
    | undefined
  onDeletePlan?: ((planId: string) => void) | undefined
  onRestorePlan?: ((plan: CalendarPlan) => Promise<void>) | undefined
  onEmptyClick?: ((date: Date, time: string) => void) | undefined
  onTimeRangeSelect?:
    | ((selection: { date: Date; startHour: number; startMinute: number; endHour: number; endMinute: number }) => void)
    | undefined

  // Navigation handlers
  onViewChange?: ((viewType: CalendarViewType) => void) | undefined
  onNavigatePrev?: (() => void) | undefined
  onNavigateNext?: (() => void) | undefined
  onNavigateToday?: (() => void) | undefined
}

/**
 * プラン位置情報の基本型
 * 4箇所で重複していた PlanPosition を統一
 */
export interface BasePlanPosition {
  plan: CalendarPlan
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
}

/**
 * ビュー設定の基本型
 * 4箇所で重複していた ViewSettings を統一
 */
export interface BaseViewSettings {
  startHour: number
  endHour: number
  timeInterval: 15 | 30 | 60
  showQuarterLines: boolean
  showCurrentTime: boolean
  maxPlanColumns: number
  planMinHeight: number
}
