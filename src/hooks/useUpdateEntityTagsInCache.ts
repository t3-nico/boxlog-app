import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { api } from '@/lib/trpc';

/**
 * エンティティのtagIdsキャッシュを楽観的に更新するフック
 *
 * Plans/Records共通で使用。list / getById 両方のキャッシュを一括更新する。
 * CalendarCard等での即時表示に必要。
 */
export function useUpdateEntityTagsInCache(entity: 'plans' | 'records') {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return useCallback(
    (entityId: string, newTagIds: string[]) => {
      // 1. entity.list のすべてのキャッシュを更新
      // tRPC v11 のクエリキー形式: [procedurePath, { input, type }]
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length >= 1 &&
              Array.isArray(key[0]) &&
              key[0][0] === entity &&
              key[0][1] === 'list'
            );
          },
        },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((item: { id: string; tagIds?: string[] }) =>
            item.id === entityId ? { ...item, tagIds: newTagIds } : item,
          );
        },
      );

      // 2. entity.getById のキャッシュを更新
      if (entity === 'plans') {
        const updater = (oldData: ReturnType<typeof utils.plans.getById.getData>) => {
          if (!oldData) return oldData;
          return { ...oldData, tagIds: newTagIds };
        };
        utils.plans.getById.setData({ id: entityId }, updater);
        utils.plans.getById.setData({ id: entityId, include: { tags: true } }, updater);
      } else {
        const updater = (oldData: ReturnType<typeof utils.records.getById.getData>) => {
          if (!oldData) return oldData;
          return { ...oldData, tagIds: newTagIds };
        };
        utils.records.getById.setData({ id: entityId }, updater);
        utils.records.getById.setData({ id: entityId, include: { plan: true } }, updater);
      }
    },
    [queryClient, entity, utils],
  );
}
