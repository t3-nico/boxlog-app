import { createCacheStore } from '@/stores/createCacheStore';

import type { FulfillmentScore, RecurrenceType } from '@/types/entry';

/**
 * Entry キャッシュデータ型（Plan + Record 統合）
 */
interface EntryCache {
  recurrence_type?: RecurrenceType | null;
  recurrence_rule?: string | null;
  fulfillment_score?: FulfillmentScore | null;
  description?: string | null;
  tagIds?: string[];
}

/**
 * Entry キャッシュストア
 *
 * 用途:
 * - recurrence_type / recurrence_rule の即座の同期
 * - fulfillment_score / description の即座の同期
 * - Card、Inspector、Tableが同時に開いている場合の状態管理
 * - mutation実行中フラグ管理（Realtimeプラン二重更新防止）
 */
export const useEntryCacheStore = createCacheStore<EntryCache>();
