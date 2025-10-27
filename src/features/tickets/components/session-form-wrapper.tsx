'use client'

import { api } from '@/lib/trpc'
import type { CreateSessionInput } from '@/schemas/tickets/session'
import { useEffect, useState } from 'react'
import type { Session } from '../types/session'
import { SessionForm } from './session-form'

interface SessionFormWrapperProps {
  sessionId?: string
  ticketId?: string
  onSuccess?: () => void
}

export function SessionFormWrapper({ sessionId, ticketId, onSuccess }: SessionFormWrapperProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // tRPC Mutations
  const createMutation = api.tickets.sessions.create.useMutation()
  const updateMutation = api.tickets.sessions.update.useMutation()

  // 編集モードの場合、sessionデータを取得
  const { data: sessionData } = api.tickets.sessions.getById.useQuery({ id: sessionId! }, { enabled: !!sessionId })

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData)
    }
  }, [sessionData])

  // 編集時はセッションのticketIdを使用、新規作成時は親から渡されたticketIdを使用
  const effectiveTicketId = session?.ticket_id || ticketId

  if (!effectiveTicketId) {
    return <div className="text-destructive">エラー: チケットIDが必要です</div>
  }

  const handleSubmit = async (data: CreateSessionInput) => {
    setIsSubmitting(true)
    try {
      if (sessionId) {
        // 更新
        await updateMutation.mutateAsync({ id: sessionId, data })
      } else {
        // 新規作成
        await createMutation.mutateAsync({ ...data, ticket_id: effectiveTicketId })
      }
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit session:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SessionForm
      ticketId={effectiveTicketId}
      defaultValues={session ?? undefined}
      onSubmit={handleSubmit}
      onCancel={onSuccess}
      isLoading={isSubmitting}
      submitLabel={sessionId ? '更新' : '作成'}
    />
  )
}
