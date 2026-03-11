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
// Hooks (feature-internal)
// =============================================================================
export { useEntry, usePlan, useplan } from './hooks/useEntry';

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
