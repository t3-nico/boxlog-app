import { useCallback } from 'react';

import { api } from '@/lib/trpc';

// 楽観的更新用のコンテキスト型
interface OptimisticUpdateContext {
  previousListData: unknown;
  previousPlanData: unknown;
  planId: string;
}

// キャッシュされたタグの完全な型
type CachedTag = NonNullable<
  ReturnType<ReturnType<typeof api.useUtils>['tags']['list']['getData']>
>['data'][number];

/**
 * プラン・セッションとタグの関連付け管理フック
 *
 * tRPC APIを使用してプランとタグの関連付けを管理します。
 * 楽観的更新により、タグの追加・削除が即座にUIに反映されます。
 */
export function usePlanTags() {
  const utils = api.useUtils();

  // タグ一覧をキャッシュから取得するためのユーティリティ
  const getTagById = useCallback(
    (tagId: string): CachedTag | null => {
      const tagsData = utils.tags.list.getData();
      if (!tagsData?.data) return null;
      return tagsData.data.find((t) => t.id === tagId) ?? null;
    },
    [utils.tags.list],
  );

  // プランキャッシュを楽観的に更新するヘルパー
  // Note: 型アサーションを使用 - exactOptionalPropertyTypes制約によりTag型の
  // sort_order?: と plan.tags の sort_order: に互換性がないため
  const updatePlanTagsInCache = useCallback(
    (planId: string, newTags: CachedTag[]) => {
      type PlanListData = ReturnType<typeof utils.plans.list.getData>;
      type PlanData = ReturnType<typeof utils.plans.getById.getData>;

      // plans.list のキャッシュを更新
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((plan) =>
          plan.id === planId ? { ...plan, tags: newTags as typeof plan.tags } : plan,
        ) as PlanListData;
      });

      // plans.getById のキャッシュを更新
      utils.plans.getById.setData({ id: planId }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tags: newTags as typeof oldData.tags } as PlanData;
      });

      // include: tags 付きの getById も更新
      utils.plans.getById.setData({ id: planId, include: { tags: true } }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tags: newTags as typeof oldData.tags } as PlanData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- utils自体は安定しており、plans.list/getByIdで十分
    [utils.plans.list, utils.plans.getById],
  );

  // 現在のプランのタグを取得するヘルパー
  // Note: plan.tagsとCachedTagは実質同じ構造だが、exactOptionalPropertyTypesにより
  // 型が異なるため、型アサーションで統一
  const getCurrentPlanTags = useCallback(
    (planId: string): CachedTag[] => {
      // まず getById から取得を試みる
      const planData = utils.plans.getById.getData({ id: planId });
      if (planData?.tags) {
        return planData.tags as CachedTag[];
      }

      // list から取得を試みる
      const listData = utils.plans.list.getData();
      if (listData) {
        const plan = listData.find((p) => p.id === planId);
        if (plan?.tags) {
          return plan.tags as CachedTag[];
        }
      }

      return [];
    },
    [utils.plans.getById, utils.plans.list],
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

      // 現在のキャッシュを保存
      const previousListData = utils.plans.list.getData();
      const previousPlanData = utils.plans.getById.getData({ id: planId });

      // 新しいタグを取得
      const newTag = getTagById(tagId);
      if (newTag) {
        const currentTags = getCurrentPlanTags(planId);
        // 既に存在しない場合のみ追加
        if (!currentTags.some((t) => t.id === tagId)) {
          updatePlanTagsInCache(planId, [...currentTags, newTag]);
        }
      }

      return { previousListData, previousPlanData, planId };
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
    },
    onSettled: (_data: unknown, _err: unknown, { planId }: { planId: string }) => {
      // 完了時にサーバーと同期
      void utils.plans.getById.invalidate({ id: planId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.invalidate();
      // タグ構造が変更された可能性があるため、親タグリストも無効化
      void utils.tags.listParentTags.invalidate();
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

      // 現在のキャッシュを保存
      const previousListData = utils.plans.list.getData();
      const previousPlanData = utils.plans.getById.getData({ id: planId });

      // タグを削除
      const currentTags = getCurrentPlanTags(planId);
      const newTags = currentTags.filter((t) => t.id !== tagId);
      updatePlanTagsInCache(planId, newTags);

      return { previousListData, previousPlanData, planId };
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
    },
    onSettled: (_data: unknown, _err: unknown, { planId }: { planId: string }) => {
      // 完了時にサーバーと同期
      void utils.plans.getById.invalidate({ id: planId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.invalidate();
      // タグ構造が変更された可能性があるため、親タグリストも無効化
      void utils.tags.listParentTags.invalidate();
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

      // 現在のキャッシュを保存
      const previousListData = utils.plans.list.getData();
      const previousPlanData = utils.plans.getById.getData({ id: planId });

      // 新しいタグリストを構築
      const newTags = tagIds
        .map((tagId) => getTagById(tagId))
        .filter((tag): tag is CachedTag => tag !== null);

      updatePlanTagsInCache(planId, newTags);

      return { previousListData, previousPlanData, planId };
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
    },
    onSettled: (_data: unknown, _err: unknown, { planId }: { planId: string }) => {
      // 完了時にサーバーと同期
      void utils.plans.getById.invalidate({ id: planId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.invalidate();
      // タグ構造が変更された可能性があるため、親タグリストも無効化
      void utils.tags.listParentTags.invalidate();
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
        console.error('Failed to add tag:', error);
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
        console.error('Failed to remove tag:', error);
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
