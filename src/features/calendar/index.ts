// Main Calendar Entry Point
export { CalendarController } from './components/CalendarController'

// Calendar Components
export * from './components'

// Calendar Types (only export types not already exported from components)
export type {
  CalendarViewProps,
  CalendarHeaderProps,
  ViewSelectorProps,
  RecordAdjustments,
  RecordStats,
  Calendar,
  RecurrencePattern,
  PlanInstance,
  TicketInstance,
  EventInstance,
  CalendarShare,
  CalendarViewState,
  CreateCalendarInput,
  UpdateCalendarInput,
  CreatePlanInput,
  CreateTicketInput,
  CreateEventInput,
  UpdatePlanInput,
  UpdateTicketInput,
  UpdateEventInput,
  CalendarShareInput,
  CalendarFilter,
  CalendarTicket,
  CalendarEvent,
} from './types/calendar.types'

// Calendar Constants
export {
  BUSINESS_HOURS as CALENDAR_BUSINESS_HOURS,
  MINUTE_HEIGHT as CALENDAR_MINUTE_HEIGHT,
  HOUR_HEIGHT,
} from './constants/calendar-constants'

// Calendar Hooks
export * from './hooks'

// Calendar Utils/Lib (excluding conflicting exports)
export { isValidViewType } from './lib/calendar-helpers'
export { calculateViewDateRange, filterTasksForDateRange, getNextPeriod, getPreviousPeriod } from './lib/view-helpers'
