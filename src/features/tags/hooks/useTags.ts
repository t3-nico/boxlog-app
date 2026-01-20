// タグ管理用のtRPCフック

import { useQueryClient } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc/client';

import type { Tag } from '@/features/tags/types';

// 後方互換性のための入力型
interface LegacyTagUpdateInput {
  id: string;
  data: {
    name?: string | undefined;
    color?: string | undefined;
    description?: string | null | undefined;
    icon?: string | null | undefined;
    is_active?: boolean | undefined;
    /** 親タグのID */
    parentId?: string | null | undefined;
    /** @deprecated use parentId instead */
    group_id?: string | null | undefined;
    /** @deprecated use parentId instead */
    groupId?: string | null | undefined;
    sort_order?: number | undefined;
  };
}

// 新しい入力型（tRPC形式）
interface TrpcTagUpdateInput {
  id: string;
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
  groupId?: string | null | undefined;
}

type UpdateTagInput = LegacyTagUpdateInput | TrpcTagUpdateInput;

function isLegacyTagInput(input: UpdateTagInput): input is LegacyTagUpdateInput {
  return 'data' in input;
}

// クエリキー
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => [...tagKeys.lists()] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

// タグ一覧取得フック
export function useTags() {
  return trpc.tags.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    select: (data) => data.data, // { data: Tag[], count: number } → Tag[]
  });
}

// 単一タグ取得フック（ID別）
export function useTag(id: string) {
  return trpc.tags.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    },
  );
}

// タグ作成フック（楽観的更新付き）
export function useCreateTag() {
  const utils = trpc.useUtils();

  return trpc.tags.create.useMutation({
    // 楽観的更新: 作成直後に即座にUIを更新
    onMutate: async (input) => {
      // 進行中のフェッチをキャンセル
      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();

      // 現在のキャッシュを保存（ロールバック用）
      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      // 一時的なタグを作成（IDは仮）
      const tempId = `temp-${Date.now()}`;
      const tempTag: Tag = {
        id: tempId,
        name: input.name,
        color: input.color || '#3B82F6',
        description: input.description ?? null,
        icon: null, // サーバーで設定される
        parent_id: input.parentId ?? null,
        sort_order: 0, // 新規タグは先頭に表示
        is_active: true,
        user_id: '', // サーバーで設定される
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 楽観的にキャッシュを更新（先頭に追加）
      utils.tags.list.setData(undefined, (old) => {
        if (!old) return { data: [tempTag], count: 1 };
        return {
          ...old,
          data: [tempTag, ...old.data],
          count: old.count + 1,
        };
      });

      // 親タグリストも更新（親タグがない場合のみ追加）
      if (!input.parentId) {
        utils.tags.listParentTags.setData(undefined, (old) => {
          if (!old) return { data: [tempTag], count: 1 };
          return {
            ...old,
            data: [tempTag, ...old.data],
            count: (old.count ?? old.data.length) + 1,
          };
        });
      }

      return { previousData, previousParentTags, tempId };
    },
    // 成功時: 一時IDを本来のIDに置換
    onSuccess: (result, _input, context) => {
      if (!context?.tempId) return;

      // tags.listの一時タグを本来のタグに置換
      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) => (tag.id === context.tempId ? result : tag)),
        };
      });

      // listParentTagsも同様に置換
      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) => (tag.id === context.tempId ? result : tag)),
        };
      });
    },
    // エラー時: 元のキャッシュにロールバック
    onError: (_err, _input, context) => {
      if (context?.previousData) {
        utils.tags.list.setData(undefined, context.previousData);
      }
      if (context?.previousParentTags) {
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      }
    },
    // 完了時: サーバーと同期（念のため）
    onSettled: () => {
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
    },
  });
}

