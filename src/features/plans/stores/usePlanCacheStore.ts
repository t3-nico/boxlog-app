import { createCacheStore } from '@/stores/createCacheStore';

/**
 * Plan キャッシュデータ型
 */
interface PlanCache {
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;
  recurrence_rule?: string | null;
}

/**
 * Plan キャッシュストア
 *
 * 用途:
 * - recurrence_type / recurrence_rule の即座の同期
 * - Card、Inspector、Tableが同時に開いている場合の状態管理
 * - mutation実行中フラグ管理（Realtimeプラン二重更新防止）
 */
export const usePlanCacheStore = createCacheStore<PlanCache>();

// Backward compatibility
export { usePlanCacheStore as useplanCacheStore };
