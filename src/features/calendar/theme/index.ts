// features/calendar/theme/index.ts
// カレンダーテーマ統合エクスポート（Tailwindクラスベース）

// Colors
export { calendarColors, type CalendarColors } from './colors';

// Styles - 基本スタイル定義（レイアウト、印刷、トランジション）
export { calendarCustomCSS, calendarStyles, type CalendarStyles } from './styles';

// Animations - アニメーション定義（pulse、fadeIn、dragScale など）
export { calendarAnimations, type CalendarAnimations } from './animations';

// Utilities - ヘルパー関数
export {
  combineClasses,
  getBorderDefault,
  getCalendarAnimation,
  getCalendarGridClassName,
  getCalendarStyle,
  getCurrentTimeLineClassName,
  getDropZoneClassName,
  getErrorBorder,
  getEventClassName,
  getEventColor,
  getGridLineClassName,
  getPlaceholderClassName,
  getSelectionBg,
  getStatusColor,
  getSurfaceBg,
  getTextMuted,
  getTimeColumnClassName,
  getTodayHighlightClassName,
  getWeekendHighlightClassName,
} from './utils';
