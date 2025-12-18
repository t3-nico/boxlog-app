import { useCallback } from 'react'

import { api } from '@/lib/trpc'

/**
 * プラン・セッションとタグの関連付け管理フック
 *
 * tRPC APIを使用してプランとタグの関連付けを管理します。
 */
export function usePlanTags() {
  const utils = api.useUtils()

  // tRPC mutations
  const addTagMutation = api.plans.addTag.useMutation({
    onSuccess: () => {
      void utils.plans.getById.invalidate()
      void utils.plans.list.invalidate()
      void utils.plans.getTagStats.invalidate()
    },
  })

  const removeTagMutation = api.plans.removeTag.useMutation({
    onSuccess: () => {
      void utils.plans.getById.invalidate()
      void utils.plans.list.invalidate()
      void utils.plans.getTagStats.invalidate()
    },
  })

  const setTagsMutation = api.plans.setTags.useMutation({
    onSuccess: () => {
      void utils.plans.getById.invalidate()
      void utils.plans.list.invalidate()
      void utils.plans.getTagStats.invalidate()
    },
  })

  /**
   * プランにタグを追加
   */
  const addplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        await addTagMutation.mutateAsync({ planId, tagId })
        return true
      } catch (error) {
        console.error('Failed to add tag:', error)
        return false
      }
    },
    [addTagMutation]
  )

  /**
   * プランからタグを削除
   */
  const removeplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        await removeTagMutation.mutateAsync({ planId, tagId })
        return true
      } catch (error) {
        console.error('Failed to remove tag:', error)
        return false
      }
    },
    [removeTagMutation]
  )

  /**
   * プランのタグを一括設定（既存タグをすべて置換）
   */
  const setplanTags = useCallback(
    async (planId: string, tagIds: string[]): Promise<boolean> => {
      try {
        await setTagsMutation.mutateAsync({ planId, tagIds })
        return true
      } catch {
        return false
      }
    },
    [setTagsMutation]
  )

  // Combine loading states from all mutations
  const isLoading = addTagMutation.isPending || removeTagMutation.isPending || setTagsMutation.isPending

  // Get the most recent error
  const error =
    addTagMutation.error?.message ?? removeTagMutation.error?.message ?? setTagsMutation.error?.message ?? null

  return {
    // State
    isLoading,
    error,

    // plan Tag Actions
    addplanTag,
    removeplanTag,
    setplanTags,
    // Plan Tag Actions (aliases)
    addPlanTag: addplanTag,
    removePlanTag: removeplanTag,
  }
}

// Backward compatibility
export { usePlanTags as useplanTags }
