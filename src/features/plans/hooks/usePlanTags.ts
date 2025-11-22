import { useCallback, useState } from 'react'

import { api } from '@/lib/trpc'

/**
 * チケット・セッションとタグの関連付け管理フック
 * tRPC API統合済み
 */
export function usePlanTags() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const utils = api.useUtils()

  // tRPC Mutation統合（チケットタグ）
  const addTicketTagMutation = api.plans.addTag.useMutation({
    onSuccess: () => {
      // チケットデータを再取得
      utils.plans.getById.invalidate()
      utils.plans.list.invalidate()
    },
  })
  const removeTicketTagMutation = api.plans.removeTag.useMutation({
    onSuccess: () => {
      // チケットデータを再取得
      utils.plans.getById.invalidate()
      utils.plans.list.invalidate()
    },
  })

  /**
   * チケットにタグを追加
   */
  const addTicketTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await addTicketTagMutation.mutateAsync({ planId, tagId })

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの追加に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [addTicketTagMutation]
  )

  /**
   * チケットからタグを削除
   */
  const removeTicketTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await removeTicketTagMutation.mutateAsync({ planId, tagId })

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの削除に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [removeTicketTagMutation]
  )

  /**
   * チケットのタグを一括設定
   * 注: Phase 4以降でtRPC APIに一括設定エンドポイントを追加予定
   * 現在はaddTicketTag/removeTicketTagを使用してください
   */
  const setTicketTags = useCallback(async (planId: string, tagIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Phase 4でtRPC APIに一括設定エンドポイントを追加
      // 現在は個別のaddTicketTag/removeTicketTagを使用
      console.warn('setTicketTags is not yet implemented. Use addTicketTag/removeTicketTag instead.')

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

    // Ticket Tag Actions
    addTicketTag,
    removeTicketTag,
    setTicketTags,
  }
}

// Backward compatibility
export { addPlanTag as addTicketTag, removePlanTag as removeTicketTag, usePlanTags as useTicketTags }
