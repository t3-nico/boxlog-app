/**
 * Records Feature - Public API
 *
 * 作業ログ（Record）機能のエントリポイント。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Components
// =============================================================================
export { RecordInspector } from './components';

// =============================================================================
// Hooks
// =============================================================================
export { useRecentRecords, useRecordData, useRecordMutations, useRecords } from './hooks';
export type { RecordFilters, RecordItem, RecordSortField, RecordSortOptions } from './hooks';
export type { CreateRecordInput, UpdateRecordInput } from './hooks/useRecordMutations';

// =============================================================================
// Stores
// =============================================================================
export { useRecordCacheStore, useRecordFilterStore, useRecordInspectorStore } from './stores';
export type { DateRangeFilter, DurationFilter, FulfillmentFilter, WorkedAtFilter } from './stores';

// =============================================================================
// Types
// =============================================================================
export type { FulfillmentScore } from './types/record';

// =============================================================================
// Utils
// =============================================================================
export { groupRecordItems } from './utils/grouping';
export type { RecordGroupByField } from './utils/grouping';

// =============================================================================
// Adapters
// =============================================================================
export { recordToCalendarEvent, recordsToCalendarEvents } from './adapters/toCalendarEvent';
export type { RecordWithPlanInfo } from './adapters/toCalendarEvent';
