import { createCacheStore } from '@/stores/createCacheStore';

/**
 * Record キャッシュデータ型
 */
interface RecordCache {
  fulfillment_score?: number | null;
  description?: string | null;
  tagIds?: string[];
}

/**
 * Record キャッシュストア
 *
 * 用途:
 * - fulfillment_score / description の即座の同期
 * - Inspector、Table が同時に開いている場合の状態管理
 * - mutation 実行中フラグ管理（Realtime 二重更新防止）
 */
export const useRecordCacheStore = createCacheStore<RecordCache>();
