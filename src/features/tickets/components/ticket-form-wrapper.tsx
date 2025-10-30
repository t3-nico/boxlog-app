'use client'

import { api } from '@/lib/trpc'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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

  // tRPC Utils（キャッシュ無効化用）
  const utils = api.useUtils()

  // tRPC Mutations
  const createMutation = api.tickets.create.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate()
    },
  })
  const updateMutation = api.tickets.update.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate()
      if (ticketId) {
        utils.tickets.getById.invalidate({ id: ticketId })
      }
    },
  })
  const deleteMutation = api.tickets.delete.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate()
    },
  })

  // 編集モードの場合、ticketデータを取得
  const { data: ticketData, isLoading: isLoadingTicket } = api.tickets.getById.useQuery(
    { id: ticketId! },
    { enabled: !!ticketId }
  )

  // 既存のタグを取得（TODO: tagsテーブルのパーミッション設定後に有効化）
  // const { data: existingTags, isLoading: isLoadingTags } = api.tickets.getTags.useQuery(
  //   { ticketId: ticketId! },
  //   { enabled: !!ticketId }
  // )
  const existingTags: never[] = []
  const isLoadingTags = false

  const isLoadingData = isLoadingTicket || isLoadingTags

  useEffect(() => {
    if (ticketData) {
      setTicket(ticketData)
    }
  }, [ticketData])

  // データ取得中の表示
  if (ticketId && isLoadingData) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

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

        toast.success('チケットを更新しました', {
          description: `「${data.title}」を更新しました`,
        })
      } else {
        // 新規作成
        const result = await createMutation.mutateAsync(data)
        createdTicketId = result.id

        // タグを追加
        for (const tagId of tagIds) {
          await addTicketTag(result.id, tagId)
        }

        toast.success('チケットを作成しました', {
          description: `「${data.title}」を作成しました`,
        })
      }
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      toast.error(ticketId ? 'チケットの更新に失敗しました' : 'チケットの作成に失敗しました', {
        description: errorMessage,
      })
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
      toast.success('チケットを削除しました', {
        description: `「${ticket?.title ?? 'チケット'}」を削除しました`,
      })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      toast.error('チケットの削除に失敗しました', {
        description: errorMessage,
      })
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
