import { useCallback, useState } from 'react'

import { api } from '@/lib/trpc'

/**
 * プラン・セッションとタグの関連付け管理フック
 *
 * 注意: tRPC APIへのaddTag/removeTagエンドポイント追加が必要
 * 現在はスタブ実装で、将来のAPI実装後に有効化予定
 */
export function usePlanTags() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const utils = api.useUtils()

  /**
   * プランにタグを追加
   * TODO: tRPC APIにaddTagエンドポイント追加後に実装
   */
  const addplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        // TODO: REST API または tRPC エンドポイント実装後に有効化
        console.warn(`addplanTag: planId=${planId}, tagId=${tagId} - API not yet implemented`)

        // キャッシュ無効化（API実装後に有効）
        await utils.plans.getById.invalidate()
        await utils.plans.list.invalidate()

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの追加に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [utils.plans.getById, utils.plans.list]
  )

  /**
   * プランからタグを削除
   * TODO: tRPC APIにremoveTagエンドポイント追加後に実装
   */
  const removeplanTag = useCallback(
    async (planId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        // TODO: REST API または tRPC エンドポイント実装後に有効化
        console.warn(`removeplanTag: planId=${planId}, tagId=${tagId} - API not yet implemented`)

        // キャッシュ無効化（API実装後に有効）
        await utils.plans.getById.invalidate()
        await utils.plans.list.invalidate()

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの削除に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [utils.plans.getById, utils.plans.list]
  )

  /**
   * プランのタグを一括設定
   * TODO: tRPC APIに一括設定エンドポイント追加後に実装
   */
  const setplanTags = useCallback(async (_planId: string, _tagIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: REST API または tRPC エンドポイント実装後に有効化
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
