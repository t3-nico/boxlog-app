import { api } from '@/lib/trpc'
import type { UpdateTicketInput } from '@/schemas/plans/plan'
import { toast } from 'sonner'
import { useTicketCacheStore } from '../stores/usePlanCacheStore'
import { useTicketInspectorStore } from '../stores/usePlanInspectorStore'

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
export function usePlanMutations() {
  const utils = api.useUtils()
  const { closeInspector, openInspector } = useTicketInspectorStore()
  const { updateCache, setIsMutating } = useTicketCacheStore()

  // ✨ 作成
  const createTicket = api.plans.create.useMutation({
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

      // 2. キャッシュ無効化 + 即座に再フェッチ → すべてのビューが自動更新
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
      void utils.plans.getById.invalidate({ id: newTicket.id }, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`)
    },
  })

  // ✨ 更新
  const updateTicket = api.plans.update.useMutation({
    onMutate: async ({ id, data }) => {
      // 0. mutation開始フラグを設定（Realtime二重更新防止）
      setIsMutating(true)

      // 1. 進行中のクエリをキャンセル（競合回避）
      await utils.plans.list.cancel()
      await utils.plans.getById.cancel({ id })

      // 2. 現在のデータをスナップショット（ロールバック用）
      const previousTickets = utils.plans.list.getData()
      const previousTicket = utils.plans.getById.getData({ id })

      // 3. 楽観的更新: Zustandキャッシュを即座に更新（全コンポーネントに即座に反映）
      const updateData: UpdateTicketInput = {}

      // 繰り返し設定
      if (data.recurrence_type !== undefined || data.recurrence_rule !== undefined) {
        if (data.recurrence_type !== undefined) updateData.recurrence_type = data.recurrence_type
        if (data.recurrence_rule !== undefined) updateData.recurrence_rule = data.recurrence_rule
      }

      // 日時変更（ドラッグ&ドロップ）
      if (data.start_time !== undefined) updateData.start_time = data.start_time
      if (data.end_time !== undefined) updateData.end_time = data.end_time
      if (data.due_date !== undefined) updateData.due_date = data.due_date

      // その他のフィールド
      if (data.title !== undefined) updateData.title = data.title
      if (data.status !== undefined) updateData.status = data.status
      if (data.description !== undefined) updateData.description = data.description
      if (data.reminder_minutes !== undefined) updateData.reminder_minutes = data.reminder_minutes

      // Zustandキャッシュを更新
      if (Object.keys(updateData).length > 0) {
        updateCache(id, updateData)
      }

      // 4. TanStack Queryキャッシュを楽観的に更新
      // リストキャッシュを更新（フィルターなし）
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData
        return oldData.map((plan) => (ticket.id === id ? { ...ticket, ...updateData } : ticket))
      })

      // リストキャッシュを更新（空オブジェクトフィルター）
      utils.plans.list.setData({}, (oldData) => {
        if (!oldData) return oldData
        return oldData.map((plan) => (ticket.id === id ? { ...ticket, ...updateData } : ticket))
      })

      // 個別チケットキャッシュを更新
      utils.plans.getById.setData({ id }, (oldData) => {
        if (!oldData) return undefined
        return Object.assign({}, oldData, updateData)
      })

      return { id, previousTickets, previousTicket }
    },
    onSuccess: (updatedTicket) => {
      console.log('[useTicketMutations] 更新成功:', updatedTicket)
      toast.success('更新しました')

      // TanStack Queryキャッシュを無効化してサーバーから再取得
      // refetchType: 'all' ですべてのクエリ（activeとinactive）を再フェッチ
      console.log('[useTicketMutations] キャッシュ無効化開始')
      void utils.plans.list.invalidate(undefined, { refetchType: 'all' }).then(() => {
        console.log('[useTicketMutations] tickets.list 無効化完了')
      })
      void utils.plans.getById.invalidate(undefined, { refetchType: 'all' }).then(() => {
        console.log('[useTicketMutations] tickets.getById 無効化完了')
      })

      // mutation完了後、少し遅延してからフラグをリセット（Realtimeイベント後に実行）
      setTimeout(() => {
        console.log('[useTicketMutations] isMutating = false')
        setIsMutating(false)
      }, 500)
    },
    onError: (err, variables, context) => {
      toast.error('更新に失敗しました')

      // mutation完了（フラグリセット）
      setIsMutating(false)

      // エラー時: 楽観的更新をロールバック
      if (context?.previousTickets) {
        utils.plans.list.setData(undefined, context.previousTickets)
        utils.plans.list.setData({}, context.previousTickets)
      }
      if (context?.previousTicket) {
        utils.plans.getById.setData({ id: context.id }, context.previousTicket)
      }

      // キャッシュを再取得（念のため）
      if (context?.id) {
        void utils.plans.list.invalidate(undefined, { refetchType: 'all' })
        void utils.plans.getById.invalidate({ id: context.id })
      }
    },
  })

  // ✨ 削除
  const deleteTicket = api.plans.delete.useMutation({
    onSuccess: (_, { id }) => {
      toast.success('削除しました')

      closeInspector() // Inspectorが開いていたら閉じる
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
      void utils.plans.getById.invalidate({ id }, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`)
    },
  })

  // ✨ 一括更新
  const bulkUpdateTicket = api.plans.bulkUpdate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count}件のチケットを更新しました`)
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(`一括更新に失敗しました: ${error.message}`)
    },
  })

  // ✨ 一括削除
  const bulkDeleteTicket = api.plans.bulkDelete.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count}件のチケットを削除しました`)
      closeInspector()
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
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

// Backward compatibility
export { usePlanMutations as useTicketMutations }
