import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// 型定義
export type ItemType = 'event' | 'record' | 'task'

export interface ItemTag {
  id: string
  item_id: string
  tag_id: string
  item_type: ItemType
  user_id: string
  tagged_at: string
  created_at: string
  updated_at: string
  tags?: {
    id: string
    name: string
    color: string
    path: string
    level: number
  }
}

export interface CreateItemTagRequest {
  item_id: string
  tag_id: string
  item_type: ItemType
}

export interface BatchCreateItemTagsRequest {
  item_id: string
  tag_ids: string[]
  item_type: ItemType
}

export interface DeleteItemTagRequest {
  item_id: string
  tag_id: string
  item_type: ItemType
}

// API関数
const itemTagsAPI = {
  // アイテムのタグ取得
  async getItemTags(params: { item_id?: string; item_type?: ItemType; tag_ids?: string[] }): Promise<ItemTag[]> {
    const searchParams = new URLSearchParams()

    if (params.item_id) searchParams.set('item_id', params.item_id)
    if (params.item_type) searchParams.set('item_type', params.item_type)
    if (params.tag_ids) searchParams.set('tag_ids', params.tag_ids.join(','))

    const response = await fetch(`/api/item-tags?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch item tags')

    const data = await response.json()
    return data.data
  },

  // 単一タグ追加
  async createItemTag(request: CreateItemTagRequest): Promise<void> {
    const response = await fetch('/api/item-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) throw new Error('Failed to create item tag')
  },

  // バッチタグ更新
  async batchUpdateItemTags(request: BatchCreateItemTagsRequest): Promise<void> {
    const response = await fetch('/api/item-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) throw new Error('Failed to update item tags')
  },

  // タグ削除
  async deleteItemTag(request: DeleteItemTagRequest): Promise<void> {
    const response = await fetch('/api/item-tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) throw new Error('Failed to delete item tag')
  },
}

// クエリフィルター型
interface ItemTagsListFilters {
  item_id?: string
  item_type?: ItemType
  tag_ids?: string[]
}

// クエリキー
export const itemTagsKeys = {
  all: ['item-tags'] as const,
  lists: () => [...itemTagsKeys.all, 'list'] as const,
  list: (filters: ItemTagsListFilters) => [...itemTagsKeys.lists(), filters] as const,
  details: () => [...itemTagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemTagsKeys.details(), id] as const,
}

// アイテムのタグ取得フック
export function useItemTags(
  params: {
    item_id?: string
    item_type?: ItemType
    tag_ids?: string[]
  } = {}
) {
  return useQuery({
    queryKey: itemTagsKeys.list(params),
    queryFn: () => itemTagsAPI.getItemTags(params),
    enabled: !!(params.item_id || params.item_type || params.tag_ids),
  })
}

// 特定アイテムのタグ取得フック
export function useItemTagsByItem(item_id: string, item_type: ItemType) {
  return useQuery({
    queryKey: itemTagsKeys.list({ item_id, item_type }),
    queryFn: () => itemTagsAPI.getItemTags({ item_id, item_type }),
    enabled: !!item_id && !!item_type,
  })
}

// 特定タグのアイテム取得フック
export function useItemsByTags(tag_ids: string[], item_type?: ItemType) {
  return useQuery({
    queryKey: itemTagsKeys.list({ tag_ids, ...(item_type !== undefined && { item_type }) }),
    queryFn: () => itemTagsAPI.getItemTags({ tag_ids, ...(item_type !== undefined && { item_type }) }),
    enabled: tag_ids.length > 0,
  })
}

// 単一タグ追加フック
export function useCreateItemTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: itemTagsAPI.createItemTag,
    onSuccess: (_, variables) => {
      // 関連するクエリを無効化
      queryClient.invalidateQueries({
        queryKey: itemTagsKeys.lists(),
      })
      // 特定のアイテムのクエリも無効化
      queryClient.invalidateQueries({
        queryKey: itemTagsKeys.list({
          item_id: variables.item_id,
          item_type: variables.item_type,
        }),
      })
    },
  })
}

// バッチタグ更新フック
export function useBatchUpdateItemTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: itemTagsAPI.batchUpdateItemTags,
    onSuccess: (_, variables) => {
      // 関連するクエリを無効化
      queryClient.invalidateQueries({
        queryKey: itemTagsKeys.lists(),
      })
      // 特定のアイテムのクエリも無効化
      queryClient.invalidateQueries({
        queryKey: itemTagsKeys.list({
          item_id: variables.item_id,
          item_type: variables.item_type,
        }),
      })
      // タグ統計も更新
      queryClient.invalidateQueries({
        queryKey: ['tag-stats'],
      })
    },
  })
}

// タグ削除フック
export function useDeleteItemTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: itemTagsAPI.deleteItemTag,
    onSuccess: (_, variables) => {
      // 関連するクエリを無効化
      queryClient.invalidateQueries({
        queryKey: itemTagsKeys.lists(),
      })
      // 特定のアイテムのクエリも無効化
      queryClient.invalidateQueries({
        queryKey: itemTagsKeys.list({
          item_id: variables.item_id,
          item_type: variables.item_type,
        }),
      })
      // タグ統計も更新
      queryClient.invalidateQueries({
        queryKey: ['tag-stats'],
      })
    },
  })
}

// 楽観的更新ヘルパー
export function useItemTagsOptimisticUpdate() {
  const queryClient = useQueryClient()

  const optimisticAdd = (params: CreateItemTagRequest, tag: ItemTag['tags']) => {
    const queryKey = itemTagsKeys.list({
      item_id: params.item_id,
      item_type: params.item_type,
    })

    queryClient.setQueryData(queryKey, (old: ItemTag[] = []) => {
      const newItemTag: ItemTag = {
        id: `temp-${Date.now()}`,
        item_id: params.item_id,
        tag_id: params.tag_id,
        item_type: params.item_type,
        user_id: '',
        tagged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(tag !== undefined && { tags: tag }),
      }
      return [...old, newItemTag]
    })
  }

  const optimisticRemove = (params: DeleteItemTagRequest) => {
    const queryKey = itemTagsKeys.list({
      item_id: params.item_id,
      item_type: params.item_type,
    })

    queryClient.setQueryData(queryKey, (old: ItemTag[] = []) => {
      return old.filter((item) => item.tag_id !== params.tag_id)
    })
  }

  const optimisticBatchUpdate = (params: BatchCreateItemTagsRequest, tags: ItemTag['tags'][]) => {
    const queryKey = itemTagsKeys.list({
      item_id: params.item_id,
      item_type: params.item_type,
    })

    queryClient.setQueryData(queryKey, () => {
      return params.tag_ids.map((tag_id, index) => ({
        id: `temp-${Date.now()}-${index}`,
        item_id: params.item_id,
        tag_id,
        item_type: params.item_type,
        user_id: '',
        tagged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: tags[index],
      }))
    })
  }

  return {
    optimisticAdd,
    optimisticRemove,
    optimisticBatchUpdate,
  }
}
