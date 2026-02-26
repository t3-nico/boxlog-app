/**
 * Calendar Feature - Public API
 *
 * この barrel export は外部から参照される公開インターフェースを定義する。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Main Controller
// =============================================================================
export { CalendarController } from './components/CalendarController';

// =============================================================================
// Layout Components
// =============================================================================
export { CalendarLayout } from './components/layout/CalendarLayout';
export { CalendarHeader } from './components/layout/Header';
export { DateNavigator } from './components/layout/Header/DateNavigator';
export { DateRangeDisplay } from './components/layout/Header/DateRangeDisplay';
export { HeaderActions } from './components/layout/Header/HeaderActions';
export { ViewSwitcher } from './components/layout/Header/ViewSwitcher';

// Mobile Layout
export { MobileDrawer } from './components/layout/MobileLayout/MobileDrawer';
export type { DrawerMenuItem } from './components/layout/MobileLayout/MobileDrawer';
export { MobileHeader } from './components/layout/MobileLayout/MobileHeader';
export type { MobileNavigationDirection } from './components/layout/MobileLayout/MobileHeader';
export { MobileNavigation } from './components/layout/MobileLayout/MobileNavigation';
export type { MobileNavItem } from './components/layout/MobileLayout/MobileNavigation';

// =============================================================================
// View Components
// =============================================================================
export { AgendaView } from './components/views/AgendaView';
export { DayView } from './components/views/DayView';
export { MultiDayView } from './components/views/MultiDayView';
export { WeekView } from './components/views/WeekView';

// =============================================================================
// Aside (Panel) Components
// =============================================================================
export { PlanListPanel } from './components/aside/PlanListPanel';
export { RecordListPanel } from './components/aside/RecordListPanel';

// =============================================================================
// Sidebar Components
// =============================================================================
export { CalendarFilterList } from './components/sidebar/tag-filter/CalendarFilterList';
export { ViewSwitcherList } from './components/sidebar/ViewSwitcherList';

// =============================================================================
// Types
// =============================================================================
export { getMultiDayCount, isMultiDayView } from './types/calendar.types';
export type {
  Calendar,
  CalendarEvent,
  CalendarFilter,
  CalendarHeaderProps,
  CalendarPlan,
  CalendarShare,
  CalendarShareInput,
  CalendarTicket,
  CalendarViewProps,
  CalendarViewState,
  CalendarViewType,
  CreateCalendarInput,
  CreateEventInput,
  CreatePlanInput,
  CreateTicketInput,
  EventInstance,
  MultiDayCount,
  MultiDayViewType,
  PlanInstance,
  RecurrencePattern,
  TicketInstance,
  UpdateCalendarInput,
  UpdateEventInput,
  UpdatePlanInput,
  UpdateTicketInput,
  ViewDateRange,
  ViewSelectorProps,
} from './types/calendar.types';

// =============================================================================
// Stores (Re-export from shared stores for backward compatibility)
// =============================================================================
export { useCalendarFilterStore } from '@/stores/useCalendarFilterStore';
export type { ItemType } from '@/stores/useCalendarFilterStore';

// =============================================================================
// Contexts
// =============================================================================
export {
  CalendarNavigationProvider,
  useCalendarNavigation,
} from './contexts/CalendarNavigationContext';

// =============================================================================
// Hooks
// =============================================================================
export { useResizeHandle } from '@/hooks/useResizeHandle';
export { useCalendarLayout } from './hooks/ui/useCalendarLayout';
export { useCalendarProviderProps } from './hooks/useCalendarProviderProps';
export { useCalendarRealtime } from './hooks/useCalendarRealtime';
export { useWeekendNavigation } from './hooks/useWeekendNavigation';

// Hooks: Cross-feature (used by composition layer in app/)
export { useCalendarData } from './components/controller/hooks/useCalendarData';
export { useCalendarHandlers } from './components/controller/hooks/useCalendarHandlers';
export { useCalendarNavigationHandlers } from './components/controller/hooks/useCalendarNavigationHandlers';
export { useCalendarPlanKeyboard } from './hooks/useCalendarPlanKeyboard';
export { usePlanContextActions } from './hooks/usePlanContextActions';
export { usePlanOperations } from './hooks/usePlanOperations';
export { useRecurringPlanDrag } from './hooks/useRecurringPlanDrag';
export { useWeekendToggleShortcut } from './hooks/useWeekendToggleShortcut';

// =============================================================================
// Lib / Utils
// =============================================================================
export { isCalendarViewPath } from './lib/route-utils';
export { calculateViewDateRange, getNextPeriod, getPreviousPeriod } from './lib/view-helpers';
export {
  formatDateString,
  localTimeToUTCISO,
  parseDateString,
  parseDatetimeString,
  parseISOToUserTimezone,
} from './utils/dateUtils';
export { getEventType, isRecordEvent } from './utils/planDataAdapter';

// =============================================================================
// Grid Constants (used by settings feature)
// =============================================================================
export {
  HOUR_HEIGHT,
  HOUR_HEIGHT_DENSITIES,
} from './components/views/shared/constants/grid.constants';
export type { HourHeightDensity } from './components/views/shared/constants/grid.constants';
