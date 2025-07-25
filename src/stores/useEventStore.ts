import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Event, 
  EventEntity, 
  EventFilters, 
  EventStore,
  CreateEventRequest,
  UpdateEventRequest,
  EventsByDate,
  EventsGroupedByType,
  CalendarEvent
} from '@/types/events'

// Utility functions
const convertEntityToEvent = (entity: EventEntity): Event => {
  console.log('🔍 Converting entity:', entity)
  
  // planned_startとplanned_endを使用
  let startDate: Date | undefined
  let endDate: Date | undefined
  
  if (entity.planned_start) {
    startDate = new Date(entity.planned_start)
    console.log('📅 Created startDate:', startDate, 'from', entity.planned_start)
  }
  
  if (entity.planned_end) {
    endDate = new Date(entity.planned_end)
    console.log('📅 Created endDate:', endDate, 'from', entity.planned_end)
  }

  // Convert tag data from entity format
  const tags: any[] = entity.event_tags?.map(eventTag => eventTag.tags).filter(Boolean) || []

  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    startDate,
    endDate,
    status: entity.status,
    priority: entity.priority,
    color: entity.color,
    isRecurring: entity.is_recurring,
    recurrenceRule: entity.recurrence_rule,
    items: entity.items || [],
    location: entity.location,
    url: entity.url,
    tags,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
  }
}

const convertEventToCreateRequest = (event: Partial<Event>): CreateEventRequest => {
  return {
    title: event.title || '',
    description: event.description,
    startDate: event.startDate!,
    endDate: event.endDate,
    type: event.type,
    status: event.status,
    color: event.color,
    recurrencePattern: event.recurrencePattern,
    location: event.location,
    url: event.url,
    tagIds: event.tags?.map(tag => tag.id),
  }
}

const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

const formatTimeForAPI = (date: Date): string => {
  return date.toTimeString().split(' ')[0] // HH:MM:SS
}

