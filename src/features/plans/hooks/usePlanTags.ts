import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

// 楽観的更新用のコンテキスト型
interface OptimisticUpdateContext {
  previousListData: unknown;
  previousPlanData: unknown;
  previousTagStats:
    | { counts: Record<string, number>; lastUsed: Record<string, string>; untaggedCount: number }
    | undefined;
  planId: string;
  // setTags用: 追加・削除されたタグIDを記録
  addedTagIds?: string[];
  removedTagIds?: string[];
}

/**
 * プラン・セッションとタグの関連付け管理フック
 *
 * tRPC APIを使用してプランとタグの関連付けを管理します。
 * 楽観的更新により、タグの追加・削除が即座にUIに反映されます。
 *
 * 注意: plan.tagIds（IDのみ）を管理し、タグの詳細情報はtags.listキャッシュから取得する。
 */
export function usePlanTags() {
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  // プランキャッシュのtagIdsを楽観的に更新するヘルパー
  const updatePlanTagIdsInCache = useCallback(
    (planId: string, newTagIds: string[]) => {
      type PlanData = ReturnType<typeof utils.plans.getById.getData>;

      // plans.list のすべてのキャッシュを更新（入力キーに関係なく）
      // tRPCのクエリキーは [['plans', 'list'], ...] の形式
      // setQueriesData で部分一致させ、すべての plans.list クエリを更新
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            // tRPC v11 のクエリキー形式: [procedurePath, { input, type }]
            // procedurePath は ['plans', 'list'] のような配列
            return (
              Array.isArray(key) &&
              key.length >= 1 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'plans' &&
              key[0][1] === 'list'
            );
          },
        },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((plan: { id: string; tagIds?: string[] }) =>
            plan.id === planId ? { ...plan, tagIds: newTagIds } : plan,
          );
        },
      );

      // plans.getById のキャッシュを更新
      utils.plans.getById.setData({ id: planId }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds } as PlanData;
      });

      // include: tags 付きの getById も更新
      utils.plans.getById.setData({ id: planId, include: { tags: true } }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds } as PlanData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- utils自体は安定しており、plans.list/getByIdで十分
    [queryClient, utils.plans.getById],
  );

  // 現在のプランのタグIDリストを取得するヘルパー
  const getCurrentPlanTagIds = useCallback(
    (planId: string): string[] => {
      // まず getById から取得を試みる
      const planData = utils.plans.getById.getData({ id: planId });
      if (planData?.tagIds) {
        return planData.tagIds;
      }

      // list から取得を試みる（すべての plans.list クエリをチェック）
      const allQueries = queryClient.getQueriesData<Array<{ id: string; tagIds?: string[] }>>({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 1 &&
            Array.isArray(key[0]) &&
            key[0][0] === 'plans' &&
            key[0][1] === 'list'
          );
        },
      });

      for (const [, data] of allQueries) {
        if (data) {
          const plan = data.find((p) => p.id === planId);
          if (plan?.tagIds) {
            return plan.tagIds;
          }
        }
      }

      return [];
    },
    [queryClient, utils.plans.getById],
  );

  // tRPC mutations with optimistic updates
  const addTagMutation = api.plans.addTag.useMutation({
    onMutate: async ({
      planId,
      tagId,
    }: {
      planId: string;
      tagId: string;
    }): Promise<OptimisticUpdateContext> => {
      // 進行中のフェッチをキャンセル
      await utils.plans.list.cancel();
      await utils.plans.getById.cancel({ id: planId });
      await utils.plans.getTagStats.cancel();

      // 現在のキャッシュを保存
      const previousListData = utils.plans.list.getData();
      const previousPlanData = utils.plans.getById.getData({ id: planId });
      const previousTagStats = utils.plans.getTagStats.getData();

      // 現在のタグIDリストを取得
      const currentTagIds = getCurrentPlanTagIds(planId);
      // 既に存在しない場合のみ追加
      if (!currentTagIds.includes(tagId)) {
        updatePlanTagIdsInCache(planId, [...currentTagIds, tagId]);

        // getTagStats を楽観的に更新（カウントを+1）
        if (previousTagStats) {
          const newCounts = { ...previousTagStats.counts };
          newCounts[tagId] = (newCounts[tagId] ?? 0) + 1;
          // タグなしプランにタグを追加した場合、untaggedCountを-1
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

      return { previousListData, previousPlanData, previousTagStats, planId };
    },
    onError: (
      _err: unknown,
      { planId }: { planId: string },
      context: OptimisticUpdateContext | undefined,
    ) => {
      // エラー時はロールバック
      if (context?.previousListData) {
        utils.plans.list.setData(
          undefined,
          context.previousListData as ReturnType<typeof utils.plans.list.getData>,
        );
      }
      if (context?.previousPlanData) {
        utils.plans.getById.setData(
          { id: planId },
          context.previousPlanData as ReturnType<typeof utils.plans.getById.getData>,
        );
      }
      if (context?.previousTagStats) {
        utils.plans.getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    onSettled: (_data: unknown, _err: unknown, { planId }: { planId: string }) => {
      // 完了時にサーバーと同期
      void utils.plans.getById.invalidate({ id: planId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.invalidate();
    },
  });

  const removeTagMutation = api.plans.removeTag.useMutation({
    onMutate: async ({
      planId,
      tagId,
    }: {
      planId: string;
      tagId: string;
    }): Promise<OptimisticUpdateContext> => {
      // 進行中のフェッチをキャンセル
      await utils.plans.list.cancel();
      await utils.plans.getById.cancel({ id: planId });
      await utils.plans.getTagStats.cancel();

      // 現在のキャッシュを保存
      const previousListData = utils.plans.list.getData();
      const previousPlanData = utils.plans.getById.getData({ id: planId });
      const previousTagStats = utils.plans.getTagStats.getData();

      // タグIDを削除
      const currentTagIds = getCurrentPlanTagIds(planId);
      const newTagIds = currentTagIds.filter((id) => id !== tagId);
      updatePlanTagIdsInCache(planId, newTagIds);

      // getTagStats を楽観的に更新（カウントを-1）
      if (previousTagStats) {
        const newCounts = { ...previousTagStats.counts };
        if (newCounts[tagId] !== undefined && newCounts[tagId] > 0) {
          newCounts[tagId] = newCounts[tagId] - 1;
        }
        // 最後のタグを削除した場合、untaggedCountを+1
        const willBeUntagged = newTagIds.length === 0;
        utils.plans.getTagStats.setData(undefined, {
          ...previousTagStats,
          counts: newCounts,
          untaggedCount: willBeUntagged
            ? previousTagStats.untaggedCount + 1
            : previousTagStats.untaggedCount,
        });
      }

      return { previousListData, previousPlanData, previousTagStats, planId };
    },
    onError: (
      _err: unknown,
      { planId }: { planId: string },
      context: OptimisticUpdateContext | undefined,
    ) => {
      // エラー時はロールバック
      if (context?.previousListData) {
        utils.plans.list.setData(
          undefined,
          context.previousListData as ReturnType<typeof utils.plans.list.getData>,
        );
      }
      if (context?.previousPlanData) {
        utils.plans.getById.setData(
          { id: planId },
          context.previousPlanData as ReturnType<typeof utils.plans.getById.getData>,
        );
      }
      if (context?.previousTagStats) {
        utils.plans.getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    onSettled: (_data: unknown, _err: unknown, { planId }: { planId: string }) => {
      // 完了時にサーバーと同期
      void utils.plans.getById.invalidate({ id: planId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.invalidate();
    },
  });

  const setTagsMutation = api.plans.setTags.useMutation({
    onMutate: async ({
      planId,
      tagIds,
    }: {
      planId: string;
      tagIds: string[];
    }): Promise<OptimisticUpdateContext> => {
      // 進行中のフェッチをキャンセル
      await utils.plans.list.cancel();
      await utils.plans.getById.cancel({ id: planId });
      await utils.plans.getTagStats.cancel();

      // 現在のキャッシュを保存
      const previousListData = utils.plans.list.getData();
      const previousPlanData = utils.plans.getById.getData({ id: planId });
      const previousTagStats = utils.plans.getTagStats.getData();

      // 現在のタグIDリストを取得
      const currentTagIds = getCurrentPlanTagIds(planId);
      const currentTagIdSet = new Set(currentTagIds);
      const newTagIdSet = new Set(tagIds);

      // 追加されたタグ（新しいリストにあるが、現在のリストにない）
      const addedTagIds = tagIds.filter((id) => !currentTagIdSet.has(id));
      // 削除されたタグ（現在のリストにあるが、新しいリストにない）
      const removedTagIds = currentTagIds.filter((id) => !newTagIdSet.has(id));

      // タグIDリストを更新
      updatePlanTagIdsInCache(planId, tagIds);

      // getTagStats を楽観的に更新
      if (previousTagStats) {
        const newCounts = { ...previousTagStats.counts };

        // 追加されたタグのカウントを+1
        for (const tagId of addedTagIds) {
          newCounts[tagId] = (newCounts[tagId] ?? 0) + 1;
        }

        // 削除されたタグのカウントを-1
        for (const tagId of removedTagIds) {
          if (newCounts[tagId] !== undefined && newCounts[tagId] > 0) {
            newCounts[tagId] = newCounts[tagId] - 1;
          }
        }

        // untaggedCount の更新
        const wasUntagged = currentTagIds.length === 0;
        const willBeUntagged = tagIds.length === 0;
        let newUntaggedCount = previousTagStats.untaggedCount;
        if (wasUntagged && !willBeUntagged) {
          // タグなし → タグあり
          newUntaggedCount = Math.max(0, newUntaggedCount - 1);
        } else if (!wasUntagged && willBeUntagged) {
          // タグあり → タグなし
          newUntaggedCount = newUntaggedCount + 1;
        }

        utils.plans.getTagStats.setData(undefined, {
          ...previousTagStats,
          counts: newCounts,
          untaggedCount: newUntaggedCount,
        });
      }

      return {
        previousListData,
        previousPlanData,
        previousTagStats,
        planId,
        addedTagIds,
        removedTagIds,
      };
    },
    onError: (
      _err: unknown,
      { planId }: { planId: string },
      context: OptimisticUpdateContext | undefined,
    ) => {
      // エラー時はロールバック
      if (context?.previousListData) {
        utils.plans.list.setData(
          undefined,
          context.previousListData as ReturnType<typeof utils.plans.list.getData>,
        );
      }
      if (context?.previousPlanData) {
        utils.plans.getById.setData(
          { id: planId },
          context.previousPlanData as ReturnType<typeof utils.plans.getById.getData>,
        );
      }
      if (context?.previousTagStats) {
        utils.plans.getTagStats.setData(undefined, context.previousTagStats);
      }
    },
    onSettled: (_data: unknown, _err: unknown, { planId }: { planId: string }) => {
      // 完了時にサーバーと同期
      void utils.plans.getById.invalidate({ id: planId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.invalidate();
    },
  });

  /**
   * プランにタグを追加
   */
  const addplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        await addTagMutation.mutateAsync({ planId, tagId });
        return true;
      } catch (error) {
        logger.error('Failed to add tag:', error);
        return false;
      }
    },
    [addTagMutation],
  );

  /**
   * プランからタグを削除
   */
  const removeplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        await removeTagMutation.mutateAsync({ planId, tagId });
        return true;
      } catch (error) {
        logger.error('Failed to remove tag:', error);
        return false;
      }
    },
    [removeTagMutation],
  );

  /**
   * プランのタグを一括設定（既存タグをすべて置換）
   */
  const setplanTags = useCallback(
    async (planId: string, tagIds: string[]): Promise<boolean> => {
      try {
        await setTagsMutation.mutateAsync({ planId, tagIds });
        return true;
      } catch {
        return false;
      }
    },
    [setTagsMutation],
  );

  // Combine loading states from all mutations
  const isLoading =
    addTagMutation.isPending || removeTagMutation.isPending || setTagsMutation.isPending;

  // Get the most recent error
  const error =
    addTagMutation.error?.message ??
    removeTagMutation.error?.message ??
    setTagsMutation.error?.message ??
    null;

  return {
    // State
    isLoading,
    error,

    // plan Tag Actions
    addplanTag,
    removeplanTag,
    setplanTags,
    // Plan Tag Actions (aliases)
    addPlanTag: addplanTag,
    removePlanTag: removeplanTag,
  };
}

// Backward compatibility
export { usePlanTags as useplanTags };
