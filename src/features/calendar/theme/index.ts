// features/calendar/theme/index.ts
// カレンダーテーマ統合エクスポート（Tailwindクラスベース）

// Colors
export { 
  calendarColors,
  type CalendarColors 
} from './colors'


// Animations
export { 
  calendarAnimations, 
  type CalendarAnimations 
} from './animations'

// Utilities
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

