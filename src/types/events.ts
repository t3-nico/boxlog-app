// Event types for calendar functionality

export type EventType = 'event' | 'task' | 'reminder'
export type EventStatus = 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
export type EventPriority = 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional'

// Legacy status for backward compatibility
export type LegacyEventStatus = 'confirmed' | 'tentative' | 'cancelled'

// Recurrence pattern types
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval?: number // every N days/weeks/months/years
  endDate?: string // ISO date string
  count?: number // number of occurrences
  weekDays?: WeekDay[] // for weekly recurrence
  monthDay?: number // for monthly recurrence (1-31)
  monthWeek?: number // for monthly recurrence (1-5, week of month)
  monthWeekDay?: WeekDay // for monthly recurrence (day of week)
}

// Checklist item interface
export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  duration?: number // minutes
  created_at?: string
}

// Database entity types (matches database schema)
export interface EventEntity {
  id: string
  user_id: string
  title: string
  description?: string
  planned_start?: string // TIMESTAMPTZ format
  planned_end?: string // TIMESTAMPTZ format
  event_type: EventType
  status: EventStatus
  priority?: EventPriority
  color: string
  is_recurring?: boolean
  recurrence_rule?: any // JSONB
  parent_event_id?: string
  items?: ChecklistItem[] // JSONB array
  location?: string
  url?: string
  created_at: string
  updated_at: string
  event_tags?: Array<{
    tag_id: string
    tags: {
      id: string
      name: string
      color: string
      icon?: string
      parent_id?: string
    }
  }>
}

export interface EventTagEntity {
  id: string
  event_id: string
  tag_id: string
  created_at: string
}

// Client-side types (for frontend components)
export interface Event {
  id: string
  title: string
  description?: string
  startDate?: Date
  endDate?: Date
  type: EventType
  status: EventStatus
  priority?: EventPriority
  color: string
  isRecurring?: boolean
  recurrenceRule?: any
  parentEventId?: string
  items?: ChecklistItem[]
  location?: string
  url?: string
  tags?: Array<{
    id: string
    name: string
    color: string
    icon?: string
    parent_id?: string
  }>
  createdAt: Date
  updatedAt: Date
}

// Form types for creating/editing events
export interface CreateEventRequest {
  title: string
  description?: string
  startDate?: Date
  endDate?: Date
  type?: EventType
  status?: EventStatus
  priority?: EventPriority
  color?: string
  isRecurring?: boolean
  recurrenceRule?: any
  parentEventId?: string
  items?: ChecklistItem[]
  location?: string
  url?: string
  tagIds?: string[]
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
}

// Calendar display types
export interface CalendarEvent extends Event {
  // Additional computed properties for calendar display
  displayStartDate: Date
  displayEndDate: Date
  duration: number // in minutes
  isMultiDay: boolean
  isRecurring: boolean
}

// Event filtering and search types
export interface EventFilters {
  startDate?: Date
  endDate?: Date
  types?: EventType[]
  statuses?: EventStatus[]
  tagIds?: string[]
  searchQuery?: string
}

// Event view types for different calendar views
export interface EventsByDate {
  [dateKey: string]: CalendarEvent[] // dateKey format: YYYY-MM-DD
}

export interface EventsGroupedByType {
  events: CalendarEvent[]
  tasks: CalendarEvent[]
  reminders: CalendarEvent[]
}

// API response types
export interface EventsResponse {
  events: EventEntity[]
  total: number
  hasMore?: boolean
}

export interface EventResponse {
  event: EventEntity
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
}

// Store types for state management
export interface EventState {
  events: Event[]
  loading: boolean
  error: string | null
  filters: EventFilters
  selectedEventId: string | null
}

export interface EventActions {
  // Event CRUD operations
  fetchEvents: (filters?: EventFilters) => Promise<void>
  createEvent: (event: CreateEventRequest) => Promise<Event>
  updateEvent: (event: UpdateEventRequest) => Promise<Event>
  deleteEvent: (eventId: string) => Promise<void>
  
  // Event selection and filtering
  selectEvent: (eventId: string | null) => void
  setFilters: (filters: Partial<EventFilters>) => void
  clearFilters: () => void
  
  // Utility actions
  getEventsByDateRange: (startDate: Date, endDate: Date) => Event[]
  getEventsGroupedByType: () => EventsGroupedByType
  clearError: () => void
}

// Utility types for event operations
export interface EventConflict {
  eventId: string
  conflictingEventId: string
  overlapStart: Date
  overlapEnd: Date
}

export interface EventValidationError {
  field: keyof CreateEventRequest
  message: string
}

// Integration types with existing Task system
export interface TaskToEventMigration {
  taskId: string
  eventData: CreateEventRequest
}

// Export combined store type
export type EventStore = EventState & EventActions