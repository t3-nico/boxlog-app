import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { eventService } from '../services/event-service' // Removed - using localStorage via useEventStore
import type {
  ExtendedEvent,
  CreateEventInput,
  UpdateEventInput,
  CalendarFilter,
  RecurrencePattern,
  EventInstance
} from '../types/calendar.types'

// ========================================
// Event Management Hooks
// ========================================

export function useEvents(filter: CalendarFilter) {
  // NOTE: Events are now managed by useEventStore (localStorage)
  return useQuery({
    queryKey: ['events', filter],
    queryFn: () => Promise.resolve([]), // Temporary stub - use useEventStore instead
    enabled: !!(filter.startDate && filter.endDate)
  })
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => Promise.resolve(null), // Temporary stub - use useEventStore instead
    enabled: !!eventId
  })
}

export function useCreateEvent(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      Promise.resolve({} as ExtendedEvent), // Temporary stub - use useEventStore instead
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: UpdateEventInput }) =>
      Promise.resolve({} as ExtendedEvent), // Temporary stub - use useEventStore instead
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      // queryClient.invalidateQueries({ queryKey: ['event', event.id] })
    }
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => Promise.resolve(), // Temporary stub - use useEventStore instead
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.removeQueries({ queryKey: ['event', eventId] })
    }
  })
}

// ========================================
// Recurring Event Hooks (Disabled - localStorage doesn't support advanced recurrence)
// ========================================

export function useCreateRecurrencePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, pattern }: {
      eventId: string
      pattern: Omit<RecurrencePattern, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>
    }) => Promise.resolve({} as RecurrencePattern), // Temporary stub
    onSuccess: (pattern) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      // queryClient.invalidateQueries({ queryKey: ['event', pattern.eventId] })
    }
  })
}

export function useUpdateRecurrencePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patternId, updates }: {
      patternId: string
      updates: Partial<RecurrencePattern>
    }) => Promise.resolve({} as RecurrencePattern), // Temporary stub
    onSuccess: (pattern) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      // queryClient.invalidateQueries({ queryKey: ['event', pattern.eventId] })
    }
  })
}

export function useDeleteRecurrencePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => Promise.resolve(), // Temporary stub
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    }
  })
}

export function useRecurringEventInstances(filter: CalendarFilter) {
  return useQuery({
    queryKey: ['recurring-instances', filter],
    queryFn: () => Promise.resolve([]), // Temporary stub
    enabled: !!(filter.startDate && filter.endDate && filter.includeRecurring)
  })
}

export function useCreateEventInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, date, duration }: {
      eventId: string
      date: Date
      duration: number
    }) => Promise.resolve({} as EventInstance), // Temporary stub
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-instances'] })
    }
  })
}

export function useUpdateEventInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ instanceId, overrides }: {
      instanceId: string
      overrides: Partial<ExtendedEvent>
    }) => Promise.resolve({} as EventInstance), // Temporary stub
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-instances'] })
    }
  })
}

// ========================================
// 複合Hooks（イベント管理全般）
// ========================================

export function useEventManagement(userId: string, filter: CalendarFilter) {
  const { data: events, isLoading: eventsLoading } = useEvents(filter)
  const { data: recurringInstances, isLoading: recurringLoading } = useRecurringEventInstances(filter)
  
  const createEvent = useCreateEvent(userId)
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  
  const createRecurrence = useCreateRecurrencePattern()
  const updateRecurrence = useUpdateRecurrencePattern()
  const deleteRecurrence = useDeleteRecurrencePattern()

  // すべてのイベント（通常＋繰り返し）を統合
  const allEvents = [
    ...(events || []),
    ...(recurringInstances || [])
  ].sort((a, b) => a.displayStartDate.getTime() - b.displayStartDate.getTime())

  return {
    // Data
    events: allEvents,
    regularEvents: events,
    recurringInstances,
    
    // Loading states
    isLoading: eventsLoading || recurringLoading,
    
    // Actions
    createEvent: createEvent.mutate,
    updateEvent: updateEvent.mutate,
    deleteEvent: deleteEvent.mutate,
    createRecurrence: createRecurrence.mutate,
    updateRecurrence: updateRecurrence.mutate,
    deleteRecurrence: deleteRecurrence.mutate,
    
    // Status
    isCreating: createEvent.isPending,
    isUpdating: updateEvent.isPending,
    isDeleting: deleteEvent.isPending
  }
}