// タグ更新フック（楽観的更新付き）
export function useUpdateTag() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const mutation = trpc.tags.update.useMutation({
    // 楽観的更新: mutation開始時に即座にUIを更新
    onMutate: async (newData) => {
      // 進行中のフェッチをキャンセル（両方のキャッシュ）
      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();

      // 現在のキャッシュを保存（ロールバック用）
      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      // タグ更新のヘルパー関数
      const updateTag = (tag: Tag) => {
        if (tag.id !== newData.id) return tag;
        return {
          ...tag,
          name: newData.name ?? tag.name,
          color: newData.color ?? tag.color,
          description: newData.description !== undefined ? newData.description : tag.description,
          parent_id: newData.parentId !== undefined ? newData.parentId : tag.parent_id,
        };
      };

      // tags.list キャッシュを楽観的に更新
      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map(updateTag),
        };
      });

      // tags.listParentTags キャッシュも楽観的に更新（親タグの名前変更等に対応）
      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map(updateTag),
        };
      });

      return { previousData, previousParentTags };
    },
    // エラー時: 元のキャッシュにロールバック
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        utils.tags.list.setData(undefined, context.previousData);
      }
      if (context?.previousParentTags) {
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      }
    },
    // 完了時: サーバーと同期
    onSettled: () => {
      utils.tags.list.invalidate();
      utils.tags.listParentTags.invalidate();
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  // 既存のREST API形式({ id, data: {...} })をtRPC形式({ id, name?, color?, ... })に変換
  return {
    ...mutation,
    mutate: (input: UpdateTagInput) => {
      if (isLegacyTagInput(input)) {
        // parentId を優先、後方互換のため groupId, group_id もサポート
        // 注意: null は明示的に「親タグなし」を意味するため、!== undefined でチェック
        const parentId =
          input.data.parentId !== undefined
            ? input.data.parentId
            : input.data.groupId !== undefined
              ? input.data.groupId
              : input.data.group_id;
        return mutation.mutate({
          id: input.id,
          name: input.data.name,
          color: input.data.color,
          description: input.data.description,
          parentId,
        });
      }
      return mutation.mutate(input);
    },
    mutateAsync: async (input: UpdateTagInput) => {
      if (isLegacyTagInput(input)) {
        // parentId を優先、後方互換のため groupId, group_id もサポート
        // 注意: null は明示的に「親タグなし」を意味するため、!== undefined でチェック
        const parentId =
          input.data.parentId !== undefined
            ? input.data.parentId
            : input.data.groupId !== undefined
              ? input.data.groupId
              : input.data.group_id;
        return mutation.mutateAsync({
          id: input.id,
          name: input.data.name,
          color: input.data.color,
          description: input.data.description,
          parentId,
        });
      }
      return mutation.mutateAsync(input);
    },
  };
}

