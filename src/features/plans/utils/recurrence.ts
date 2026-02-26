/**
 * Re-export from shared lib for backward compatibility
 * 実体は @/lib/plan-recurrence に移動済み
 */
export { expandRecurrence, getPlanRecurrenceConfig, isRecurringPlan } from '@/lib/plan-recurrence';
export type { ExpandedOccurrence, PlanInstanceException } from '@/lib/plan-recurrence';
