/**
 * ScheduleView - Google Calendar風のスケジュール表示
 * 
 * エクスポート:
 * - ScheduleView: メインコンポーネント
 * - ScheduleEventCard: イベントカード
 * - ScheduleDateSection: 日付セクション
 * - 型定義とユーティリティ
 */

// メインコンポーネント
export { ScheduleView } from './ScheduleView'

// 子コンポーネント
export { ScheduleEventCard } from './components/ScheduleEventCard'
export { ScheduleDateSection } from './components/ScheduleDateSection'

// 型定義
export type {
  ScheduleViewProps,
  ScheduleEvent,
  EventDateGroup,
  FreeSlot,
  KeyboardShortcut,
  ScheduleScrollState,
  EventDisplaySettings,
  QuickAction,
  ScheduleFilter,
  ScheduleSortBy,
  ScheduleSortOrder,
  ScheduleErrorState,
  ScheduleLoadingState,
  VirtualizationSettings,
  ScheduleAnimationSettings,
  ScheduleA11ySettings
} from './ScheduleView.types'

// ユーティリティ関数
export {
  groupEventsByDate,
  getDateGroupLabel,
  detectFreeSlots,
  sortEventsByTime,
  findNextEvent,
  getTodayRemainingEvents
} from './utils/dateGrouping'

// カスタムフック
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation'