import { useQueryClient } from '@tanstack/react-query';

import { CACHE_2_MINUTES, CACHE_5_MINUTES } from '@/constants/time';
import { api } from '@/lib/trpc';

import type { PlanInstanceException } from '@/lib/plan-recurrence';

// entry_instances テーブルの行型
interface PlanInstance {
  entry_id: string;
  instance_date: string;
  exception_type: 'modified' | 'cancelled' | 'moved' | null;
  title: string | null;
  description: string | null;
  instance_start: string | null;
  instance_end: string | null;
  original_date: string | null;
}

/**
 * プランインスタンス（例外情報）取得フック
 *
 * @description 繰り返しプランの例外情報を取得
 * カレンダー表示時に、キャンセル/変更/移動された日を判定するために使用
 *
 * @param planIds - 対象プランIDの配列
 * @param options - 日付範囲とReact Queryオプション
 */
export function usePlanInstances(
  planIds: string[],
  options?: {
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    enabled?: boolean;
  },
) {
  const { startDate, endDate, enabled = true } = options ?? {};

  return api.entries.getInstances.useQuery(
    {
      entryIds: planIds,
      startDate,
      endDate,
    },
    {
      enabled: enabled && planIds.length > 0,
      staleTime: CACHE_2_MINUTES,
      gcTime: CACHE_5_MINUTES,
    },
  );
}

/**
 * 例外情報をMapに変換するユーティリティ
 *
 * @param instances - DBから取得した例外情報の配列
 * @returns planId -> exceptions[] のマップ
 */
export function instancesToExceptionsMap(
  instances: Array<{
    entry_id: string;
    instance_date: string;
    exception_type: string | null;
    title: string | null;
    description: string | null;
    instance_start: string | null;
    instance_end: string | null;
    original_date: string | null;
  }>,
): Map<string, PlanInstanceException[]> {
  const map = new Map<string, PlanInstanceException[]>();

  for (const instance of instances) {
    const exceptionType = instance.exception_type as 'modified' | 'cancelled' | 'moved' | null;
    const exception: PlanInstanceException = {
      instanceDate: instance.instance_date,
      exceptionType: exceptionType ?? undefined,
      title: instance.title ?? undefined,
      description: instance.description ?? undefined,
      instanceStart: instance.instance_start ?? undefined,
      instanceEnd: instance.instance_end ?? undefined,
      originalDate: instance.original_date ?? undefined,
    };

    const existing = map.get(instance.entry_id) ?? [];
    existing.push(exception);
    map.set(instance.entry_id, existing);
  }

  return map;
}

/**
 * プランインスタンス作成/削除mutation（楽観的更新付き）
 *
 * @description 繰り返しプランの例外（キャンセル/変更/移動）を作成・削除するmutation
 * 楽観的更新により、サーバーレスポンスを待たずに即座にUIが更新される
 */
export function usePlanInstanceMutations() {
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  // 例外作成（楽観的更新付き）
  const createInstance = api.entries.createInstance.useMutation({
    // 楽観的更新: 例外作成直後に即座にUIを更新
    onMutate: async (input) => {
      // 進行中のクエリをキャンセル
      await utils.entries.getInstances.cancel();

      // 一時的な例外を作成
      const tempInstance: PlanInstance = {
        entry_id: input.entryId,
        instance_date: input.instanceDate,
        exception_type: input.exceptionType,
        title: input.title ?? null,
        description: input.description ?? null,
        instance_start: input.instanceStart ?? null,
        instance_end: input.instanceEnd ?? null,
        original_date: input.originalDate ?? null,
      };

      // 該当planIdを含むすべてのキャッシュを楽観的に更新
      // getInstancesはplanIds[]をキーにするため、部分一致で更新が必要
      queryClient.setQueriesData<PlanInstance[]>(
        { queryKey: [['entries', 'getInstances']], exact: false },
        (oldData) => {
          if (!oldData) return oldData;
          // 既存の同一日付の例外があれば置換、なければ追加
          const filtered = oldData.filter(
            (inst) =>
              !(inst.entry_id === input.entryId && inst.instance_date === input.instanceDate),
          );
          return [...filtered, tempInstance];
        },
      );

      return { tempInstance };
    },
    onSuccess: () => {
      // サーバーからの実データで同期（IDなどが付与される可能性）
      void utils.entries.getInstances.invalidate();
      void utils.entries.list.invalidate();
    },
    onError: () => {
      // エラー時: ロールバック（invalidateで元の状態に戻す）
      void utils.entries.getInstances.invalidate();
    },
  });

  // 例外削除（楽観的更新付き）
  const deleteInstance = api.entries.deleteInstance.useMutation({
    // 楽観的更新: 例外削除直後に即座にUIを更新
    onMutate: async (input) => {
      // 進行中のクエリをキャンセル
      await utils.entries.getInstances.cancel();

      // 該当planIdを含むすべてのキャッシュから例外を削除
      queryClient.setQueriesData<PlanInstance[]>(
        { queryKey: [['entries', 'getInstances']], exact: false },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (inst) =>
              !(inst.entry_id === input.entryId && inst.instance_date === input.instanceDate),
          );
        },
      );

      return { deletedPlanId: input.entryId, deletedDate: input.instanceDate };
    },
    onSuccess: () => {
      void utils.entries.getInstances.invalidate();
    },
    onError: () => {
      // エラー時: ロールバック
      void utils.entries.getInstances.invalidate();
    },
  });

  return {
    createInstance,
    deleteInstance,
  };
}
