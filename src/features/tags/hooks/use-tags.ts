// タグ管理用のReact Queryフック

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { cacheStrategies } from '@/lib/tanstack-query/cache-config'

import type { CreateTagInput, Tag, TagsResponse, TagUsage, UpdateTagInput } from '@/features/tags/types'

// API関数群
const tagAPI = {
  // 全タグ取得（フラット）
  async fetchTags(): Promise<Tag[]> {
    const params = new URLSearchParams({
      sort_field: 'sort_order',
      sort_order: 'asc',
    })

    const response = await fetch(`/api/tags?${params}`)
    if (!response.ok) throw new Error('Failed to fetch tags')

    const data: TagsResponse = await response.json()
    return data.data
  },

  // タグ作成
  async createTag(input: CreateTagInput): Promise<Tag> {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) throw new Error('Failed to create tag')

    const data = await response.json()
    return data.data
  },

  // タグ更新
  async updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) throw new Error('Failed to update tag')

    const data = await response.json()
    return data.data
  },

  // タグ削除
  async deleteTag(id: string): Promise<void> {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete tag')
  },

  // タグリネーム
  async renameTag(id: string, name: string): Promise<Tag> {
    const response = await fetch('/api/tags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_id: id,
        action: 'rename',
        data: { name },
      }),
    })

    if (!response.ok) throw new Error('Failed to rename tag')

    const data = await response.json()
    return data.data
  },

  // タグ色変更
  async updateTagColor(id: string, color: string): Promise<Tag> {
    const response = await fetch('/api/tags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_id: id,
        action: 'update_color',
        data: { color },
      }),
    })

    if (!response.ok) throw new Error('Failed to update tag color')

    const data = await response.json()
    return data.data
  },

  // 単一タグ取得
  async getTag(id: string): Promise<Tag> {
    const response = await fetch(`/api/tags/${id}`)
    if (!response.ok) throw new Error('Failed to fetch tag')

    const data = await response.json()
    return data.data
  },

  // タグ使用状況取得
  async getTagUsage(id: string): Promise<TagUsage> {
    const response = await fetch(`/api/tags/${id}?usage=true`)
    if (!response.ok) throw new Error('Failed to fetch tag usage')

    const data = await response.json()
    return data.usage || { planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 }
  },
}

// クエリキー
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => [...tagKeys.lists()] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
  usage: (id: string) => [...tagKeys.all, 'usage', id] as const,
}

// タグ一覧取得フック
// @param _includeChildren - 後方互換性のため残すが、フラット構造では使用しない
export function useTags(_includeChildren = true) {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => tagAPI.fetchTags(),
    ...cacheStrategies.tags, // 標準キャッシュ（5分）
  })
}

// 単一タグ取得フック（ID別）
export function useTag(id: string) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagAPI.getTag(id),
    enabled: !!id,
    ...cacheStrategies.tags, // 標準キャッシュ（5分）
  })
}

// タグ使用状況取得フック
export function useTagUsage(id: string | undefined) {
  return useQuery({
    queryKey: tagKeys.usage(id || ''),
    queryFn: () => tagAPI.getTagUsage(id!),
    enabled: !!id,
    staleTime: 30 * 1000, // 30秒（ダイアログ表示中は再取得しない）
  })
}

// タグ作成フック
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tagAPI.createTag,
    onSuccess: () => {
      // キャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      console.error('Tag creation failed:', error)
    },
  })
}

// タグ更新フック
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagInput }) => tagAPI.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
    onError: (error) => {
      console.error('Tag update failed:', error)
    },
  })
}

// タグ削除フック
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tagAPI.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
    onError: (error) => {
      console.error('Tag deletion failed:', error)
    },
  })
}

// タググループ移動フック（グループ間移動）
export function useMoveTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, newGroupId }: { id: string; newGroupId: string | null }) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: newGroupId }),
      })

      if (!response.ok) throw new Error('Failed to move tag')
      const data = await response.json()
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      console.error('Tag move failed:', error)
    },
  })
}

// タグリネームフック
export function useRenameTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagAPI.renameTag(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
    onError: (error) => {
      console.error('Tag rename failed:', error)
    },
  })
}

// タグ色変更フック
export function useUpdateTagColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) => tagAPI.updateTagColor(id, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
    onError: (error) => {
      console.error('Tag color update failed:', error)
    },
  })
}

// タグマージフック
export function useMergeTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sourceTagId,
      targetTagId,
      mergeAssociations = true,
      deleteSource = true,
    }: {
      sourceTagId: string
      targetTagId: string
      mergeAssociations?: boolean
      deleteSource?: boolean
    }) => {
      const response = await fetch('/api/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag_id: sourceTagId,
          action: 'merge',
          data: {
            target_tag_id: targetTagId,
            merge_associations: mergeAssociations,
            delete_source: deleteSource,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to merge tags')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      // plansのキャッシュも無効化（タグ情報を含むため）
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
    onError: (error) => {
      console.error('Tag merge failed:', error)
    },
  })
}

// 楽観的更新ヘルパー（フラット構造）
export function useOptimisticTagUpdate() {
  const queryClient = useQueryClient()

  const updateTagOptimistically = (id: string, updates: Partial<Tag>) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: Tag[] | undefined) => {
      if (!oldData) return oldData
      return oldData.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag))
    })
  }

  const addTagOptimistically = (newTag: Tag) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: Tag[] | undefined) => {
      if (!oldData) return [newTag]
      return [...oldData, newTag]
    })
  }

  const removeTagOptimistically = (id: string) => {
    queryClient.setQueryData(tagKeys.list(), (oldData: Tag[] | undefined) => {
      if (!oldData) return oldData
      return oldData.filter((tag) => tag.id !== id)
    })
  }

  return {
    updateTagOptimistically,
    addTagOptimistically,
    removeTagOptimistically,
  }
}
