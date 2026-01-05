// タググループ管理用のtRPCフック

import { useQueryClient } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc/client';

// 型はtRPCから推論されるため、明示的なインポートは不要

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

// Query Keys
export const tagGroupKeys = {
  all: ['tag-groups'] as const,
  lists: () => [...tagGroupKeys.all, 'list'] as const,
  list: () => [...tagGroupKeys.lists()] as const,
  details: () => [...tagGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagGroupKeys.details(), id] as const,
  detailWithTags: (id: string) => [...tagGroupKeys.details(), id, 'with-tags'] as const,
};

/**
 * 全タググループ取得
 * @param options - React Query オプション（enabledなど）
 */
export function useTagGroups(options?: { enabled?: boolean }) {
  return trpc.tagGroups.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    select: (data) => data.data, // { data: TagGroup[], count: number } → TagGroup[]
    ...options,
  });
}

/**
 * 個別タググループ取得
 */
export function useTagGroup(id: string, withTags = false) {
  return trpc.tagGroups.getById.useQuery(
    { id, withTags },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    },
  );
}

/**
 * タググループ作成
 */
export function useCreateTagGroup() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tagGroups.create.useMutation({
    onSuccess: () => {
      // キャッシュを無効化して再取得
      utils.tagGroups.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
    },
  });
}

/**
 * タググループ更新
 */
export function useUpdateTagGroup() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const mutation = trpc.tagGroups.update.useMutation({
    onSuccess: () => {
      utils.tagGroups.list.invalidate();
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
          description: input.data.description,
          color: input.data.color,
          sortOrder: input.data.sort_order,
        });
      }
      return mutation.mutate(input);
    },
    mutateAsync: async (input: UpdateTagGroupInput) => {
      if (isLegacyInput(input)) {
        return mutation.mutateAsync({
          id: input.id,
          name: input.data.name,
          description: input.data.description,
          color: input.data.color,
          sortOrder: input.data.sort_order,
        });
      }
      return mutation.mutateAsync(input);
    },
  };
}

/**
 * タググループ削除
 */
export function useDeleteTagGroup() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tagGroups.delete.useMutation({
    onSuccess: () => {
      utils.tagGroups.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
      // タグ一覧も無効化（group_idがNULLになったタグがあるため）
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * タググループの並び替え（バルク更新）
 */
export function useReorderTagGroups() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.tagGroups.reorder.useMutation({
    onSuccess: () => {
      utils.tagGroups.list.invalidate();
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.all });
    },
  });
}
