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
  CreateEntryInput,
  Entry,
  EntryFilters,
  EntryOrigin,
  EntryWithTags,
  FulfillmentScore,
  RecurrenceConfig,
  RecurrenceType,
  UpdateEntryInput,
} from './types/entry';

// =============================================================================
// Stores (Re-export from shared stores)
// =============================================================================
export { useEntryCacheStore } from '@/stores/useEntryCacheStore';
export { useEntryClipboardStore } from '@/stores/useEntryClipboardStore';
export type { ClipboardEntry, LastClickedPosition } from '@/stores/useEntryClipboardStore';
export { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
export type { PendingChanges } from '@/stores/useEntryInspectorStore';

// =============================================================================
// Hooks
// =============================================================================
export { useEntries } from '@/hooks/useEntries';
export {
  instancesToExceptionsMap,
  useEntryInstanceMutations,
  useEntryInstances,
} from '@/hooks/useEntryInstances';
export { useEntryMutations } from '@/hooks/useEntryMutations';
export { useEntryTags } from '@/hooks/useEntryTags';
export { useRecurringScopeMutations } from '@/hooks/useRecurringScopeMutations';
export { useEntry, usePlan, useplan } from './hooks/useEntry';

// =============================================================================
// Utils
// =============================================================================
export {
  expandRecurrence,
  getEntryRecurrenceConfig,
  isRecurringEntry,
} from '@/lib/entry-recurrence';
export type { EntryInstanceException, ExpandedOccurrence } from '@/lib/entry-recurrence';

export { decodeInstanceId, encodeInstanceId, getInstanceRef } from '@/lib/instance-id';
export type { RecurrenceInstanceRef } from '@/lib/instance-id';

export { groupItems } from '@/lib/entry-grouping';
export type { GroupByField, GroupedData } from '@/lib/entry-grouping';

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
