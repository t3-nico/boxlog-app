import { cacheStrategies } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';
import type { RecordFilter } from '@/schemas/records/record';

/**
 * レコード一覧取得フック
 * @description tRPC Query を使用してレコード一覧を取得
 * @param filters - フィルター条件（plan_id, worked_at_from, worked_at_to, sortBy, sortOrder, limit, offset）
 * @param options - React Query オプション
 *
 * @remarks
 * リアルタイム性を最優先した設定:
 * - staleTime: 5分 → Realtime購読で更新されるため、ページ遷移時の再フェッチを抑制
 * - refetchOnWindowFocus: true（グローバル設定で有効）→ タブ切り替え時に再フェッチ
 * - gcTime: 10分 → メモリからの削除は遅らせてローディング状態を回避
 *
 * @see {@link cacheStrategies.records} - realtimeCache設定を使用
 */
export function useRecords(filters?: Partial<RecordFilter>, options?: { enabled?: boolean }) {
  return api.records.list.useQuery(filters, {
    ...cacheStrategies.records, // staleTime: 5分, gcTime: 10分
    retry: 1,
    ...options,
  });
}
