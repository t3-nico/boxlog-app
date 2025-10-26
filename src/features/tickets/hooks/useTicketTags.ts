import { useCallback, useState } from 'react'

import { api } from '@/lib/trpc'

/**
 * チケット・セッションとタグの関連付け管理フック
 * tRPC API統合済み
 */
export function useTicketTags() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // tRPC Mutation統合（チケットタグ）
  const addTicketTagMutation = api.tickets.addTag.useMutation()
  const removeTicketTagMutation = api.tickets.removeTag.useMutation()

  // tRPC Mutation統合（セッションタグ）
  const addSessionTagMutation = api.tickets.addSessionTag.useMutation()
  const removeSessionTagMutation = api.tickets.removeSessionTag.useMutation()

  /**
   * チケットにタグを追加
   */
  const addTicketTag = useCallback(
    async (ticketId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await addTicketTagMutation.mutateAsync({ ticketId, tagId })

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
    async (ticketId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await removeTicketTagMutation.mutateAsync({ ticketId, tagId })

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
   * 注: 現在の既存タグをすべて削除し、新しいタグセットを適用
   * 将来的にtRPC APIで一括設定エンドポイントを追加予定
   */
  const setTicketTags = useCallback(
    async (ticketId: string, tagIds: string[]): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        // 既存のタグを取得
        const existingTags = await api.tickets.getTags.query({ ticketId })

        // 既存タグをすべて削除
        for (const tag of existingTags) {
          if (tag?.id) {
            await removeTicketTagMutation.mutateAsync({ ticketId, tagId: tag.id })
          }
        }

        // 新しいタグを追加
        for (const tagId of tagIds) {
          await addTicketTagMutation.mutateAsync({ ticketId, tagId })
        }

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの設定に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [addTicketTagMutation, removeTicketTagMutation]
  )

  /**
   * セッションにタグを追加
   */
  const addSessionTag = useCallback(
    async (sessionId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await addSessionTagMutation.mutateAsync({ sessionId, tagId })

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの追加に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [addSessionTagMutation]
  )

  /**
   * セッションからタグを削除
   */
  const removeSessionTag = useCallback(
    async (sessionId: string, tagId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        await removeSessionTagMutation.mutateAsync({ sessionId, tagId })

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの削除に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [removeSessionTagMutation]
  )

  /**
   * セッションのタグを一括設定
   * 注: 現在の既存タグをすべて削除し、新しいタグセットを適用
   * 将来的にtRPC APIで一括設定エンドポイントを追加予定
   */
  const setSessionTags = useCallback(
    async (sessionId: string, tagIds: string[]): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        // 既存のタグを取得
        const existingTags = await api.tickets.getSessionTags.query({ sessionId })

        // 既存タグをすべて削除
        for (const tag of existingTags) {
          if (tag?.id) {
            await removeSessionTagMutation.mutateAsync({ sessionId, tagId: tag.id })
          }
        }

        // 新しいタグを追加
        for (const tagId of tagIds) {
          await addSessionTagMutation.mutateAsync({ sessionId, tagId })
        }

        setIsLoading(false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'タグの設定に失敗しました'
        setError(message)
        setIsLoading(false)
        return false
      }
    },
    [addSessionTagMutation, removeSessionTagMutation]
  )

  return {
    // State
    isLoading,
    error,

    // Ticket Tag Actions
    addTicketTag,
    removeTicketTag,
    setTicketTags,

    // Session Tag Actions
    addSessionTag,
    removeSessionTag,
    setSessionTags,
  }
}
