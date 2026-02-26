/**
 * Re-export from shared lib for backward compatibility
 * 実体は @/lib/record-adapter に移動済み
 */
export { recordToCalendarEvent, recordsToCalendarEvents } from '@/lib/record-adapter';
export type { RecordWithPlanInfo } from '@/lib/record-adapter';
