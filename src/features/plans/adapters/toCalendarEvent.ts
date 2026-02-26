/**
 * Re-export from shared lib for backward compatibility
 * 実体は @/lib/plan-adapter に移動済み
 */
export {
  expandRecurringPlansToCalendarPlans,
  planToCalendarPlan,
  plansToCalendarPlans,
} from '@/lib/plan-adapter';
export type { ExpandedOccurrence, PlanInstanceException } from '@/lib/plan-adapter';
