import { api } from '@/lib/trpc'
import { toast } from 'sonner'
import { useTicketCacheStore } from '../stores/useTicketCacheStore'
import { useTicketInspectorStore } from '../stores/useTicketInspectorStore'

/**
 * Ticket Mutations Hook（作成・更新・削除）
 *
 * すべてのTicket操作を一元管理
 * - Toast通知
 * - キャッシュ無効化（全ビュー自動更新）
 * - Zustandキャッシュ（即座の同期）
 * - エラーハンドリング
 *
 * @example
 * ```tsx
 * const { createTicket, updateTicket, deleteTicket } = useTicketMutations()
 *
 * // 作成
 * createTicket.mutate({ title: 'New Ticket', status: 'open' })
 *
 * // 更新
 * updateTicket.mutate({ id: '123', data: { title: 'Updated' } })
 *
 * // 削除
 * deleteTicket.mutate({ id: '123' })
 * ```
 */
export function useTicketMutations() {
  const utils = api.useUtils()
  const { closeInspector, openInspector } = useTicketInspectorStore()
  const { updateCache } = useTicketCacheStore()

  // ✨ 作成
  const createTicket = api.tickets.create.useMutation({
    onSuccess: (newTicket) => {
      // 1. Toast通知
      toast.success(`Ticket "${newTicket.title}" を作成しました`, {
        action: {
          label: '開く',
          onClick: () => {
            openInspector(newTicket.id)
          },
        },
      })

      // 2. キャッシュ無効化 → すべてのビューが自動更新
      utils.tickets.list.invalidate()
      utils.tickets.getById.invalidate({ id: newTicket.id })
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`)
    },
  })

  // ✨ 更新
  const updateTicket = api.tickets.update.useMutation({
    onMutate: async ({ id, data }) => {
      // Zustandキャッシュを即座に更新（全コンポーネントに即座に反映）
      if (data.recurrence_type !== undefined || data.recurrence_rule !== undefined) {
        updateCache(id, {
          recurrence_type: data.recurrence_type,
          recurrence_rule: data.recurrence_rule,
        })
      }

      return { id }
    },
    onSuccess: (updatedTicket) => {
      toast.success('更新しました')

      // TanStack Queryキャッシュを無効化してサーバーから再取得
      utils.tickets.list.invalidate()
      utils.tickets.getById.invalidate()
    },
    onError: (err, variables, context) => {
      toast.error('更新に失敗しました')
      // エラー時はキャッシュを再取得
      if (context?.id) {
        utils.tickets.getById.invalidate({ id: context.id })
      }
    },
  })

  // ✨ 削除
  const deleteTicket = api.tickets.delete.useMutation({
    onSuccess: (_, { id }) => {
      toast.success('削除しました')

      closeInspector() // Inspectorが開いていたら閉じる
      utils.tickets.list.invalidate()
      utils.tickets.getById.invalidate({ id })
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`)
    },
  })

  // ✨ 一括更新
  const bulkUpdateTicket = api.tickets.bulkUpdate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count}件のチケットを更新しました`)
      utils.tickets.list.invalidate()
    },
    onError: (error) => {
      toast.error(`一括更新に失敗しました: ${error.message}`)
    },
  })

  // ✨ 一括削除
  const bulkDeleteTicket = api.tickets.bulkDelete.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count}件のチケットを削除しました`)
      closeInspector()
      utils.tickets.list.invalidate()
    },
    onError: (error) => {
      toast.error(`一括削除に失敗しました: ${error.message}`)
    },
  })

  return {
    createTicket,
    updateTicket,
    deleteTicket,
    bulkUpdateTicket,
    bulkDeleteTicket,
  }
}
