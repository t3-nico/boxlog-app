/**
 * Re-export from shared stores for backward compatibility
 * 実体は @/stores/useRecordFilterStore に移動済み
 */
export { useRecordFilterStore } from '@/stores/useRecordFilterStore';
export type {
  DateRangeFilter,
  DurationFilter,
  FulfillmentFilter,
  WorkedAtFilter,
} from '@/stores/useRecordFilterStore';
