import { useCallback, useState } from 'react'

import { api } from '@/lib/trpc'

/**
 * プラン・セッションとタグの関連付け管理フック
 * tRPC API統合済み
 */
export function usePlanTags() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const utils = api.useUtils()

  // tRPC Mutation統合（プランタグ）
  const addplanTagMutation = api.plans.addTag.useMutation({
    onSuccess: () => {
      // プランデータを再取得
      utils.plans.getById.invalidate()
      utils.plans.list.invalidate()
    },
  })
  const removeplanTagMutation = api.plans.removeTag.useMutation({
    onSuccess: () => {
      // プランデータを再取得
      utils.plans.getById.invalidate()
      utils.plans.list.invalidate()
    },
  })

  /**
   * プランにタグを追加
   */
  const addplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await addplanTagMutation.mutateAsync({ planId, tagId })

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの追加に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [addplanTagMutation]
  )

  /**
   * プランからタグを削除
   */
  const removeplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await removeplanTagMutation.mutateAsync({ planId, tagId })

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの削除に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [removeplanTagMutation]
  )

  /**
   * プランのタグを一括設定
   * 注: Phase 4以降でtRPC APIに一括設定エンドポイントを追加予定
   * 現在はaddplanTag/removeplanTagを使用してください
   */
  const setplanTags = useCallback(async (planId: string, tagIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Phase 4でtRPC APIに一括設定エンドポイントを追加
      // 現在は個別のaddplanTag/removeplanTagを使用
      console.warn('setplanTags is not yet implemented. Use addplanTag/removeplanTag instead.')

      setIsLoading(false)
      return false
    } catch (err) {
      const message = err instanceof Error ? err.message : 'タグの設定に失敗しました'
      setError(message)
      setIsLoading(false)
      return false
    }
  }, [])

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
