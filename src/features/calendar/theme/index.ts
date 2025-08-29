// features/calendar/theme/index.ts
// カレンダーテーマ統合エクスポート（Tailwindクラスベース）

// Colors
export { 
  calendarColors,
  type CalendarColors 
} from './colors'

// Styles - 基本スタイル定義（レイアウト、印刷、トランジション）
export { 
  calendarStyles, 
  calendarCustomCSS,
  type CalendarStyles 
} from './styles'

// Animations - アニメーション定義（pulse、fadeIn、dragScale など）
export { 
  calendarAnimations, 
  type CalendarAnimations 
} from './animations'

// Utilities - ヘルパー関数
export { 
  getEventColor, 
  getStatusColor, 
  getCommonColor,
  getCalendarStyle,
  getCalendarAnimation,
  getEventClassName,
  getCalendarGridClassName,
  getTimeColumnClassName,
  getGridLineClassName,
  getTodayHighlightClassName,
  getWeekendHighlightClassName,
  getCurrentTimeLineClassName,
  getDropZoneClassName,
  getPlaceholderClassName,
  combineClasses
} from './utils'

