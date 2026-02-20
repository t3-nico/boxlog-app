/**
 * Entity Tags Hook Factory
 *
 * Plan/Record共通のタグ管理フックを生成
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

/**
 * エンティティタグフックファクトリーのオプション
 */
export interface CreateEntityTagsHookOptions {
  /** エンティティ名（'plans' | 'records'） */
  entityName: 'plans' | 'records';
  /** エンティティIDフィールド名（'planId' | 'recordId'） */
  entityIdField: 'planId' | 'recordId';
  /** TagStats更新を有効化（Planのみtrue） */
  enableTagStats?: boolean;
}

/**
 * エンティティタグフック
 */
export interface EntityTagsHook {
  isLoading: boolean;
  error: string | null;
  addTag: (entityId: string, tagId: string) => Promise<boolean>;
  removeTag: (entityId: string, tagId: string) => Promise<boolean>;
  setTags: (entityId: string, tagIds: string[]) => Promise<boolean>;
}

/**
 * エンティティタグフックファクトリー
 *
 * @param options フック設定
 * @param utils tRPC API utils (api.useUtils()の結果)
 * @returns エンティティタグフック
 *
 * @example
 * ```typescript
 * // Plan用
 * export function usePlanTags() {
 *   const utils = api.useUtils();
 *   return useEntityTagsHook({
 *     entityName: 'plans',
 *     entityIdField: 'planId',
 *     enableTagStats: true,
 *   }, utils);
 * }
 *
 * // Record用
 * export function useRecordTags() {
 *   const utils = api.useUtils();
 *   return useEntityTagsHook({
 *     entityName: 'records',
 *     entityIdField: 'recordId',
 *   }, utils);
 * }
 * ```
 */
