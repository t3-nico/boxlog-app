/**
 * 親タグ管理用のtRPCフック
 *
 * 以前は tag_groups テーブルを使用していたが、
 * マイグレーション後は tags テーブルの parent_id = null のタグを「親タグ」として扱う
 *
 * @deprecated これらのhookは後方互換性のために残されています。
 * 新しいコードでは useParentTags, useTags を使用してください。
 */

import { useQueryClient } from '@tanstack/react-query';

import type { Tag } from '@/features/tags/types';
import { trpc } from '@/lib/trpc/client';

// 後方互換性のための入力型
interface LegacyUpdateInput {
  id: string;
  data: {
    name?: string;
    description?: string | null;
    color?: string | null;
    sort_order?: number;
  };
}

// 新しい入力型（tRPC形式）
interface TrpcUpdateInput {
  id: string;
  name?: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
}

type UpdateTagGroupInput = LegacyUpdateInput | TrpcUpdateInput;

function isLegacyInput(input: UpdateTagGroupInput): input is LegacyUpdateInput {
  return 'data' in input;
}

// Query Keys（後方互換性のために維持）
export const tagGroupKeys = {
  all: ['tag-groups'] as const,
  lists: () => [...tagGroupKeys.all, 'list'] as const,
  list: () => [...tagGroupKeys.lists()] as const,
  details: () => [...tagGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagGroupKeys.details(), id] as const,
  detailWithTags: (id: string) => [...tagGroupKeys.details(), id, 'with-tags'] as const,
};

/**
 * 全親タグ取得（Tag 型で返す）
 * @param options - React Query オプション（enabledなど）
 * @returns Tag[] - 親タグ（parent_id = null）一覧
 *
 * @deprecated 新しいコードでは useParentTags を使用してください
 */
export function useTagGroups(options?: { enabled?: boolean }) {
  return trpc.tags.listParentTags.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    select: (data): Tag[] => data.data,
    ...options,
  });
}

/**
 * 個別親タグ取得
 * @deprecated 新しいコードでは useTags を使用してください
 */
export function useTagGroup(id: string, _withTags = false) {
  // withTags パラメータは無視（後方互換性のため引数として残す）
  return trpc.tags.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    },
  );
}

/**
 * 親タグ作成（parent_id = null のタグを作成）
 * @deprecated 新しいコードでは useCreateTag を使用してください
 */
export function useCreateTagGroup() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const mutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      // キャッシュを無効化して再取得
      utils.tags.listParentTags.invalidate();
      utils.tags.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
    },
  });

  return {
    ...mutation,
    // 後方互換性: parentId を強制的に null にして親タグとして作成
    mutate: (input: { name: string; color?: string; description?: string }) => {
      return mutation.mutate({
        name: input.name,
        color: input.color,
        description: input.description,
        parentId: null,
      });
    },
    mutateAsync: async (input: { name: string; color?: string; description?: string }) => {
      return mutation.mutateAsync({
        name: input.name,
        color: input.color,
        description: input.description,
        parentId: null,
      });
    },
  };
}

/**
 * 親タグ更新
 * @deprecated 新しいコードでは useUpdateTag を使用してください
 */
export function useUpdateTagGroup() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const mutation = trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.listParentTags.invalidate();
      utils.tags.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
    },
  });

  // 既存のREST API形式({ id, data: {...} })をtRPC形式({ id, name?, ... })に変換
  return {
    ...mutation,
    mutate: (input: UpdateTagGroupInput) => {
      if (isLegacyInput(input)) {
        return mutation.mutate({
          id: input.id,
          name: input.data.name,
          description: input.data.description ?? undefined,
          color: input.data.color ?? undefined,
        });
      }
      return mutation.mutate({
        id: input.id,
        name: input.name,
        description: input.description ?? undefined,
        color: input.color ?? undefined,
      });
    },
    mutateAsync: async (input: UpdateTagGroupInput) => {
      if (isLegacyInput(input)) {
        return mutation.mutateAsync({
          id: input.id,
          name: input.data.name,
          description: input.data.description ?? undefined,
          color: input.data.color ?? undefined,
        });
      }
      return mutation.mutateAsync({
        id: input.id,
        name: input.name,
        description: input.description ?? undefined,
        color: input.color ?? undefined,
      });
    },
  };
}

/**
 * 親タグ削除
 * @deprecated 新しいコードでは useDeleteTag を使用してください
 */
export function useDeleteTagGroup() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.listParentTags.invalidate();
      utils.tags.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
      // タグ一覧も無効化（parent_id が NULL になったタグがあるため）
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * 親タグの並び替え（バルク更新）
 * @deprecated この機能は現在使用されていません
 */
export function useReorderTagGroups() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  // TODO: tags router に reorder endpoint を追加する場合はここを更新
  // 現在は未使用のため、空のミューテーションを返す
  return {
    mutate: (_input: { items: Array<{ id: string; sort_order: number }> }) => {
      console.warn('useReorderTagGroups is not implemented yet');
    },
    mutateAsync: async (_input: { items: Array<{ id: string; sort_order: number }> }) => {
      console.warn('useReorderTagGroups is not implemented yet');
      utils.tags.listParentTags.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
    },
    isLoading: false,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
    reset: () => {},
  };
}
