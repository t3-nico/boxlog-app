// features/calendar/theme/index.ts
// カレンダーテーマ統合エクスポート（Tailwindクラスベース）
// 注: カラーはglobals.cssのセマンティックトークンを直接使用

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
  getCurrentTimeLineClassName,
  getDropZoneClassName,
  getErrorBorder,
  getGridLineClassName,
  getPlaceholderClassName,
  getSelectionBg,
  getSurfaceBg,
  getTextMuted,
  getTimeColumnClassName,
  getTodayHighlightClassName,
  getWeekendHighlightClassName,
} from './utils';
