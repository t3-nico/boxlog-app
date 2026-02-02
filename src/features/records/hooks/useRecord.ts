import { cacheStrategies } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';

/**
 * 単一レコード取得フック
 * @description tRPC Query を使用してレコードを ID で取得
 * @param id - レコードID
 * @param options - オプション（includePlan: true で紐づくPlanも取得）
 *
 * @remarks
 * リアルタイム性を重視した設定（業界標準準拠）:
 * - staleTime: 5分 → Realtime購読で更新されるため長めでOK
 * - refetchOnWindowFocus: true（グローバル設定で有効）→ staleなデータのみ再フェッチ
 * - gcTime: 10分 → メモリからの削除は遅らせてローディング状態を回避
 * - placeholderData: records.list キャッシュから即座にデータを表示（UX大幅向上）
 *
 * @see {@link cacheStrategies.records} - realtimeCache設定を使用
 */
export function useRecord(id: string, options?: { includePlan?: boolean; enabled?: boolean }) {
  const utils = api.useUtils();

  return api.records.getById.useQuery(
    {
      id,
      include: options?.includePlan ? { plan: true } : undefined,
    },
    {
      ...cacheStrategies.records, // staleTime: 5分, gcTime: 10分
      retry: 1,
      enabled: options?.enabled ?? true,
      // records.list キャッシュからプレースホルダーデータを即座に表示
      // これによりローディング状態をスキップし、UXが大幅に向上
      placeholderData: () => {
        // 全ての records.list キャッシュを検索してレコードを見つける
        const listData = utils.records.list.getData();
        if (listData) {
          const found = listData.find((r) => r.id === id);
          if (found) {
            // records.list の型を getById の戻り型に合わせる
            return found as ReturnType<typeof utils.records.getById.getData>;
          }
        }
        return undefined;
      },
    },
  );
}
