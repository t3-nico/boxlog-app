import { useCallback, useEffect } from 'react'

import { trpc } from '@/lib/trpc'
import { useSessionStore } from '../stores/useSessionStore'
import type { CreateSessionInput, Session, UpdateSessionInput } from '../types/session'

/**
 * セッション管理カスタムフック
 * tRPC API統合済み
 */
export function useSessions() {
  const {
    sessions,
    sessionsWithTags,
    filters,
    isLoading,
    error,
    activeSessionId,
    setSessions,
    setSessionsWithTags,
    addSession,
    updateSession: updateSessionStore,
    removeSession,
    startSession: startSessionStore,
    stopSession: stopSessionStore,
    setActiveSession,
    setFilters,
    clearFilters,
    setLoading,
    setError,
    getSessionById,
    getSessionsByTicketId,
    getSessionsByStatus,
    getActiveSession,
    getFilteredSessions,
    getSessionDuration,
  } = useSessionStore()

  // tRPC Query統合
  const {
    data: sessionsData,
    isLoading: isFetchingSessions,
    error: fetchError,
  } = trpc.tickets.sessions.list.useQuery(filters)

  // 取得したデータをStoreに同期
  useEffect(() => {
    if (sessionsData) {
      setSessions(sessionsData)
    }
  }, [sessionsData, setSessions])

  // エラーをStoreに同期
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message)
    }
  }, [fetchError, setError])

  // ローディング状態をStoreに同期
  useEffect(() => {
    setLoading(isFetchingSessions)
  }, [isFetchingSessions, setLoading])

  /**
   * セッション一覧を取得（手動リフェッチ用）
   */
  const fetchSessions = useCallback(async () => {
    // TanStack Queryが自動でリフェッチするため、この関数は後方互換性のために残す
    console.log('fetchSessions called - TanStack Query handles auto-fetching')
  }, [])

  /**
   * タグ付きセッション一覧を取得
   * 注: 現在はタグ情報を個別に取得する必要があるため、将来的に最適化
   */
  const fetchSessionsWithTags = useCallback(async () => {
    console.log('fetchSessionsWithTags - 将来の実装予定')
  }, [])

  // tRPC Mutation統合
  const createMutation = trpc.tickets.sessions.create.useMutation({
    onSuccess: (newSession) => {
      addSession(newSession)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  /**
   * セッションを作成
   */
  const createSession = useCallback(
    async (input: CreateSessionInput): Promise<Session | null> => {
      try {
        const newSession = await createMutation.mutateAsync(input)
        return newSession
      } catch (err) {
        const message = err instanceof Error ? err.message : 'セッションの作成に失敗しました'
        setError(message)
        return null
      }
    },
    [createMutation, setError]
  )

  const updateMutation = trpc.tickets.sessions.update.useMutation({
    onSuccess: (updatedSession) => {
      updateSessionStore(updatedSession.id, updatedSession)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  /**
   * セッションを更新
   */
  const updateSession = useCallback(
    async (id: string, updates: UpdateSessionInput): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: updates })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'セッションの更新に失敗しました'
        setError(message)
        return false
      }
    },
    [updateMutation, setError]
  )

  const deleteMutation = trpc.tickets.sessions.delete.useMutation({
    onSuccess: (_, variables) => {
      removeSession(variables.id)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  /**
   * セッションを削除
   */
  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync({ id })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'セッションの削除に失敗しました'
        setError(message)
        return false
      }
    },
    [deleteMutation, setError]
  )

  /**
   * セッションを開始
   */
  const startSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const now = new Date().toISOString()
        await updateMutation.mutateAsync({
          id,
          data: {
            actual_start: now,
            status: 'in_progress',
          },
        })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'セッションの開始に失敗しました'
        setError(message)
        return false
      }
    },
    [updateMutation, setError]
  )

  /**
   * セッションを停止
   */
  const stopSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const now = new Date().toISOString()
        await updateMutation.mutateAsync({
          id,
          data: {
            actual_end: now,
            status: 'completed',
          },
        })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'セッションの停止に失敗しました'
        setError(message)
        return false
      }
    },
    [updateMutation, setError]
  )

  return {
    // State
    sessions,
    sessionsWithTags,
    filters,
    isLoading,
    error,
    activeSessionId,

    // Actions
    fetchSessions,
    fetchSessionsWithTags,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    stopSession,
    setActiveSession,

    // Filter Actions
    setFilters,
    clearFilters,

    // Getters
    getSessionById,
    getSessionsByTicketId,
    getSessionsByStatus,
    getActiveSession,
    getFilteredSessions,
    getSessionDuration,
  }
}
