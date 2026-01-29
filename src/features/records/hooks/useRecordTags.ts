import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { api } from '@/lib/trpc';

// 楽観的更新用のコンテキスト型
interface OptimisticUpdateContext {
  previousListData: unknown;
  previousRecordData: unknown;
  recordId: string;
}

/**
 * レコードとタグの関連付け管理フック
 *
 * tRPC APIを使用してレコードとタグの関連付けを管理します。
 * 楽観的更新により、タグの追加・削除が即座にUIに反映されます。
 */
export function useRecordTags() {
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  // レコードキャッシュのtagIdsを楽観的に更新するヘルパー
  const updateRecordTagIdsInCache = useCallback(
    (recordId: string, newTagIds: string[]) => {
      // records.list のすべてのキャッシュを更新
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length >= 1 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'records' &&
              key[0][1] === 'list'
            );
          },
        },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((record: { id: string; tagIds?: string[] }) =>
            record.id === recordId ? { ...record, tagIds: newTagIds } : record,
          );
        },
      );

      // records.getById のキャッシュを更新
      utils.records.getById.setData({ id: recordId }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds };
      });

      utils.records.getById.setData({ id: recordId, include: { plan: true } }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds };
      });
    },
    [queryClient, utils.records.getById],
  );

  // 現在のレコードのタグIDリストを取得するヘルパー
  const getCurrentRecordTagIds = useCallback(
    (recordId: string): string[] => {
      // まず getById から取得を試みる
      const recordData = utils.records.getById.getData({ id: recordId });
      if (recordData?.tagIds) {
        return recordData.tagIds;
      }

      // list から取得を試みる
      const allQueries = queryClient.getQueriesData<Array<{ id: string; tagIds?: string[] }>>({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 1 &&
            Array.isArray(key[0]) &&
            key[0][0] === 'records' &&
            key[0][1] === 'list'
          );
        },
      });

      for (const [, data] of allQueries) {
        if (data) {
          const record = data.find((r) => r.id === recordId);
          if (record?.tagIds) {
            return record.tagIds;
          }
        }
      }

      return [];
    },
    [queryClient, utils.records.getById],
  );

  // tRPC mutations with optimistic updates
  const addTagMutation = api.records.addTag.useMutation({
    onMutate: async ({
      recordId,
      tagId,
    }: {
      recordId: string;
      tagId: string;
    }): Promise<OptimisticUpdateContext> => {
      await utils.records.list.cancel();
      await utils.records.getById.cancel({ id: recordId });

      const previousListData = utils.records.list.getData();
      const previousRecordData = utils.records.getById.getData({ id: recordId });

      const currentTagIds = getCurrentRecordTagIds(recordId);
      if (!currentTagIds.includes(tagId)) {
        updateRecordTagIdsInCache(recordId, [...currentTagIds, tagId]);
      }

      return { previousListData, previousRecordData, recordId };
    },
    onError: (
      _err: unknown,
      { recordId }: { recordId: string },
      context: OptimisticUpdateContext | undefined,
    ) => {
      if (context?.previousListData) {
        utils.records.list.setData(
          undefined,
          context.previousListData as ReturnType<typeof utils.records.list.getData>,
        );
      }
      if (context?.previousRecordData) {
        utils.records.getById.setData(
          { id: recordId },
          context.previousRecordData as ReturnType<typeof utils.records.getById.getData>,
        );
      }
    },
    onSettled: (_data: unknown, _err: unknown, { recordId }: { recordId: string }) => {
      void utils.records.getById.invalidate({ id: recordId });
      void utils.records.list.invalidate();
    },
  });

  const removeTagMutation = api.records.removeTag.useMutation({
    onMutate: async ({
      recordId,
      tagId,
    }: {
      recordId: string;
      tagId: string;
    }): Promise<OptimisticUpdateContext> => {
      await utils.records.list.cancel();
      await utils.records.getById.cancel({ id: recordId });

      const previousListData = utils.records.list.getData();
      const previousRecordData = utils.records.getById.getData({ id: recordId });

      const currentTagIds = getCurrentRecordTagIds(recordId);
      const newTagIds = currentTagIds.filter((id) => id !== tagId);
      updateRecordTagIdsInCache(recordId, newTagIds);

      return { previousListData, previousRecordData, recordId };
    },
    onError: (
      _err: unknown,
      { recordId }: { recordId: string },
      context: OptimisticUpdateContext | undefined,
    ) => {
      if (context?.previousListData) {
        utils.records.list.setData(
          undefined,
          context.previousListData as ReturnType<typeof utils.records.list.getData>,
        );
      }
      if (context?.previousRecordData) {
        utils.records.getById.setData(
          { id: recordId },
          context.previousRecordData as ReturnType<typeof utils.records.getById.getData>,
        );
      }
    },
    onSettled: (_data: unknown, _err: unknown, { recordId }: { recordId: string }) => {
      void utils.records.getById.invalidate({ id: recordId });
      void utils.records.list.invalidate();
    },
  });

  const setTagsMutation = api.records.setTags.useMutation({
    onMutate: async ({
      recordId,
      tagIds,
    }: {
      recordId: string;
      tagIds: string[];
    }): Promise<OptimisticUpdateContext> => {
      await utils.records.list.cancel();
      await utils.records.getById.cancel({ id: recordId });

      const previousListData = utils.records.list.getData();
      const previousRecordData = utils.records.getById.getData({ id: recordId });

      updateRecordTagIdsInCache(recordId, tagIds);

      return { previousListData, previousRecordData, recordId };
    },
    onError: (
      _err: unknown,
      { recordId }: { recordId: string },
      context: OptimisticUpdateContext | undefined,
    ) => {
      if (context?.previousListData) {
        utils.records.list.setData(
          undefined,
          context.previousListData as ReturnType<typeof utils.records.list.getData>,
        );
      }
      if (context?.previousRecordData) {
        utils.records.getById.setData(
          { id: recordId },
          context.previousRecordData as ReturnType<typeof utils.records.getById.getData>,
        );
      }
    },
    onSettled: (_data: unknown, _err: unknown, { recordId }: { recordId: string }) => {
      void utils.records.getById.invalidate({ id: recordId });
      void utils.records.list.invalidate();
    },
  });

  /**
   * レコードにタグを追加
   */
  const addRecordTag = useCallback(
    async (recordId: string, tagId: string): Promise<boolean> => {
      try {
        await addTagMutation.mutateAsync({ recordId, tagId });
        return true;
      } catch {
        return false;
      }
    },
    [addTagMutation],
  );

  /**
   * レコードからタグを削除
   */
  const removeRecordTag = useCallback(
    async (recordId: string, tagId: string): Promise<boolean> => {
      try {
        await removeTagMutation.mutateAsync({ recordId, tagId });
        return true;
      } catch {
        return false;
      }
    },
    [removeTagMutation],
  );

  /**
   * レコードのタグを一括設定（既存タグをすべて置換）
   */
  const setRecordTags = useCallback(
    async (recordId: string, tagIds: string[]): Promise<boolean> => {
      try {
        await setTagsMutation.mutateAsync({ recordId, tagIds });
        return true;
      } catch {
        return false;
      }
    },
    [setTagsMutation],
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
    addRecordTag,
    removeRecordTag,
    setRecordTags,
  };
}
