// Main Calendar Entry Point
export { CalendarController } from './components/CalendarController';

// Calendar Components
export * from './components';

// Calendar Types (only export types not already exported from components)
export type {
  Calendar,
  CalendarEvent,
  CalendarFilter,
  CalendarHeaderProps,
  CalendarShare,
  CalendarShareInput,
  CalendarTicket,
  CalendarViewProps,
  CalendarViewState,
  CreateCalendarInput,
  CreateEventInput,
  CreatePlanInput,
  CreateTicketInput,
  EventInstance,
  PlanInstance,
  RecurrencePattern,
  TicketInstance,
  UpdateCalendarInput,
  UpdateEventInput,
  UpdatePlanInput,
  UpdateTicketInput,
  ViewSelectorProps,
} from './types/calendar.types';

// Calendar Utils/Lib (excluding conflicting exports)
export { calculateViewDateRange, getNextPeriod, getPreviousPeriod } from './lib/view-helpers';
