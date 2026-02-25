/**
 * Plans Feature - Public API
 *
 * この barrel export は外部から参照される公開インターフェースを定義する。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Types
// =============================================================================
export type {
  CreatePlanInput,
  Plan,
  PlanFilters,
  PlanStats,
  PlanStatus,
  PlanWithTags,
  RecurrenceConfig,
  RecurrenceType,
  UpdatePlanInput,
} from './types/plan';

export type { CreateTagInput, Tag, UpdateTagInput } from './types/tag';

export type {
  ActivityActionType,
  ActivityIconColor,
  PlanActivity,
  PlanActivityDisplay,
} from './types/activity';

// =============================================================================
// Stores
// =============================================================================
export { useDeleteConfirmStore } from './stores/useDeleteConfirmStore';
export { usePlanCacheStore, useplanCacheStore } from './stores/usePlanCacheStore';
export { usePlanClipboardStore } from './stores/usePlanClipboardStore';
export type { ClipboardPlan, LastClickedPosition } from './stores/usePlanClipboardStore';
export { usePlanInspectorStore } from './stores/usePlanInspectorStore';
export type {
  CreateEntryType,
  DraftPlan,
  PendingChanges,
  PlanInitialData,
} from './stores/usePlanInspectorStore';
export { useRecurringEditConfirmStore } from './stores/useRecurringEditConfirmStore';

// =============================================================================
// Hooks
// =============================================================================
export { usePlan, useplan } from './hooks/usePlan';
export { usePlanActivities } from './hooks/usePlanActivities';
export {
  instancesToExceptionsMap,
  usePlanInstanceMutations,
  usePlanInstances,
} from './hooks/usePlanInstances';
export { usePlanMutations } from './hooks/usePlanMutations';
export { usePlanRealtime } from './hooks/usePlanRealtime';
export { usePlans, useplans } from './hooks/usePlans';
export { usePlanTags } from './hooks/usePlanTags';
export { useRecurringScopeMutations } from './hooks/useRecurringScopeMutations';

// =============================================================================
// Utils
// =============================================================================
export { expandRecurrence, getPlanRecurrenceConfig, isRecurringPlan } from './utils/recurrence';
export type { ExpandedOccurrence, PlanInstanceException } from './utils/recurrence';

export { decodeInstanceId, encodeInstanceId, getInstanceRef } from './utils/instanceId';
export type { RecurrenceInstanceRef } from './utils/instanceId';

export { isOverdue, isScheduled, normalizeStatus } from './utils/status';

export { groupItems } from './utils/grouping';
export type { GroupByField, GroupedData } from './utils/grouping';

// =============================================================================
// Components
// =============================================================================
export { PlanInspector } from './components/inspector/PlanInspector';
export { PlanDeleteConfirmDialog } from './components/PlanDeleteConfirmDialog';
export { RecurringEditConfirmDialog } from './components/RecurringEditConfirmDialog';
export type { RecurringEditScope } from './components/RecurringEditConfirmDialog';
export { LoadingState } from './components/shared/LoadingState';
export { PlanCreateTrigger } from './components/shared/PlanCreateTrigger';
export {
  RecurringIndicator,
  RecurringIndicatorFromFlag,
} from './components/shared/RecurringIndicator';
export type {
  RecurringIndicatorProps,
  RecurringIndicatorSize,
} from './components/shared/RecurringIndicator';
export { ReminderSelect } from './components/shared/ReminderSelect';
export { TimeSelect } from './components/shared/TimeSelect';

// Inspector shared components (used by records feature)
export { useInspectorKeyboard } from './components/inspector/hooks';
export {
  ActivityPopover,
  DraggableInspector,
  InspectorContent,
  InspectorDetailsLayout,
  InspectorHeader,
  InspectorShell,
  NoteIconButton,
  TitleInput,
  useDragHandle,
} from './components/inspector/shared';
export type {
  ActivityDisplayItem,
  ActivityIconColor as ActivityIconColorType,
} from './components/inspector/shared';

// =============================================================================
// Adapters
// =============================================================================
export {
  expandRecurringPlansToCalendarPlans,
  planToCalendarPlan,
  plansToCalendarPlans,
} from './adapters/toCalendarEvent';
