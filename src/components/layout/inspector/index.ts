// Inspector core components - avoiding circular import
export { InspectorContent } from './inspector-content'

// Inspector stores
export { useInspectorStore } from './stores/inspector.store'

// Inspector hooks for CreateEvent integration
export { useCreateEventInspector } from './hooks/useCreateEventInspector'
export { useCreateEventInspectorShortcuts } from './hooks/useCreateEventInspectorShortcuts'

// Inspector content components
export { CreateEventInspectorContent } from './content/CreateEventInspectorContent'
export { CalendarInspectorContent } from './content/CalendarInspectorContent'
export { TaskInspectorContent } from './content/TaskInspectorContent'
export { DefaultInspectorContent } from './content/DefaultInspectorContent'