// ========================================
// 特殊用途のHooks
// ========================================

export function useEventsByDate(events: ExtendedEvent[], targetDate: Date) {
  const targetDateStr = targetDate.toDateString()
  
  return events.filter(event => {
    const eventDate = event.displayStartDate.toDateString()
    const eventEndDate = event.displayEndDate?.toDateString()
    
    // 単日イベント
    if (!event.isMultiDay) {
      return eventDate === targetDateStr
    }
    
    // 複数日イベント
    if (eventEndDate && event.displayEndDate) {
      return targetDate >= event.displayStartDate && targetDate <= event.displayEndDate
    }
    
    return eventDate === targetDateStr
  })
}

export function useEventsByTimeSlot(events: ExtendedEvent[], startTime: Date, endTime: Date) {
  return events.filter(event => {
    // 全日イベントは除外
    if (event.allDay) return false
    
    const eventStart = event.displayStartDate.getTime()
    const eventEnd = event.displayEndDate?.getTime() || eventStart
    const slotStart = startTime.getTime()
    const slotEnd = endTime.getTime()
    
    // イベントが時間枠と重複しているかチェック
    return eventStart < slotEnd && eventEnd > slotStart
  })
}

export function useEventConflicts(events: ExtendedEvent[], targetEvent: ExtendedEvent) {
  return events.filter(event => {
    // 自分自身は除外
    if (event.id === targetEvent.id) return false
    
    // 全日イベントは除外
    if (event.allDay || targetEvent.allDay) return false
    
    const eventStart = event.displayStartDate.getTime()
    const eventEnd = event.displayEndDate?.getTime() || eventStart
    const targetStart = targetEvent.displayStartDate.getTime()
    const targetEnd = targetEvent.displayEndDate?.getTime() || targetStart
    
    // 時間が重複しているかチェック
    return eventStart < targetEnd && eventEnd > targetStart
  })
}

// ========================================
// Event Status Management
// ========================================

export function useEventStatusActions() {
  const updateEvent = useUpdateEvent()
  
  const markAsPlanned = (eventId: string) => {
    updateEvent.mutate({
      eventId,
      input: { id: eventId, status: 'planned' }
    })
  }
  
  const markAsInProgress = (eventId: string) => {
    updateEvent.mutate({
      eventId,
      input: { id: eventId, status: 'in_progress' }
    })
  }
  
  const markAsCompleted = (eventId: string) => {
    updateEvent.mutate({
      eventId,
      input: { id: eventId, status: 'completed' }
    })
  }
  
  const markAsCancelled = (eventId: string) => {
    updateEvent.mutate({
      eventId,
      input: { id: eventId, status: 'cancelled' }
    })
  }
  
  const moveToInbox = (eventId: string) => {
    updateEvent.mutate({
      eventId,
      input: { id: eventId, status: 'inbox' }
    })
  }

  return {
    markAsPlanned,
    markAsInProgress,
    markAsCompleted,
    markAsCancelled,
    moveToInbox,
    isUpdating: updateEvent.isPending
  }
}

// ========================================
// Drag & Drop Support
// ========================================

export function useEventDragAndDrop() {
  const updateEvent = useUpdateEvent()
  
  const moveEvent = (eventId: string, newStartDate: Date, duration: number) => {
    const newEndDate = new Date(newStartDate.getTime() + duration * 60 * 1000)
    
    updateEvent.mutate({
      eventId,
      input: {
        id: eventId,
        plannedStart: newStartDate,
        plannedEnd: newEndDate
      }
    })
  }
  
  const resizeEvent = (eventId: string, startDate: Date, endDate: Date) => {
    updateEvent.mutate({
      eventId,
      input: {
        id: eventId,
        plannedStart: startDate,
        plannedEnd: endDate
      }
    })
  }

  return {
    moveEvent,
    resizeEvent,
    isMoving: updateEvent.isPending
  }
}