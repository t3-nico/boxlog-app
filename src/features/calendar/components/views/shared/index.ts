/**
 * 共有カレンダーコンポーネントのメインエクスポート
 */

// ===== グリッドシステム =====
// TimeGrid - メインのタイムグリッド
export type * from './grid/TimeGrid';
export { TimeGrid } from './grid/TimeGrid';

// TimeColumn - 時間列
export { TimeColumn, TimeLabel } from './grid/TimeColumn';

// GridLines - グリッド線
export { HalfHourLines, HourLines } from './grid/GridLines';

// CurrentTimeLine - 現在時刻線
export { CurrentTimeLine as SimpleCurrentTimeLine } from '../../CurrentTimeLine';
export { CurrentTimeLine, CurrentTimeLineForColumn } from './grid/CurrentTimeLine';

// ===== UIコンポーネント =====
// PlanCard - プラン表示
export type * from './components/PlanCard';
export { PlanCard, PlanCardContent } from './components/PlanCard';

// DayColumn - 日列（イベント表示エリアのみ）
export { DayColumn } from './components/DayColumn';

// ドラッグ選択レイヤー（新設計）
export { CalendarDragSelection } from './components/CalendarDragSelection';
export type { DateTimeSelection, TimeRange } from './components/CalendarDragSelection';

// 旧版（後方互換性のため保持）
export { DragSelectionLayer } from './components/DragSelectionLayer';
export type { TimeSelection } from './components/DragSelectionLayer';

// DailyUsageStrip - 日別使用時間表示
export { DailyUsageStrip, DailyUsageStripSingle } from './components/DailyUsageStrip';

// TimezoneOffset - タイムゾーン表示
export { TimezoneOffset } from './components/TimezoneOffset';

// DateDisplay - 日付表示
export type * from './DateDisplay';
export { DateDisplay, DateDisplayRow, DayDisplay } from './DateDisplay';

// ===== カスタムフック =====
export { useCurrentTime } from './hooks/useCurrentTime';
export { useDragAndDrop } from './hooks/useDragAndDrop';
export type { DragHandlers, DragState } from './hooks/useDragAndDrop';
export { useGlobalDragCursor } from './hooks/useGlobalDragCursor';
export { useIsToday } from './hooks/useIsToday';
export { usePlanLayoutCalculator } from './hooks/usePlanLayoutCalculator';
export type { PlanLayout } from './hooks/usePlanLayoutCalculator';
export { usePlanPosition, usePositionedPlans } from './hooks/usePlanPosition';
export { usePlanStyles } from './hooks/usePlanStyles';
export { useBreakpoint, useResponsiveHourHeight } from './hooks/useResponsiveHourHeight';
export { useScrollSync } from './hooks/useScrollSync';
export { useTimeCalculation } from './hooks/useTimeCalculation';
export type { TimeCalculationResult, UseTimeCalculationOptions } from './hooks/useTimeCalculation';
export { useTimeGrid } from './hooks/useTimeGrid';
export { useTimeSlots } from './hooks/useTimeSlots';
export { useViewDimensions } from './hooks/useViewDimensions';
export { useViewPlans } from './hooks/useViewPlans';
export type { PlanPosition } from './hooks/useViewPlans';

// Phase 3: 統合カスタムフック
export { useCurrentPeriod } from './hooks/useCurrentPeriod';
export type { UseCurrentPeriodOptions, UseCurrentPeriodReturn } from './hooks/useCurrentPeriod';
export { useDateUtilities } from './hooks/useDateUtilities';
export type { UseDateUtilitiesOptions, UseDateUtilitiesReturn } from './hooks/useDateUtilities';
export { useMultiDayPlanPositions } from './hooks/useMultiDayPlanPositions';
export { usePlansByDate } from './hooks/usePlansByDate';
export type { UsePlansByDateOptions, UsePlansByDateReturn } from './hooks/usePlansByDate';

// ScrollableCalendarLayout関連フック
export { useCurrentTimeLine } from './hooks/useCurrentTimeLine';
export { useScrollableCalendar } from './hooks/useScrollableCalendar';
export { useSleepHoursLayout } from './hooks/useSleepHoursLayout';

// ===== プロバイダー =====
export { CalendarGridProvider, useCalendarGridVars } from './components/CalendarGridProvider';

// ===== レイアウト =====
export {
  CalendarDateHeader,
  ScrollableCalendarLayout,
} from './components/ScrollableCalendarLayout';

// 型定義のエクスポート
export type { PositionedPlan } from './hooks/usePlanPosition';

// ===== ユーティリティ関数 =====
// dateHelpers
export {
  addDays,
  addMinutes,
  endOfDay,
  formatDate,
  formatTime,
  formatTimeRange,
  generateDateRange,
  getDateKey,
  getDaysDifference,
  getMonthEnd,
  getMonthStart,
  getTodayIndex,
  getWeekEnd,
  getWeekStart,
  isSameDay,
  isToday,
  isValidEvent,
  isWeekend,
  normalizeEventDate,
  startOfDay,
} from './utils/dateHelpers';

// gridCalculator
export {
  calculateGridHeight,
  calculateScrollPosition,
  getDurationInMinutes,
  getEventStyle,
  isTimeInRange,
  pixelsToTime,
  pixelsToTimeValues,
  roundToQuarterHour,
  timeToPixels,
} from './utils/gridCalculator';

// planGhost
export { calculatePlanGhostStyle, calculatePreviewTime } from './utils/planGhost';

// planPositioning
export {
  calculatePlanPosition,
  calculatePlanPositionWithCollapse,
  detectOverlapGroups,
  filterPlansByDate,
  plansOverlap,
  sortTimedPlans,
} from './utils/planPositioning';

// planSorting
export {
  sortAgendaEventsByDateKeys,
  sortEventsByDateKeys,
  sortEventsByTime,
  sortEventsForAgenda,
} from './utils/planSorting';

// ===== 定数 =====
export {
  CURRENT_TIME_DOT_SIZE,
  CURRENT_TIME_LINE_COLOR,
  EVENT_GAP,
  EVENT_HORIZONTAL_PADDING,
  EVENT_VERTICAL_PADDING,
  GRID_BACKGROUND,
  GRID_BORDER,
  HALF_HOUR_HEIGHT,
  HALF_HOUR_LINE_COLOR,
  HOUR_HEIGHT,
  HOUR_LINE_COLOR,
  MINUTE_HEIGHT,
  MIN_EVENT_HEIGHT,
  SCROLL_BEHAVIOR,
  SCROLL_TO_HOUR,
  TIME_COLUMN_WIDTH,
  TIME_LABEL_HEIGHT,
  TRANSITION_DURATION,
  Z_INDEX,
} from './constants/grid.constants';

// ===== 型定義 =====
export type * from './types/base.types';
export type * from './types/grid.types';
export type { TimeSlot } from './types/grid.types';
export type * from './types/plan.types';
export type * from './types/view.types';
