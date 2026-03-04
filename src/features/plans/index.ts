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

// =============================================================================
// Stores (Re-export from shared stores)
// =============================================================================
export { useEntryCacheStore } from '@/stores/useEntryCacheStore';
export { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
export type { DraftEntry, EntryInitialData, PendingChanges } from '@/stores/useEntryInspectorStore';
export { usePlanClipboardStore } from '@/stores/usePlanClipboardStore';
export type { ClipboardPlan, LastClickedPosition } from '@/stores/usePlanClipboardStore';

// =============================================================================
// Hooks
// =============================================================================
export { useEntries } from '@/hooks/useEntries';
export { useEntryMutations } from '@/hooks/useEntryMutations';
export {
  instancesToExceptionsMap,
  usePlanInstanceMutations,
  usePlanInstances,
} from '@/hooks/usePlanInstances';
export { usePlanTags } from '@/hooks/usePlanTags';
export { useRecurringScopeMutations } from '@/hooks/useRecurringScopeMutations';
export { usePlan, useplan } from './hooks/usePlan';

// =============================================================================
// Utils
// =============================================================================
export { expandRecurrence, getPlanRecurrenceConfig, isRecurringPlan } from '@/lib/plan-recurrence';
export type { ExpandedOccurrence, PlanInstanceException } from '@/lib/plan-recurrence';

export { decodeInstanceId, encodeInstanceId, getInstanceRef } from './utils/instanceId';
export type { RecurrenceInstanceRef } from './utils/instanceId';

export { groupItems } from '@/lib/plan-grouping';
export type { GroupByField, GroupedData } from '@/lib/plan-grouping';

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

// Inspector shared components
export { useInspectorKeyboard } from './components/inspector/hooks';
export {
  DraggableInspector,
  InspectorContent,
  InspectorDetailsLayout,
  InspectorHeader,
  InspectorShell,
  NoteIconButton,
  TitleInput,
  useDragHandle,
} from './components/inspector/shared';
