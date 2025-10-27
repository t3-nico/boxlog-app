import { useCallback, useEffect } from 'react'

import { api } from '@/lib/trpc'
import { useTicketStore } from '../stores/useTicketStore'
import type { CreateTicketInput, Ticket, UpdateTicketInput } from '../types/ticket'

/**
 * チケット管理カスタムフック
 * tRPC API統合済み
 */
export function useTickets() {
  const {
    tickets,
    ticketsWithTags,
    filters,
    isLoading,
    error,
    setTickets,
    setTicketsWithTags,
    addTicket,
    updateTicket: updateTicketStore,
    removeTicket,
    setFilters,
    clearFilters,
    setLoading,
    setError,
    getTicketById,
    getTicketsByStatus,
    getTicketsByPriority,
    getFilteredTickets,
  } = useTicketStore()

  // tRPC Query統合
  const { data: ticketsData, isLoading: isFetchingTickets, error: fetchError } = api.tickets.list.useQuery(filters)

  // 取得したデータをStoreに同期
  useEffect(() => {
    if (ticketsData) {
      setTickets(ticketsData)
    }
  }, [ticketsData, setTickets])

  // エラーをStoreに同期
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message)
    }
  }, [fetchError, setError])

  // ローディング状態をStoreに同期
  useEffect(() => {
    setLoading(isFetchingTickets)
  }, [isFetchingTickets, setLoading])

  /**
   * チケット一覧を取得（手動リフェッチ用）
   */
  const fetchTickets = useCallback(async () => {
    // TanStack Queryが自動でリフェッチするため、この関数は後方互換性のために残す
    console.log('fetchTickets called - TanStack Query handles auto-fetching')
  }, [])

  /**
   * タグ付きチケット一覧を取得
   * 注: 現在はタグ情報を個別に取得する必要があるため、将来的に最適化
   */
  const fetchTicketsWithTags = useCallback(async () => {
    console.log('fetchTicketsWithTags - 将来の実装予定')
  }, [])

  // tRPC Mutation統合
  const createMutation = api.tickets.create.useMutation({
    onSuccess: (newTicket) => {
      addTicket(newTicket)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  /**
   * チケットを作成
   */
  const createTicket = useCallback(
    async (input: CreateTicketInput): Promise<Ticket | null> => {
      try {
        // @ts-expect-error - tRPC mutation型推論の問題（Supabase型定義との不一致）
        const newTicket = await createMutation.mutateAsync(input)
        return newTicket
      } catch (err) {
        const message = err instanceof Error ? err.message : 'チケットの作成に失敗しました'
        setError(message)
        return null
      }
    },
    [createMutation, setError]
  )

  const updateMutation = api.tickets.update.useMutation({
    onSuccess: (updatedTicket) => {
      // @ts-expect-error - tRPC mutation戻り値の型推論問題
      updateTicketStore(updatedTicket.id, updatedTicket)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  /**
   * チケットを更新
   */
  const updateTicket = useCallback(
    async (id: string, updates: UpdateTicketInput): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: updates })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'チケットの更新に失敗しました'
        setError(message)
        return false
      }
    },
    [updateMutation, setError]
  )

  const deleteMutation = api.tickets.delete.useMutation({
    onSuccess: (_, variables) => {
      removeTicket(variables.id)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  /**
   * チケットを削除
   */
  const deleteTicket = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync({ id })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'チケットの削除に失敗しました'
        setError(message)
        return false
      }
    },
    [deleteMutation, setError]
  )

  return {
    // State
    tickets,
    ticketsWithTags,
    filters,
    isLoading,
    error,

    // Actions
    fetchTickets,
    fetchTicketsWithTags,
    createTicket,
    updateTicket,
    deleteTicket,

    // Filter Actions
    setFilters,
    clearFilters,

    // Getters
    getTicketById,
    getTicketsByStatus,
    getTicketsByPriority,
    getFilteredTickets,
  }
}
