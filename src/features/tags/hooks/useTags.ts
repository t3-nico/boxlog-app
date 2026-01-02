// タグ管理用のtRPCフック

import { useQueryClient } from '@tanstack/react-query'

import { trpc } from '@/lib/trpc/client'

import type { Tag } from '@/features/tags/types'

// クエリキー
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => [...tagKeys.lists()] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// タグ一覧取得フック
export function useTags() {
  return trpc.tags.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    select: (data) => data.data, // { data: Tag[], count: number } → Tag[]
  })
}

// 単一タグ取得フック（ID別）
export function useTag(id: string) {
  return trpc.tags.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    },
  )
}

// タグ使用状況取得フック（互換性のため残す - 未実装）
export function useTagUsage(id: string | undefined) {
  // TODO: tRPCルーターに使用状況エンドポイントを追加
  return {
    data: undefined,
    isLoading: false,
    error: null,
  }
}

// タグ作成フック
export function useCreateTag() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.tags.create.useMutation({
    onSuccess: () => {
      // キャッシュを無効化して再取得
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// タグ更新フック
export function useUpdateTag() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()
  const mutation = trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })

  // 既存のREST API形式({ id, data: {...} })をtRPC形式({ id, name?, color?, ... })に変換
  return {
    ...mutation,
    mutate: (input: any) => {
      if (input.data) {
        return mutation.mutate({
          id: input.id,
          name: input.data.name,
          color: input.data.color,
          description: input.data.description,
          groupId: input.data.group_id,
        })
      }
      return mutation.mutate(input)
    },
    mutateAsync: async (input: any) => {
      if (input.data) {
        return mutation.mutateAsync({
          id: input.id,
          name: input.data.name,
          color: input.data.color,
          description: input.data.description,
          groupId: input.data.group_id,
        })
      }
      return mutation.mutateAsync(input)
    },
  }
}

// タグ削除フック
export function useDeleteTag() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// タググループ移動フック（グループ間移動）
export function useMoveTag() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

// タグリネームフック
export function useRenameTag() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// タグ色変更フック
export function useUpdateTagColor() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// タグマージフック
export function useMergeTag() {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.tags.merge.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate()
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// 楽観的更新ヘルパー（フラット構造）
export function useOptimisticTagUpdate() {
  const queryClient = useQueryClient()

  const updateTagOptimistically = (id: string, updates: Partial<Tag>) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: { data: Tag[] } | undefined) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        data: oldData.data.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
      }
    })
  }

  const addTagOptimistically = (newTag: Tag) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: { data: Tag[] } | undefined) => {
      if (!oldData) return { data: [newTag], count: 1 }
      return {
        data: [...oldData.data, newTag],
        count: oldData.count + 1,
      }
    })
  }

  const removeTagOptimistically = (id: string) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: { data: Tag[] } | undefined) => {
      if (!oldData) return oldData
      return {
        data: oldData.data.filter((tag) => tag.id !== id),
        count: oldData.count - 1,
      }
    })
  }

  return {
    updateTagOptimistically,
    addTagOptimistically,
    removeTagOptimistically,
  }
}
