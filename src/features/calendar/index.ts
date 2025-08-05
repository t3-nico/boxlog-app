// Main Calendar Entry Point
export { CalendarView } from './components/CalendarView'

// Calendar Components
export * from './components'

// Calendar Types
export * from './types/calendar.types'

// Calendar Constants
export { HOUR_HEIGHT, MINUTE_HEIGHT as CALENDAR_MINUTE_HEIGHT, BUSINESS_HOURS as CALENDAR_BUSINESS_HOURS } from './constants/calendar-constants'

// Calendar Hooks
export * from './hooks'

// Calendar Utils/Lib (excluding conflicting exports)
export { calculateViewDateRange, getNextPeriod, getPreviousPeriod, filterTasksForDateRange } from './lib/view-helpers'
export { isValidViewType } from './lib/calendar-helpers'