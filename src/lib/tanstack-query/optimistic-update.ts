/**
 * TanStack Query の楽観的更新ヘルパー
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * 楽観的更新ヘルパー（汎用版）
 *
 * @example
 * const optimistic = createOptimisticUpdateHelper<Tag[], Tag>(
 *   queryClient,
 *   tagKeys.lists()
 * )
 *
 * optimistic.add(newTag)
 * optimistic.update(tagId, { name: 'Updated' })
 * optimistic.remove(tagId)
 */
export function createOptimisticUpdateHelper<TData extends unknown[], TItem extends { id: string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
) {
  return {
    /**
     * アイテムを追加
     */
    add: (newItem: TItem) => {
      queryClient.setQueryData<TData>(queryKey, (oldData) => {
        if (!oldData) return [newItem] as TData;
        return [...oldData, newItem] as TData;
      });
    },

    /**
     * アイテムを更新
     */
    update: (id: string, updates: Partial<TItem>) => {
      queryClient.setQueryData<TData>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((item) => {
          const typedItem = item as TItem & { id: string };
          return typedItem.id === id ? ({ ...typedItem, ...updates } as TItem) : item;
        }) as TData;
      });
    },

    /**
     * アイテムを削除
     */
    remove: (id: string) => {
      queryClient.setQueryData<TData>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((item) => (item as TItem & { id: string }).id !== id) as TData;
      });
    },

    /**
     * 全てのアイテムを入れ替え
     */
    replace: (newData: TData) => {
      queryClient.setQueryData<TData>(queryKey, newData);
    },

    /**
     * キャッシュを無効化
     */
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Mutation用の楽観的更新パターン
 *
 * @example
 * return useMutation({
 *   mutationFn: createTag,
 *   ...createMutationWithOptimisticUpdate(queryClient, {
 *     queryKey: tagKeys.lists(),
 *     onMutate: async (newTag) => {
 *       await queryClient.cancelQueries({ queryKey: tagKeys.lists() })
 *       const previous = queryClient.getQueryData(tagKeys.lists())
 *       queryClient.setQueryData(tagKeys.lists(), (old) => [...old, newTag])
 *       return { previous }
 *     },
 *   }),
 * })
 */
export function createMutationWithOptimisticUpdate<TVariables, TContext = unknown>(
  queryClient: QueryClient,
  config: {
    queryKey: unknown[];
    onMutate: (variables: TVariables) => Promise<TContext>;
    onError?: (error: unknown, variables: TVariables, context: TContext | undefined) => void;
    onSettled?: () => void;
  },
) {
  return {
    onMutate: async (variables: TVariables) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      // カスタムの onMutate を実行
      return config.onMutate(variables);
    },

    onError: (error: unknown, variables: TVariables, context: TContext | undefined) => {
      // エラー時: カスタムエラーハンドリング
      if (config.onError) {
        config.onError(error, variables, context);
      }
    },

    onSettled: () => {
      // 成功・失敗にかかわらず、データを再取得
      queryClient.invalidateQueries({ queryKey: config.queryKey });

      if (config.onSettled) {
        config.onSettled();
      }
    },
  };
}

/**
 * ロールバック用のコンテキストを作成
 *
 * @example
 * const rollback = createRollbackContext(queryClient, tagKeys.lists())
 *
 * // Mutation内で使用
 * onMutate: async () => {
 *   return rollback.snapshot()
 * },
 * onError: (err, variables, context) => {
 *   rollback.restore(context)
 * }
 */
export function createRollbackContext<TData>(queryClient: QueryClient, queryKey: unknown[]) {
  return {
    /**
     * 現在のデータのスナップショットを作成
     */
    snapshot: () => {
      return {
        previousData: queryClient.getQueryData<TData>(queryKey),
      };
    },

    /**
     * スナップショットからデータを復元
     */
    restore: (context: { previousData: TData | undefined } | undefined) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData<TData>(queryKey, context.previousData);
      }
    },
  };
}
