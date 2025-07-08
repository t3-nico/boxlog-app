// スマートフォルダのReact Query hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SmartFolder, CreateSmartFolderInput, UpdateSmartFolderInput } from '@/types/smart-folders'

// API関数
const fetchSmartFolders = async (): Promise<SmartFolder[]> => {
  // 空の配列を返す（見出しのみ表示）
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([])
    }, 100)
  })
  
  /* 実際のAPI呼び出し（一時的にコメントアウト）
  const response = await fetch('/api/smart-folders')
  if (!response.ok) {
    throw new Error('Failed to fetch smart folders')
  }
  const data = await response.json()
  return data.data
  */
}

const createSmartFolder = async (input: CreateSmartFolderInput): Promise<SmartFolder> => {
  const response = await fetch('/api/smart-folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error('Failed to create smart folder')
  }
  const data = await response.json()
  return data.data
}

const updateSmartFolder = async (id: string, input: UpdateSmartFolderInput): Promise<SmartFolder> => {
  const response = await fetch(`/api/smart-folders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error('Failed to update smart folder')
  }
  const data = await response.json()
  return data.data
}

const deleteSmartFolder = async (id: string): Promise<void> => {
  const response = await fetch(`/api/smart-folders/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete smart folder')
  }
}

const reorderSmartFolders = async (folderOrders: Array<{ id: string; orderIndex: number }>): Promise<void> => {
  const response = await fetch('/api/smart-folders/reorder', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folderOrders }),
  })
  if (!response.ok) {
    throw new Error('Failed to reorder smart folders')
  }
}

// Query keys
export const smartFolderKeys = {
  all: ['smart-folders'] as const,
  lists: () => [...smartFolderKeys.all, 'list'] as const,
  list: (filters: string) => [...smartFolderKeys.lists(), { filters }] as const,
  details: () => [...smartFolderKeys.all, 'detail'] as const,
  detail: (id: string) => [...smartFolderKeys.details(), id] as const,
}

// Hooks
export function useSmartFolders() {
  return useQuery({
    queryKey: smartFolderKeys.lists(),
    queryFn: fetchSmartFolders,
    staleTime: 5 * 60 * 1000, // 5分
    refetchOnWindowFocus: false,
  })
}

export function useCreateSmartFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSmartFolder,
    onMutate: async (newFolder) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: smartFolderKeys.lists() })
      
      const previousFolders = queryClient.getQueryData<SmartFolder[]>(smartFolderKeys.lists())
      
      // 新しいフォルダを一時的に追加
      const optimisticFolder: SmartFolder = {
        id: 'temp-' + Date.now(),
        name: newFolder.name,
        description: newFolder.description,
        userId: 'current-user', // 実際のユーザーIDを設定
        rules: newFolder.rules || [],
        isActive: true,
        orderIndex: newFolder.orderIndex || 0,
        icon: newFolder.icon,
        color: newFolder.color || '#3B82F6',
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      if (previousFolders) {
        queryClient.setQueryData<SmartFolder[]>(
          smartFolderKeys.lists(),
          [...previousFolders, optimisticFolder]
        )
      }
      
      return { previousFolders }
    },
    onError: (err, newFolder, context) => {
      // エラー時にロールバック
      if (context?.previousFolders) {
        queryClient.setQueryData(smartFolderKeys.lists(), context.previousFolders)
      }
    },
    onSettled: () => {
      // 成功・失敗にかかわらずデータを再取得
      queryClient.invalidateQueries({ queryKey: smartFolderKeys.lists() })
    },
  })
}

export function useUpdateSmartFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateSmartFolderInput) =>
      updateSmartFolder(id, input),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: smartFolderKeys.lists() })
      
      const previousFolders = queryClient.getQueryData<SmartFolder[]>(smartFolderKeys.lists())
      
      if (previousFolders) {
        const updatedFolders = previousFolders.map(folder =>
          folder.id === id
            ? { ...folder, ...updates, updatedAt: new Date() }
            : folder
        )
        queryClient.setQueryData<SmartFolder[]>(smartFolderKeys.lists(), updatedFolders)
      }
      
      return { previousFolders }
    },
    onError: (err, variables, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(smartFolderKeys.lists(), context.previousFolders)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: smartFolderKeys.lists() })
    },
  })
}

export function useDeleteSmartFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSmartFolder,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: smartFolderKeys.lists() })
      
      const previousFolders = queryClient.getQueryData<SmartFolder[]>(smartFolderKeys.lists())
      
      if (previousFolders) {
        const filteredFolders = previousFolders.filter(folder => folder.id !== deletedId)
        queryClient.setQueryData<SmartFolder[]>(smartFolderKeys.lists(), filteredFolders)
      }
      
      return { previousFolders }
    },
    onError: (err, deletedId, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(smartFolderKeys.lists(), context.previousFolders)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: smartFolderKeys.lists() })
    },
  })
}

export function useReorderSmartFolders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderSmartFolders,
    onMutate: async (folderOrders) => {
      await queryClient.cancelQueries({ queryKey: smartFolderKeys.lists() })
      
      const previousFolders = queryClient.getQueryData<SmartFolder[]>(smartFolderKeys.lists())
      
      if (previousFolders) {
        const reorderedFolders = [...previousFolders].sort((a, b) => {
          const orderA = folderOrders.find(o => o.id === a.id)?.orderIndex ?? a.orderIndex
          const orderB = folderOrders.find(o => o.id === b.id)?.orderIndex ?? b.orderIndex
          return orderA - orderB
        })
        
        queryClient.setQueryData<SmartFolder[]>(smartFolderKeys.lists(), reorderedFolders)
      }
      
      return { previousFolders }
    },
    onError: (err, folderOrders, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(smartFolderKeys.lists(), context.previousFolders)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: smartFolderKeys.lists() })
    },
  })
}

// 複製用のヘルパーフック
export function useDuplicateSmartFolder() {
  const createMutation = useCreateSmartFolder()
  
  return useMutation({
    mutationFn: async (folder: SmartFolder) => {
      const duplicateInput: CreateSmartFolderInput = {
        name: `${folder.name} (Copy)`,
        description: folder.description,
        rules: folder.rules,
        icon: folder.icon,
        color: folder.color,
        orderIndex: folder.orderIndex + 1,
      }
      
      return createMutation.mutateAsync(duplicateInput)
    },
  })
}

// フォルダの有効/無効切り替え
export function useToggleSmartFolder() {
  const updateMutation = useUpdateSmartFolder()
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return updateMutation.mutateAsync({ id, isActive })
    },
  })
}