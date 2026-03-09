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
export type { PendingChanges } from '@/stores/useEntryInspectorStore';
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

export { decodeInstanceId, encodeInstanceId, getInstanceRef } from '@/lib/instance-id';
export type { RecurrenceInstanceRef } from '@/lib/instance-id';

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

// Inspector hooks
export { useInspectorKeyboard } from './components/inspector/hooks';
