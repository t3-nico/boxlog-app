/**
 * Settings Feature - Public API
 *
 * ユーザー設定（カレンダー設定、タイムゾーン、日付フォーマットなど）の管理。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Stores
// =============================================================================
// Re-export from shared stores for backward compatibility
export { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
export type { CalendarViewType, DateFormatType } from '@/stores/useCalendarSettingsStore';
// Re-export from shared stores for backward compatibility
export { useSettingsModalStore } from '@/stores/useSettingsModalStore';

// =============================================================================
// Hooks
// =============================================================================
export { useDateFormat } from '@/hooks/useDateFormat';

// =============================================================================
// Utils
// =============================================================================
export {
  SUPPORTED_TIMEZONES,
  formatCurrentTime,
  formatTimezoneInfo,
  getBrowserTimezone,
  getCalendarTimezoneLabel,
  getCurrentTimeInUserTimezone,
  getCurrentTimePosition,
  getCurrentTimezone,
  getShortTimezoneDisplay,
  getTimezoneOffset,
  getUserTimezone,
  listenToTimezoneChange,
  setUserTimezone,
  userTimezoneToUtc,
  utcToUserTimezone,
} from './utils/timezone';
export type { TimezoneValue } from './utils/timezone';

export {
  formatDateTimeWithSettings,
  formatDateWithSettings,
  formatHour,
  getTimeZones,
} from './utils/timezone-utils';
export type { TimezoneInfoJa } from './utils/timezone-utils';
