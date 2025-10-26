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
   * 注: Phase 4以降でtRPC APIに一括設定エンドポイントを追加予定
   * 現在はaddTicketTag/removeTicketTagを使用してください
   */
  const setTicketTags = useCallback(async (ticketId: string, tagIds: string[]): Promise<boolean> => {
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
   * 注: Phase 4以降でtRPC APIに一括設定エンドポイントを追加予定
   * 現在はaddSessionTag/removeSessionTagを使用してください
   */
  const setSessionTags = useCallback(async (sessionId: string, tagIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Phase 4でtRPC APIに一括設定エンドポイントを追加
      // 現在は個別のaddSessionTag/removeSessionTagを使用
      console.warn('setSessionTags is not yet implemented. Use addSessionTag/removeSessionTag instead.')

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

    // Session Tag Actions
    addSessionTag,
    removeSessionTag,
    setSessionTags,
  }
}
