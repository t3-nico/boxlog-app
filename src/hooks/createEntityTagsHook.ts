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

/** tRPC utils 型 */
type TRPCUtils = ReturnType<typeof api.useUtils>;

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
 * mutation変数からエンティティIDを取得（plans/records共通）
 *
 * tRPCの動的アクセス（api[entityName]）により、mutation変数が
 * { planId, tagId } | { recordId, tagId } のunion型になるため、
 * 'in'演算子で型を判別してIDを抽出する。
 */
function extractEntityId(variables: Record<string, unknown>): string {
  if ('planId' in variables) return variables.planId as string;
  return variables.recordId as string;
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
  utils: TRPCUtils,
): EntityTagsHook {
  const { entityName, entityIdField, enableTagStats = false } = options;
  const queryClient = useQueryClient();
  const updateEntityTagIdsInCache = useUpdateEntityTagsInCache(entityName);

  // 現在のエンティティのタグIDリストを取得するヘルパー
  const getCurrentEntityTagIds = useCallback(
    (entityId: string): string[] => {
      // まず getById から取得を試みる
      const entityData = utils[entityName].getById.getData({ id: entityId }) as
        | { tagIds?: string[] }
        | null
        | undefined;
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
    onMutate: async (variables) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      const { tagId } = variables;

      await utils[entityName].list.cancel();
      await utils[entityName].getById.cancel({ id: entityId });
      if (enableTagStats && entityName === 'plans') {
        await utils.plans.getTagStats.cancel();
      }

      const previousListData = utils[entityName].list.getData();
      const previousEntityData = utils[entityName].getById.getData({ id: entityId });
      const previousTagStats =
        enableTagStats && entityName === 'plans' ? utils.plans.getTagStats.getData() : undefined;

      const currentTagIds = getCurrentEntityTagIds(entityId);
      if (!currentTagIds.includes(tagId)) {
        updateEntityTagIdsInCache(entityId, [...currentTagIds, tagId]);

        if (enableTagStats && entityName === 'plans' && previousTagStats) {
          const newCounts = { ...previousTagStats.counts };
          newCounts[tagId] = (newCounts[tagId] ?? 0) + 1;
          const wasUntagged = currentTagIds.length === 0;
          utils.plans.getTagStats.setData(undefined, {
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
    onError: (_err, variables, context) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      if (context?.previousListData) {
        // variance問題: utils[entityName]のunion型によりsetDataのパラメータが intersection を要求するため as never で回避
        utils[entityName].list.setData(undefined, context.previousListData as never);
      }
      if (context?.previousEntityData) {
        utils[entityName].getById.setData({ id: entityId }, context.previousEntityData as never);
      }
      if (enableTagStats && entityName === 'plans' && context?.previousTagStats) {
        utils.plans.getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    onSettled: (_data, _err, variables) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      void utils[entityName].getById.invalidate({ id: entityId });
      void utils[entityName].list.invalidate();
      if (enableTagStats && entityName === 'plans') {
        void utils.plans.getTagStats.invalidate();
      }
    },
  });

  // removeTag mutation
  const removeTagMutation = api[entityName].removeTag.useMutation({
    onMutate: async (variables) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      const { tagId } = variables;

      await utils[entityName].list.cancel();
      await utils[entityName].getById.cancel({ id: entityId });
      if (enableTagStats && entityName === 'plans') {
        await utils.plans.getTagStats.cancel();
      }

      const previousListData = utils[entityName].list.getData();
      const previousEntityData = utils[entityName].getById.getData({ id: entityId });
      const previousTagStats =
        enableTagStats && entityName === 'plans' ? utils.plans.getTagStats.getData() : undefined;

      const currentTagIds = getCurrentEntityTagIds(entityId);
      const newTagIds = currentTagIds.filter((id) => id !== tagId);
      updateEntityTagIdsInCache(entityId, newTagIds);

      if (enableTagStats && entityName === 'plans' && previousTagStats) {
        const newCounts = { ...previousTagStats.counts };
        if (newCounts[tagId] !== undefined && newCounts[tagId] > 0) {
          newCounts[tagId] = newCounts[tagId] - 1;
        }
        const willBeUntagged = newTagIds.length === 0;
        utils.plans.getTagStats.setData(undefined, {
          ...previousTagStats,
          counts: newCounts,
          untaggedCount: willBeUntagged
            ? previousTagStats.untaggedCount + 1
            : previousTagStats.untaggedCount,
        });
      }

      return { previousListData, previousEntityData, previousTagStats, entityId };
    },
    onError: (_err, variables, context) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      if (context?.previousListData) {
        utils[entityName].list.setData(undefined, context.previousListData as never);
      }
      if (context?.previousEntityData) {
        utils[entityName].getById.setData({ id: entityId }, context.previousEntityData as never);
      }
      if (enableTagStats && entityName === 'plans' && context?.previousTagStats) {
        utils.plans.getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    onSettled: (_data, _err, variables) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      void utils[entityName].getById.invalidate({ id: entityId });
      void utils[entityName].list.invalidate();
      if (enableTagStats && entityName === 'plans') {
        void utils.plans.getTagStats.invalidate();
      }
    },
  });

  // setTags mutation
  const setTagsMutation = api[entityName].setTags.useMutation({
    onMutate: async (variables) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      const { tagIds } = variables;

      await utils[entityName].list.cancel();
      await utils[entityName].getById.cancel({ id: entityId });
      if (enableTagStats && entityName === 'plans') {
        await utils.plans.getTagStats.cancel();
      }

      const previousListData = utils[entityName].list.getData();
      const previousEntityData = utils[entityName].getById.getData({ id: entityId });
      const previousTagStats =
        enableTagStats && entityName === 'plans' ? utils.plans.getTagStats.getData() : undefined;

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

        utils.plans.getTagStats.setData(undefined, {
          ...previousTagStats,
          counts: newCounts,
          untaggedCount: newUntaggedCount,
        });
      }

      return { previousListData, previousEntityData, previousTagStats, entityId };
    },
    onError: (_err, variables, context) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      if (context?.previousListData) {
        utils[entityName].list.setData(undefined, context.previousListData as never);
      }
      if (context?.previousEntityData) {
        utils[entityName].getById.setData({ id: entityId }, context.previousEntityData as never);
      }
      if (enableTagStats && entityName === 'plans' && context?.previousTagStats) {
        utils.plans.getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    onSettled: (_data, _err, variables) => {
      const entityId = extractEntityId(variables as Record<string, unknown>);
      void utils[entityName].getById.invalidate({ id: entityId });
      void utils[entityName].list.invalidate();
      if (enableTagStats && entityName === 'plans') {
        void utils.plans.getTagStats.invalidate();
      }
    },
  });

  // Public API
  const addTag = useCallback(
    async (entityId: string, tagId: string): Promise<boolean> => {
      try {
        const input =
          entityIdField === 'planId' ? { planId: entityId, tagId } : { recordId: entityId, tagId };
        // union型のmutationに対する呼び出し: TypeScriptがintersection型を要求するため as never で回避
        await addTagMutation.mutateAsync(input as never);
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
        const input =
          entityIdField === 'planId' ? { planId: entityId, tagId } : { recordId: entityId, tagId };
        await removeTagMutation.mutateAsync(input as never);
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
        const input =
          entityIdField === 'planId'
            ? { planId: entityId, tagIds }
            : { recordId: entityId, tagIds };
        await setTagsMutation.mutateAsync(input as never);
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
