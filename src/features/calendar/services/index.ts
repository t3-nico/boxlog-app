// Calendar Services Export
export { calendarService, CalendarService } from './calendar-service'
export { eventService, EventService } from './event-service'

// Re-export types for convenience
export type {
  Calendar,
  CreateCalendarInput,
  UpdateCalendarInput,
  CalendarShare,
  CalendarShareInput,
  CalendarViewState,
  ExtendedEvent,
  CreateEventInput,
  UpdateEventInput,
  RecurrencePattern,
  EventInstance,
  CalendarFilter
} from '../types/calendar.types'