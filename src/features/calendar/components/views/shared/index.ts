/**
 * 共有カレンダーコンポーネントのメインエクスポート
 */

// ===== グリッドシステム =====
// TimeGrid - メインのタイムグリッド
export { TimeGrid } from './grid/TimeGrid'
export type * from './grid/TimeGrid'

// TimeColumn - 時間列
export { TimeColumn, TimeLabel } from './grid/TimeColumn'

// GridLines - グリッド線
export { HourLines, HalfHourLines } from './grid/GridLines'

// CurrentTimeLine - 現在時刻線
export { CurrentTimeLine, CurrentTimeLineForColumn } from './grid/CurrentTimeLine'
export { CurrentTimeLine as SimpleCurrentTimeLine } from '../../CurrentTimeLine'

// ===== UIコンポーネント =====
// EventBlock - イベント表示
export { EventBlock, EventContent } from './components/EventBlock'
export type * from './components/EventBlock'


// DayColumn - 日列（イベント表示エリアのみ）
export { DayColumn } from './components/DayColumn'

// ドラッグ選択レイヤー（新設計）
export { CalendarDragSelection } from './components/CalendarDragSelection'
export type { DateTimeSelection, TimeRange } from './components/CalendarDragSelection'

// 旧版（後方互換性のため保持）
export { DragSelectionLayer } from './components/DragSelectionLayer'
export type { TimeSelection } from './components/DragSelectionLayer'

// EmptyState - 空状態
export { EmptyState } from './components/EmptyState'

// TimezoneOffset - タイムゾーン表示
export { TimezoneOffset } from './components/TimezoneOffset'

// DateDisplay - 日付表示
export { DateDisplay, DateDisplayRow, DayDisplay } from './DateDisplay'
export type * from './DateDisplay'

// ===== カスタムフック =====
export { useCurrentTime } from './hooks/useCurrentTime'
export { useTimeGrid } from './hooks/useTimeGrid'
export { useEventPosition, usePositionedEvents } from './hooks/useEventPosition'
export { useScrollSync } from './hooks/useScrollSync'
export { useViewDimensions } from './hooks/useViewDimensions'
export { useResponsiveHourHeight, useBreakpoint } from './hooks/useResponsiveHourHeight'
export { useViewEvents } from './hooks/useViewEvents'
export type { EventPosition } from './hooks/useViewEvents'
export { useDragAndDrop } from './hooks/useDragAndDrop'
export type { DragState, DragHandlers } from './hooks/useDragAndDrop'
export { useEventLayoutCalculator } from './hooks/useEventLayoutCalculator'
export type { EventLayout } from './hooks/useEventLayoutCalculator'
export { useTimeSlots } from './hooks/useTimeSlots'
export { useIsToday } from './hooks/useIsToday'
export { useEventStyles } from './hooks/useEventStyles'
export { useTimeCalculation } from './hooks/useTimeCalculation'
export type { TimeCalculationResult, UseTimeCalculationOptions } from './hooks/useTimeCalculation'
export { useGlobalDragCursor } from './hooks/useGlobalDragCursor'

// Phase 3: 統合カスタムフック
export { useEventsByDate } from './hooks/useEventsByDate'
export type { UseEventsByDateOptions, UseEventsByDateReturn } from './hooks/useEventsByDate'
export { useCurrentPeriod } from './hooks/useCurrentPeriod'
export type { UseCurrentPeriodOptions, UseCurrentPeriodReturn } from './hooks/useCurrentPeriod'
export { useDateUtilities } from './hooks/useDateUtilities'
export type { UseDateUtilitiesOptions, UseDateUtilitiesReturn } from './hooks/useDateUtilities'

// ===== プロバイダー =====
export { CalendarGridProvider, useCalendarGridVars } from './components/CalendarGridProvider'

// ===== レイアウト =====
export { ScrollableCalendarLayout, CalendarLayoutWithHeader } from './components/ScrollableCalendarLayout'

// 型定義のエクスポート（互換性のため）
export type { PositionedEvent } from './hooks/useEventPosition'

// ===== ユーティリティ関数 =====
export * from './utils/gridCalculator'
export * from './utils/eventPositioning'
export * from './utils/dateHelpers'
export * from './utils/eventSorting'
export * from './utils/eventGhost'


// ===== 定数 =====
export * from './constants/grid.constants'

// ===== 型定義 =====
export type * from './types/base.types'
export type * from './types/grid.types'
export type * from './types/event.types'
export type * from './types/view.types'
export type { TimeSlot } from './types/grid.types'