import { api } from '@/lib/trpc'
import { toast } from 'sonner'
import { useTicketInspectorStore } from '../stores/useTicketInspectorStore'

/**
 * Ticket Mutations Hook（作成・更新・削除）
 *
 * すべてのTicket操作を一元管理
 * - Toast通知
 * - キャッシュ無効化（全ビュー自動更新）
 * - 楽観的更新
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
      // 楽観的更新の準備
      await utils.tickets.getById.cancel({ id })

      const previousTicket = utils.tickets.getById.getData({ id })

      // 楽観的更新
      if (previousTicket) {
        utils.tickets.getById.setData({ id }, { ...previousTicket, ...data })
      }

      return { previousTicket }
    },
    onSuccess: (updatedTicket) => {
      toast.success('更新しました')

      // すべてのビューを更新
      utils.tickets.list.invalidate()
      utils.tickets.getById.invalidate({ id: updatedTicket.id })
    },
    onError: (err, variables, context) => {
      // エラー時は元に戻す
      if (context?.previousTicket) {
        utils.tickets.getById.setData({ id: variables.id }, context.previousTicket)
      }
      toast.error('更新に失敗しました')
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

  return {
    createTicket,
    updateTicket,
    deleteTicket,
  }
}
