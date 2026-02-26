/**
 * Re-export from shared lib for backward compatibility
 * 実体は @/lib/instance-id に移動済み
 */
export { decodeInstanceId, encodeInstanceId, getInstanceRef } from '@/lib/instance-id';
export type { RecurrenceInstanceRef } from '@/lib/instance-id';
