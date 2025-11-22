// Inspector Components
export { PlanInspector } from './inspector/PlanInspector'
/** @deprecated Use PlanInspector instead */
export { PlanInspector as TicketInspector } from './inspector/PlanInspector'

// Display Components
export { PlanCard } from './display/PlanCard'
export { PlanStatusBadge } from './display/PlanStatusBadge'

// Filter Components (renamed to avoid conflict with PlanFilters type)
export { PlanFilters as PlanFiltersComponent } from './filters/PlanFilters'

// Shared Components
export { EmptyState } from './shared/EmptyState'
export { LoadingState } from './shared/LoadingState'
export { PlanCreatePopover } from './shared/PlanCreatePopover'
/** @deprecated Use PlanCreatePopover instead */
export { PlanCreatePopover as TicketCreatePopover } from './shared/PlanCreatePopover'