// タグ削除フック（楽観的更新付き）
export function useDeleteTag() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tags.delete.useMutation({
    // 楽観的更新: 削除直後に即座にUIを更新
    onMutate: async ({ id }) => {
      // 進行中のフェッチをキャンセル
      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();

      // 現在のキャッシュを保存（ロールバック用）
      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      // 削除するタグの子タグを特定（子タグはルートに昇格させる）
      const deletedTag = previousData?.data.find((tag) => tag.id === id);
      const childTags = previousData?.data.filter((tag) => tag.parent_id === id) ?? [];

      // 楽観的にキャッシュを更新（タグを削除、子タグはルートに昇格）
      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data
            .filter((tag) => tag.id !== id)
            .map((tag) => (tag.parent_id === id ? { ...tag, parent_id: null } : tag)),
          count: old.count - 1,
        };
      });

      // 親タグリストも更新
      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        // 削除対象を除外し、子タグを追加（ルートに昇格）
        const filteredData = old.data.filter((tag) => tag.id !== id);
        const promotedChildren = childTags.map((tag) => ({ ...tag, parent_id: null }));
        return {
          ...old,
          data: [...filteredData, ...promotedChildren],
        };
      });

      return { previousData, previousParentTags, deletedTag };
    },
    // エラー時: 元のキャッシュにロールバック
    onError: (_err, _input, context) => {
      if (context?.previousData) {
        utils.tags.list.setData(undefined, context.previousData);
      }
      if (context?.previousParentTags) {
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      }
    },
    // 完了時: サーバーと同期
    onSettled: () => {
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// タググループ移動フック（グループ間移動）
export function useMoveTag() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

// タグリネームフック
export function useRenameTag() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// タグ色変更フック
export function useUpdateTagColor() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      utils.tags.listParentTags.invalidate();
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// タグマージフック（楽観的更新付き）
export function useMergeTag() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tags.merge.useMutation({
    // 楽観的更新: マージ直後に即座にUIを更新
    onMutate: async ({ sourceTagId }) => {
      // 進行中のフェッチをキャンセル
      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();

      // 現在のキャッシュを保存（ロールバック用）
      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      // 楽観的にソースタグを削除し、子タグはルートに昇格
      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data
            .filter((tag) => tag.id !== sourceTagId)
            .map((tag) => (tag.parent_id === sourceTagId ? { ...tag, parent_id: null } : tag)),
          count: old.count - 1,
        };
      });

      // listParentTagsも楽観的に更新
      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((tag) => tag.id !== sourceTagId),
        };
      });

      return { previousData, previousParentTags };
    },
    // エラー時: 元のキャッシュにロールバック
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tags.list.setData(undefined, context.previousData);
      }
      if (context?.previousParentTags) {
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      }
    },
    // 完了時: サーバーと同期
    onSettled: () => {
      utils.tags.list.invalidate();
      utils.tags.listParentTags.invalidate();
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// タグ並び替え入力型
export interface ReorderTagInput {
  id: string;
  sort_order: number;
  parent_id: string | null;
}

// タグ並び替えフック（楽観的更新付き）
export function useReorderTags() {
  const utils = trpc.useUtils();

  return trpc.tags.reorder.useMutation({
    // 楽観的更新: ドロップ直後に即座にUIを更新
    onMutate: async ({ updates }) => {
      // tRPC のキャッシュをキャンセル
      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();

      // 現在のデータをスナップショット
      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      // tRPC utils で楽観的にキャッシュを更新
      utils.tags.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;

        const newData = oldData.data.map((tag) => {
          const update = updates.find((u) => u.id === tag.id);
          if (update) {
            return {
              ...tag,
              sort_order: update.sort_order,
              parent_id: update.parent_id,
            };
          }
          return tag;
        });

        // 明示的に新しい配列参照を作成（useMemo再計算のトリガー）
        return { ...oldData, data: [...newData] };
      });

      // listParentTagsも楽観的に更新（親タグ並び替え用）
      // 注意: 子タグ→ルートへの昇格も反映する必要がある
      const allTags = previousData?.data ?? [];
      utils.tags.listParentTags.setData(undefined, (oldData) => {
        if (!oldData) return oldData;

        // 1. 既存の親タグを更新
        let newData = oldData.data.map((tag) => {
          const update = updates.find((u) => u.id === tag.id);
          if (update) {
            return {
              ...tag,
              sort_order: update.sort_order,
              parent_id: update.parent_id,
            };
          }
          return tag;
        });

        // 2. 子→ルートに昇格したタグを追加
        const promotedToRoot = updates.filter(
          (u) => u.parent_id === null && !oldData.data.some((t) => t.id === u.id),
        );
        for (const promoted of promotedToRoot) {
          const fullTag = allTags.find((t) => t.id === promoted.id);
          if (fullTag) {
            newData.push({
              ...fullTag,
              sort_order: promoted.sort_order,
              parent_id: null,
            });
          }
        }

        // 3. ルート→子に降格したタグを削除
        const demotedFromRoot = updates.filter((u) => u.parent_id !== null);
        newData = newData.filter((tag) => !demotedFromRoot.some((d) => d.id === tag.id));

        // sort_order順でソート
        newData.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        return { ...oldData, data: [...newData] };
      });

      // ロールバック用にスナップショットを返す
      return { previousData, previousParentTags };
    },
    // エラー時はロールバック
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tags.list.setData(undefined, context.previousData);
      }
      if (context?.previousParentTags) {
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      }
    },
    // 成功時は何もしない（楽観的更新を信頼）
  });
}

// 楽観的更新ヘルパー（フラット構造）
export function useOptimisticTagUpdate() {
  const queryClient = useQueryClient();

  const updateTagOptimistically = (id: string, updates: Partial<Tag>) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: { data: Tag[] } | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
      };
    });
  };

  const addTagOptimistically = (newTag: Tag) => {
    queryClient.setQueryData(
      tagKeys.list(),
      (oldData: { data: Tag[]; count?: number } | undefined) => {
        if (!oldData) return { data: [newTag], count: 1 };
        return {
          data: [...oldData.data, newTag],
          count: (oldData.count ?? oldData.data.length) + 1,
        };
      },
    );
  };

  const removeTagOptimistically = (id: string) => {
    queryClient.setQueryData(
      tagKeys.list(),
      (oldData: { data: Tag[]; count?: number } | undefined) => {
        if (!oldData) return oldData;
        return {
          data: oldData.data.filter((tag) => tag.id !== id),
          count: (oldData.count ?? oldData.data.length) - 1,
        };
      },
    );
  };

  return {
    updateTagOptimistically,
    addTagOptimistically,
    removeTagOptimistically,
  };
}
