/**
 * Re-export from shared hooks for backward compatibility
 * 実体は @/hooks/useRecordData に移動済み
 */
export {
  matchesDurationFilter,
  matchesFulfillmentFilter,
  useRecentRecords,
  useRecordData,
} from '@/hooks/useRecordData';
export type {
  ApiSortField,
  RecordFilters,
  RecordItem,
  RecordSortField,
  RecordSortOptions,
} from '@/hooks/useRecordData';