export function useEntityTagsHook(
  options: CreateEntityTagsHookOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  utils: any,
): EntityTagsHook {
  const { entityName, entityIdField, enableTagStats = false } = options;
  const queryClient = useQueryClient();
  const updateEntityTagIdsInCache = useUpdateEntityTagsInCache(entityName);

  // 現在のエンティティのタグIDリストを取得するヘルパー
  const getCurrentEntityTagIds = useCallback(
    (entityId: string): string[] => {
      // まず getById から取得を試みる
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entityData = utils[entityName].getById.getData({ id: entityId }) as any;
      if (entityData?.tagIds) {
        return entityData.tagIds;
      }

      // list から取得を試みる
      const allQueries = queryClient.getQueriesData<Array<{ id: string; tagIds?: string[] }>>({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 1 &&
            Array.isArray(key[0]) &&
            key[0][0] === entityName &&
            key[0][1] === 'list'
          );
        },
      });

      for (const [, data] of allQueries) {
        if (data) {
          const entity = data.find((e) => e.id === entityId);
          if (entity?.tagIds) {
            return entity.tagIds;
          }
        }
      }

      return [];
    },
    [queryClient, utils, entityName],
  );

  // addTag mutation
  const addTagMutation = api[entityName].addTag.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMutate: async (variables: any) => {
      const entityId = variables[entityIdField];
      const { tagId } = variables;

      await utils[entityName].list.cancel();
      await utils[entityName].getById.cancel({ id: entityId });
      if (enableTagStats && entityName === 'plans') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (utils as any).plans.getTagStats.cancel();
      }

      const previousListData = utils[entityName].list.getData();
      const previousEntityData = utils[entityName].getById.getData({ id: entityId });
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const previousTagStats =
        enableTagStats && entityName === 'plans'
          ? (utils as any).plans.getTagStats.getData()
          : undefined;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const currentTagIds = getCurrentEntityTagIds(entityId);
      if (!currentTagIds.includes(tagId)) {
        updateEntityTagIdsInCache(entityId, [...currentTagIds, tagId]);

        if (enableTagStats && entityName === 'plans' && previousTagStats) {
          const newCounts = { ...previousTagStats.counts };
          newCounts[tagId] = (newCounts[tagId] ?? 0) + 1;
          const wasUntagged = currentTagIds.length === 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (utils as any).plans.getTagStats.setData(undefined, {
            ...previousTagStats,
            counts: newCounts,
            untaggedCount: wasUntagged
              ? Math.max(0, previousTagStats.untaggedCount - 1)
              : previousTagStats.untaggedCount,
          });
        }
      }

      return { previousListData, previousEntityData, previousTagStats, entityId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_err: unknown, variables: any, context: any) => {
      const entityId = variables[entityIdField];
      if (context?.previousListData) {
        utils[entityName].list.setData(undefined, context.previousListData);
      }
      if (context?.previousEntityData) {
        utils[entityName].getById.setData({ id: entityId }, context.previousEntityData);
      }
      if (enableTagStats && entityName === 'plans' && context?.previousTagStats) {
        utils[entityName].getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_data: unknown, _err: unknown, variables: any) => {
      const entityId = variables[entityIdField];
      void utils[entityName].getById.invalidate({ id: entityId });
      void utils[entityName].list.invalidate();
      if (enableTagStats && entityName === 'plans') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void (utils as any).plans.getTagStats.invalidate();
      }
    },
  });

  // removeTag mutation
  const removeTagMutation = api[entityName].removeTag.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMutate: async (variables: any) => {
      const entityId = variables[entityIdField];
      const { tagId } = variables;

      await utils[entityName].list.cancel();
      await utils[entityName].getById.cancel({ id: entityId });
      if (enableTagStats && entityName === 'plans') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (utils as any).plans.getTagStats.cancel();
      }

      const previousListData = utils[entityName].list.getData();
      const previousEntityData = utils[entityName].getById.getData({ id: entityId });
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const previousTagStats =
        enableTagStats && entityName === 'plans'
          ? (utils as any).plans.getTagStats.getData()
          : undefined;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const currentTagIds = getCurrentEntityTagIds(entityId);
      const newTagIds = currentTagIds.filter((id) => id !== tagId);
      updateEntityTagIdsInCache(entityId, newTagIds);

      if (enableTagStats && entityName === 'plans' && previousTagStats) {
        const newCounts = { ...previousTagStats.counts };
        if (newCounts[tagId] !== undefined && newCounts[tagId] > 0) {
          newCounts[tagId] = newCounts[tagId] - 1;
        }
        const willBeUntagged = newTagIds.length === 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (utils as any).plans.getTagStats.setData(undefined, {
          ...previousTagStats,
          counts: newCounts,
          untaggedCount: willBeUntagged
            ? previousTagStats.untaggedCount + 1
            : previousTagStats.untaggedCount,
        });
      }

      return { previousListData, previousEntityData, previousTagStats, entityId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_err: unknown, variables: any, context: any) => {
      const entityId = variables[entityIdField];
      if (context?.previousListData) {
        utils[entityName].list.setData(undefined, context.previousListData);
      }
      if (context?.previousEntityData) {
        utils[entityName].getById.setData({ id: entityId }, context.previousEntityData);
      }
      if (enableTagStats && entityName === 'plans' && context?.previousTagStats) {
        utils[entityName].getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_data: unknown, _err: unknown, variables: any) => {
      const entityId = variables[entityIdField];
      void utils[entityName].getById.invalidate({ id: entityId });
      void utils[entityName].list.invalidate();
      if (enableTagStats && entityName === 'plans') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void (utils as any).plans.getTagStats.invalidate();
      }
    },
  });

  // setTags mutation
  const setTagsMutation = api[entityName].setTags.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMutate: async (variables: any) => {
      const entityId = variables[entityIdField];
      const { tagIds } = variables;

      await utils[entityName].list.cancel();
      await utils[entityName].getById.cancel({ id: entityId });
      if (enableTagStats && entityName === 'plans') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (utils as any).plans.getTagStats.cancel();
      }

      const previousListData = utils[entityName].list.getData();
      const previousEntityData = utils[entityName].getById.getData({ id: entityId });
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const previousTagStats =
        enableTagStats && entityName === 'plans'
          ? (utils as any).plans.getTagStats.getData()
          : undefined;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const currentTagIds = getCurrentEntityTagIds(entityId);
      updateEntityTagIdsInCache(entityId, tagIds);

      if (enableTagStats && entityName === 'plans' && previousTagStats) {
        const currentTagIdSet = new Set(currentTagIds);
        const newTagIdSet = new Set(tagIds);
        const addedTagIds = tagIds.filter((id: string) => !currentTagIdSet.has(id));
        const removedTagIds = currentTagIds.filter((id: string) => !newTagIdSet.has(id));

        const newCounts = { ...previousTagStats.counts };
        for (const tagId of addedTagIds) {
          newCounts[tagId] = (newCounts[tagId] ?? 0) + 1;
        }
        for (const tagId of removedTagIds) {
          if (newCounts[tagId] !== undefined && newCounts[tagId] > 0) {
            newCounts[tagId] = newCounts[tagId] - 1;
          }
        }

        const wasUntagged = currentTagIds.length === 0;
        const willBeUntagged = tagIds.length === 0;
        let newUntaggedCount = previousTagStats.untaggedCount;
        if (wasUntagged && !willBeUntagged) {
          newUntaggedCount = Math.max(0, newUntaggedCount - 1);
        } else if (!wasUntagged && willBeUntagged) {
          newUntaggedCount = newUntaggedCount + 1;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (utils as any).plans.getTagStats.setData(undefined, {
          ...previousTagStats,
          counts: newCounts,
          untaggedCount: newUntaggedCount,
        });
      }

      return { previousListData, previousEntityData, previousTagStats, entityId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_err: unknown, variables: any, context: any) => {
      const entityId = variables[entityIdField];
      if (context?.previousListData) {
        utils[entityName].list.setData(undefined, context.previousListData);
      }
      if (context?.previousEntityData) {
        utils[entityName].getById.setData({ id: entityId }, context.previousEntityData);
      }
      if (enableTagStats && entityName === 'plans' && context?.previousTagStats) {
        utils[entityName].getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_data: unknown, _err: unknown, variables: any) => {
      const entityId = variables[entityIdField];
      void utils[entityName].getById.invalidate({ id: entityId });
      void utils[entityName].list.invalidate();
      if (enableTagStats && entityName === 'plans') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void (utils as any).plans.getTagStats.invalidate();
      }
    },
  });

  // Public API
  const addTag = useCallback(
    async (entityId: string, tagId: string): Promise<boolean> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await addTagMutation.mutateAsync({ [entityIdField]: entityId, tagId } as any);
        return true;
      } catch (error) {
        if (enableTagStats && entityName === 'plans') {
          logger.error('Failed to add tag:', error);
        }
        return false;
      }
    },
    [addTagMutation, entityIdField, enableTagStats, entityName],
  );

  const removeTag = useCallback(
    async (entityId: string, tagId: string): Promise<boolean> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await removeTagMutation.mutateAsync({ [entityIdField]: entityId, tagId } as any);
        return true;
      } catch (error) {
        if (enableTagStats && entityName === 'plans') {
          logger.error('Failed to remove tag:', error);
        }
        return false;
      }
    },
    [removeTagMutation, entityIdField, enableTagStats, entityName],
  );

  const setTags = useCallback(
    async (entityId: string, tagIds: string[]): Promise<boolean> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setTagsMutation.mutateAsync({ [entityIdField]: entityId, tagIds } as any);
        return true;
      } catch {
        return false;
      }
    },
    [setTagsMutation, entityIdField],
  );

  const isLoading =
    addTagMutation.isPending || removeTagMutation.isPending || setTagsMutation.isPending;

  const error =
    addTagMutation.error?.message ??
    removeTagMutation.error?.message ??
    setTagsMutation.error?.message ??
    null;

  return {
    isLoading,
    error,
    addTag,
    removeTag,
    setTags,
  };
}
