// Common components for calendar
export * from './accessibility'
export * from './performance'

// Virtualization components (moved from calendar-grid)
export { VirtualCalendarGrid } from './virtualization/VirtualCalendarGrid'

// MiniCalendar component (moved from layout/Sidebar)
// Supports both direct display and Popover mode via asPopover prop
export { MiniCalendar } from './MiniCalendar'
export type { MiniCalendarProps } from './MiniCalendar'