// Initial state
const initialState = {
  events: [],
  loading: false,
  error: null,
  filters: {},
  selectedEventId: null,
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Event CRUD operations
      fetchEvents: async (filters?: EventFilters) => {
        set({ loading: true, error: null })
        
        try {
          const params = new URLSearchParams()
          
          if (filters?.startDate) {
            params.append('start_date', formatDateForAPI(filters.startDate))
          }
          if (filters?.endDate) {
            params.append('end_date', formatDateForAPI(filters.endDate))
          }
          if (filters?.types?.length) {
            filters.types.forEach(type => params.append('event_type', type))
          }
          if (filters?.statuses?.length) {
            filters.statuses.forEach(status => params.append('status', status))
          }
          if (filters?.tagIds?.length) {
            params.append('tag_ids', filters.tagIds.join(','))
          }
          if (filters?.searchQuery) {
            params.append('search', filters.searchQuery)
          }

          const response = await fetch(`/api/events?${params.toString()}`)
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to fetch events: ${response.status} ${errorText}`)
          }

          const data = await response.json()
          const events = data.events.map(convertEntityToEvent)
          set({ events, loading: false, filters: filters || {} })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
        }
      },

      createEvent: async (eventData: CreateEventRequest) => {
        set({ loading: true, error: null })
        
        try {
          const apiData = {
            title: eventData.title,
            description: eventData.description,
            start_date: formatDateForAPI(eventData.startDate),
            start_time: formatTimeForAPI(eventData.startDate),
            end_date: eventData.endDate ? formatDateForAPI(eventData.endDate) : undefined,
            end_time: eventData.endDate ? formatTimeForAPI(eventData.endDate) : undefined,
            event_type: eventData.type || 'event',
            status: eventData.status || 'confirmed',
            color: eventData.color || '#3b82f6',
            recurrence_pattern: eventData.recurrencePattern,
            location: eventData.location,
            url: eventData.url,
            tag_ids: eventData.tagIds || [],
          }

          const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
          })

          if (!response.ok) {
            throw new Error('Failed to create event')
          }

          const entity = await response.json()
          const newEvent = convertEntityToEvent(entity)

          set(state => ({
            events: [...state.events, newEvent],
            loading: false,
          }))

          return newEvent
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
          throw error
        }
      },

      updateEvent: async (eventData: UpdateEventRequest) => {
        set({ loading: true, error: null })
        
        try {
          const apiData: any = {
            title: eventData.title,
            description: eventData.description,
          }

          if (eventData.startDate) {
            apiData.start_date = formatDateForAPI(eventData.startDate)
            apiData.start_time = formatTimeForAPI(eventData.startDate)
          }

          if (eventData.endDate) {
            apiData.end_date = formatDateForAPI(eventData.endDate)
            apiData.end_time = formatTimeForAPI(eventData.endDate)
          }


          if (eventData.type) apiData.event_type = eventData.type
          if (eventData.status) apiData.status = eventData.status
          if (eventData.color) apiData.color = eventData.color
          if (eventData.recurrencePattern) apiData.recurrence_pattern = eventData.recurrencePattern
          if (eventData.location !== undefined) apiData.location = eventData.location
          if (eventData.url !== undefined) apiData.url = eventData.url
          if (eventData.tagIds !== undefined) apiData.tag_ids = eventData.tagIds

          const response = await fetch(`/api/events/${eventData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
          })

          if (!response.ok) {
            throw new Error('Failed to update event')
          }

          const entity = await response.json()
          const updatedEvent = convertEntityToEvent(entity)

          set(state => ({
            events: state.events.map(event => 
              event.id === eventData.id ? updatedEvent : event
            ),
            loading: false,
          }))

          return updatedEvent
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
          throw error
        }
      },

      deleteEvent: async (eventId: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete event')
          }

          set(state => ({
            events: state.events.filter(event => event.id !== eventId),
            selectedEventId: state.selectedEventId === eventId ? null : state.selectedEventId,
            loading: false,
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
          throw error
        }
      },

      // Event selection and filtering
      selectEvent: (eventId: string | null) => {
        set({ selectedEventId: eventId })
      },

      setFilters: (filters: Partial<EventFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      // Utility actions
      getEventsByDateRange: (startDate: Date, endDate: Date) => {
        const { events } = get()
        return events.filter(event => {
          const eventStart = event.startDate
          const eventEnd = event.endDate || event.startDate
          
          return (eventStart >= startDate && eventStart <= endDate) ||
                 (eventEnd >= startDate && eventEnd <= endDate) ||
                 (eventStart <= startDate && eventEnd >= endDate)
        })
      },

      getEventsGroupedByType: () => {
        const { events } = get()
        const convertToCalendarEvent = (event: Event): CalendarEvent => ({
          ...event,
          displayStartDate: event.startDate,
          displayEndDate: event.endDate || event.startDate,
          duration: event.endDate 
            ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
            : 60, // Default to 1 hour for timed events
          isMultiDay: event.endDate ? 
            formatDateForAPI(event.startDate) !== formatDateForAPI(event.endDate) : false,
          isRecurring: !!event.recurrencePattern,
        })
        
        return {
          events: events.filter(e => e.type === 'event').map(convertToCalendarEvent),
          tasks: events.filter(e => e.type === 'task').map(convertToCalendarEvent),
          reminders: events.filter(e => e.type === 'reminder').map(convertToCalendarEvent),
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'event-store',
      partialize: (state) => ({
        filters: state.filters,
        selectedEventId: state.selectedEventId,
      }),
    }
  )
)

// Selector functions for performance optimization
export const eventSelectors = {
  // Basic selectors
  getEvents: (state: EventStore) => state.events,
  getLoading: (state: EventStore) => state.loading,
  getError: (state: EventStore) => state.error,
  getFilters: (state: EventStore) => state.filters,
  getSelectedEventId: (state: EventStore) => state.selectedEventId,
  
  // Computed selectors
  getSelectedEvent: (state: EventStore) => 
    state.selectedEventId ? state.events.find(e => e.id === state.selectedEventId) : null,
  
  getEventsByDate: (state: EventStore): EventsByDate => {
    const eventsByDate: EventsByDate = {}
    
    state.events.forEach(event => {
      const dateKey = formatDateForAPI(event.startDate)
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = []
      }
      
      // Convert to CalendarEvent
      const calendarEvent: CalendarEvent = {
        ...event,
        displayStartDate: event.startDate,
        displayEndDate: event.endDate || event.startDate,
        duration: event.endDate 
          ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
          : 60, // Default to 1 hour for timed events // Default to 1 hour for timed events, full day for all-day
        isMultiDay: event.endDate ? 
          formatDateForAPI(event.startDate) !== formatDateForAPI(event.endDate) : false,
        isRecurring: !!event.recurrencePattern,
      }
      
      eventsByDate[dateKey].push(calendarEvent)
    })
    
    // Sort events within each date
    Object.keys(eventsByDate).forEach(dateKey => {
      eventsByDate[dateKey].sort((a, b) => {
        return a.startDate.getTime() - b.startDate.getTime()
      })
    })
    
    return eventsByDate
  },
  
  getTodayEvents: (state: EventStore) => {
    const today = formatDateForAPI(new Date())
    const eventsByDate = eventSelectors.getEventsByDate(state)
    return eventsByDate[today] || []
  },
  
  getUpcomingEvents: (state: EventStore, days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return state.events.filter(event => 
      event.startDate >= now && event.startDate <= futureDate
    ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  },
}