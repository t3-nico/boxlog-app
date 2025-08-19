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

// ===== UIコンポーネント =====
// EventBlock - イベント表示
export { EventBlock, EventContent } from './components/EventBlock'
export type * from './components/EventBlock'


// DayColumn - 日列（イベント表示エリアのみ）
export { DayColumn } from './components/DayColumn'

// EmptyState - 空状態
export { EmptyState } from './components/EmptyState'

// TimezoneOffset - タイムゾーン表示
export { TimezoneOffset } from './components/TimezoneOffset'

// DateHeader - 日付ヘッダー
export { DateHeader, DateHeaderRow } from './components/DateHeader'
export type * from './components/DateHeader'

// ===== カスタムフック =====
export { useCurrentTime } from './hooks/useCurrentTime'
export { useTimeGrid } from './hooks/useTimeGrid'
export { useEventPosition, usePositionedEvents } from './hooks/useEventPosition'
export { useScrollSync } from './hooks/useScrollSync'
export { useViewDimensions } from './hooks/useViewDimensions'

// 型定義のエクスポート（互換性のため）
export type { PositionedEvent } from './hooks/useEventPosition'

// ===== ユーティリティ関数 =====
export * from './utils/gridCalculator'
export * from './utils/eventPositioning'
export * from './utils/dateHelpers'

// ===== 定数 =====
export * from './constants/grid.constants'

// ===== 型定義 =====
export type * from './types/grid.types'
export type * from './types/event.types'
export type * from './types/view.types'