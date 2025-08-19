// Event Feature Exports

// Components
export * from './components'

// Types
export * from './types/events'

// Store
export { useEventStore, eventSelectors, initializeEventStore } from './stores/useEventStore'

// Hooks
export {
  // Event CRUD
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  
  // Recurring events
  useCreateRecurrencePattern,
  useUpdateRecurrencePattern,
  useDeleteRecurrencePattern,
  useRecurringEventInstances,
  useCreateEventInstance,
  useUpdateEventInstance,
  
  // Complex hooks
  useEventManagement,
  
  // Utility hooks
  useEventsByDate,
  useEventsByTimeSlot,
  useEventConflicts,
  
  // Actions
  useEventStatusActions,
  useEventDragAndDrop
} from './hooks/use-events'