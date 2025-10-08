// Inspector core components - avoiding circular import
export { InspectorContent } from './inspector-content'

// Inspector stores
export { useInspectorStore } from '@/features/inspector/stores/inspector.store'

// Inspector hooks for CreateEvent integration
export { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'
export { useCreateEventInspectorShortcuts } from '@/features/inspector/hooks/useCreateEventInspectorShortcuts'

// Inspector content components
export { EventDetailInspectorContent } from '@/features/events/components/inspector/EventDetailInspectorContent'
export { CalendarInspectorContent } from './content/CalendarInspectorContent'
export { DefaultInspectorContent } from './content/DefaultInspectorContent'
export { TaskInspectorContent } from './content/TaskInspectorContent'
