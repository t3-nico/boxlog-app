/**
 * Re-export from shared stores for backward compatibility
 * 実体は @/stores/usePlanInspectorStore に移動済み
 */
export { usePlanInspectorStore } from '@/stores/usePlanInspectorStore';
export type {
  CreateEntryType,
  DraftPlan,
  PendingChanges,
  PlanInitialData,
} from '@/stores/usePlanInspectorStore';
