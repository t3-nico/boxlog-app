// タグ管理用のReact Queryフック

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { cacheStrategies } from '@/lib/tanstack-query/cache-config'

import type {
  CreateTagInput,
  Tag,
  TagWithChildren,
  TagWithChildrenResponse,
  UpdateTagInput,
} from '@/features/tags/types'

// API関数群
const tagAPI = {
  // 全タグ取得（階層構造付き）
  async fetchTags(includeChildren = true): Promise<TagWithChildren[]> {
    const params = new URLSearchParams({
      include_children: includeChildren.toString(),
      sort_field: 'name',
      sort_order: 'asc',
    })

    const response = await fetch(`/api/tags?${params}`)
    if (!response.ok) throw new Error('Failed to fetch tags')

    const data: TagWithChildrenResponse = await response.json()
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

  // タグ移動
  async moveTag(id: string, newParentId: string | null): Promise<Tag> {
    const response = await fetch('/api/tags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_id: id,
        action: 'move',
        data: { new_parent_id: newParentId },
      }),
    })

    if (!response.ok) throw new Error('Failed to move tag')

    const data = await response.json()
    return data.data
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
  async getTag(id: string): Promise<TagWithChildren> {
    const response = await fetch(`/api/tags/${id}`)
    if (!response.ok) throw new Error('Failed to fetch tag')

    const data = await response.json()
    return data.data
  },
}

// クエリキー
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...tagKeys.lists(), { filters }] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// タグ一覧取得フック
export function useTags(includeChildren = true) {
  return useQuery({
    queryKey: tagKeys.list({ includeChildren }),
    queryFn: () => tagAPI.fetchTags(includeChildren),
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

// タグ移動フック
export function useMoveTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId: string | null }) => tagAPI.moveTag(id, newParentId),
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

// 楽観的更新ヘルパー
export function useOptimisticTagUpdate() {
  const queryClient = useQueryClient()

  const updateTagOptimistically = (id: string, updates: Partial<Tag>) => {
    queryClient.setQueryData(tagKeys.list({ includeChildren: true }), (oldData: TagWithChildren[] | undefined) => {
      if (!oldData) return oldData

      const updateTagInTree = (tags: TagWithChildren[]): TagWithChildren[] => {
        return tags.map((tag) => {
          if (tag.id === id) {
            return { ...tag, ...updates }
          }
          if (tag.children) {
            return { ...tag, children: updateTagInTree(tag.children) }
          }
          return tag
        })
      }

      return updateTagInTree(oldData)
    })
  }

  const addTagOptimistically = (newTag: TagWithChildren, parentId?: string | null) => {
    queryClient.setQueryData(tagKeys.list({ includeChildren: true }), (oldData: TagWithChildren[] | undefined) => {
      if (!oldData) return [newTag]

      if (!parentId) {
        // ルートレベルに追加
        return [...oldData, newTag]
      }

      const addToParent = (tags: TagWithChildren[]): TagWithChildren[] => {
        return tags.map((tag) => {
          if (tag.id === parentId) {
            return {
              ...tag,
              children: [...(tag.children || []), newTag],
            }
          }
          if (tag.children) {
            return { ...tag, children: addToParent(tag.children) }
          }
          return tag
        })
      }

      return addToParent(oldData)
    })
  }

  const removeTagOptimistically = (id: string) => {
    queryClient.setQueryData(tagKeys.list({ includeChildren: true }), (oldData: TagWithChildren[] | undefined) => {
      if (!oldData) return oldData

      const removeFromTree = (tags: TagWithChildren[]): TagWithChildren[] => {
        return tags
          .filter((tag) => tag.id !== id)
          .map((tag) => ({
            ...tag,
            children: tag.children ? removeFromTree(tag.children) : [],
          }))
      }

      return removeFromTree(oldData)
    })
  }

  return {
    updateTagOptimistically,
    addTagOptimistically,
    removeTagOptimistically,
  }
}
