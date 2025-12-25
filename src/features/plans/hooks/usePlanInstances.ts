import { CACHE_2_MINUTES, CACHE_5_MINUTES } from '@/constants/time';
import { api } from '@/lib/trpc';

import type { PlanInstanceException } from '../utils/recurrence';

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

  return api.plans.getInstances.useQuery(
    {
      planIds,
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
    plan_id: string;
    instance_date: string;
    is_exception: boolean;
    exception_type: string | null;
    overrides: Record<string, unknown> | null;
    original_date: string | null;
  }>,
): Map<string, PlanInstanceException[]> {
  const map = new Map<string, PlanInstanceException[]>();

  for (const instance of instances) {
    const exceptionType = instance.exception_type as 'modified' | 'cancelled' | 'moved' | null;
    const exception: PlanInstanceException = {
      instanceDate: instance.instance_date,
      isException: instance.is_exception,
      exceptionType: exceptionType ?? undefined,
      overrides: instance.overrides ?? undefined,
      originalDate: instance.original_date ?? undefined,
    };

    const existing = map.get(instance.plan_id) ?? [];
    existing.push(exception);
    map.set(instance.plan_id, existing);
  }

  return map;
}

/**
 * プランインスタンス作成mutation
 */
export function usePlanInstanceMutations() {
  const utils = api.useUtils();

  const createInstance = api.plans.createInstance.useMutation({
    onSuccess: () => {
      // キャッシュを無効化して再フェッチ
      utils.plans.getInstances.invalidate();
    },
  });

  const deleteInstance = api.plans.deleteInstance.useMutation({
    onSuccess: () => {
      utils.plans.getInstances.invalidate();
    },
  });

  return {
    createInstance,
    deleteInstance,
  };
}
