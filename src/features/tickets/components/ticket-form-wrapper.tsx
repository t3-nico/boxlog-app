'use client'

import { api } from '@/lib/trpc'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'
import { useEffect, useState } from 'react'
import { useTicketTags } from '../hooks/useTicketTags'
import type { Ticket } from '../types/ticket'
import { TicketFormImproved } from './ticket-form-improved'

interface TicketFormWrapperProps {
  ticketId?: string
  onSuccess?: () => void
}

export function TicketFormWrapper({ ticketId, onSuccess }: TicketFormWrapperProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addTicketTag, removeTicketTag } = useTicketTags()

  // tRPC Mutations
  const createMutation = api.tickets.create.useMutation()
  const updateMutation = api.tickets.update.useMutation()
  const deleteMutation = api.tickets.delete.useMutation()

  // 編集モードの場合、ticketデータを取得
  const { data: ticketData } = api.tickets.getById.useQuery({ id: ticketId! }, { enabled: !!ticketId })

  // 既存のタグを取得
  const { data: existingTags } = api.tickets.getTags.useQuery({ ticketId: ticketId! }, { enabled: !!ticketId })

  useEffect(() => {
    if (ticketData) {
      setTicket(ticketData)
    }
  }, [ticketData])

  const handleSubmit = async (data: CreateTicketInput, tagIds: string[]) => {
    setIsSubmitting(true)
    try {
      let createdTicketId = ticketId

      if (ticketId) {
        // 更新
        await updateMutation.mutateAsync({ id: ticketId, data })

        // タグの差分を更新
        const initialTagIds = existingTags?.map((tag: { id: string }) => tag.id) ?? []
        const addedTags = tagIds.filter((id) => !initialTagIds.includes(id))
        const removedTags = initialTagIds.filter((id) => !tagIds.includes(id))

        for (const tagId of addedTags) {
          await addTicketTag(ticketId, tagId)
        }
        for (const tagId of removedTags) {
          await removeTicketTag(ticketId, tagId)
        }
      } else {
        // 新規作成
        const result = await createMutation.mutateAsync(data)
        createdTicketId = result.id

        // タグを追加
        for (const tagId of tagIds) {
          await addTicketTag(result.id, tagId)
        }
      }
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!ticketId || !confirm('このチケットを削除しますか？\n関連するSessionも削除されます。')) {
      return
    }
    setIsSubmitting(true)
    try {
      await deleteMutation.mutateAsync({ id: ticketId })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      alert('削除に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TicketFormImproved
      defaultValues={ticket ?? undefined}
      onSubmit={handleSubmit}
      onCancel={onSuccess}
      onDelete={ticketId ? handleDelete : undefined}
      isLoading={isSubmitting}
      submitLabel={ticketId ? '更新' : '作成'}
      mode={ticketId ? 'edit' : 'create'}
    />
  )
}
