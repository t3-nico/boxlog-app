/**
 * Entry Feature - Public API
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
} from './types/entry';

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
export { useEntry, usePlan, useplan } from './hooks/useEntry';

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
export { EntryDeleteConfirmDialog } from './components/EntryDeleteConfirmDialog';
export { EntryInspector } from './components/inspector/EntryInspector';
export { RecurringEditConfirmDialog } from './components/RecurringEditConfirmDialog';
export type { RecurringEditScope } from './components/RecurringEditConfirmDialog';
export { EntryCreateTrigger } from './components/shared/EntryCreateTrigger';
export { LoadingState } from './components/shared/LoadingState';

// Inspector hooks
export { useInspectorKeyboard } from './components/inspector/hooks';
