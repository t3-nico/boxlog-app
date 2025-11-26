import { api } from '@/lib/trpc'
import type { UpdatePlanInput } from '@/schemas/plans/plan'
import { toast } from 'sonner'
import { usePlanCacheStore } from '../stores/usePlanCacheStore'
import { usePlanInspectorStore } from '../stores/usePlanInspectorStore'

/**
 * Plan Mutations Hook（作成・更新・削除）
 *
 * すべてのPlan操作を一元管理
 * - Toast通知
 * - キャッシュ無効化（全ビュー自動更新）
 * - Zustandキャッシュ（即座の同期）
 * - エラーハンドリング
 *
 * @example
 * ```tsx
 * const { createPlan, updatePlan, deletePlan } = usePlanMutations()
 *
 * // 作成
 * createPlan.mutate({ title: 'New Plan', status: 'backlog' })
 *
 * // 更新
 * updatePlan.mutate({ id: '123', data: { title: 'Updated' } })
 *
 * // 削除
 * deletePlan.mutate({ id: '123' })
 * ```
 */
export function usePlanMutations() {
  const utils = api.useUtils()
  const { closeInspector, openInspector } = usePlanInspectorStore()
  const { updateCache, setIsMutating } = usePlanCacheStore()

  // ✨ 作成
  const createPlan = api.plans.create.useMutation({
    onSuccess: (newPlan) => {
      // 1. Toast通知
      toast.success(`Plan "${newPlan.title}" を作成しました`, {
        action: {
          label: '開く',
          onClick: () => {
            openInspector(newPlan.id)
          },
        },
      })

      // 2. キャッシュ無効化 + 即座に再フェッチ → すべてのビューが自動更新
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
      void utils.plans.getById.invalidate({ id: newPlan.id }, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`)
    },
  })

  // ✨ 更新
  const updatePlan = api.plans.update.useMutation({
    onMutate: async ({ id, data }) => {
      console.log('[usePlanMutations] onMutate開始:', { id, data })

      // 0. mutation開始フラグを設定（Realtime二重更新防止）
      setIsMutating(true)

      // 1. 進行中のクエリをキャンセル（競合回避）
      await utils.plans.list.cancel()
      await utils.plans.getById.cancel({ id })

      // 2. 現在のデータをスナップショット（ロールバック用）
      const previousPlans = utils.plans.list.getData()
      const previousPlan = utils.plans.getById.getData({ id })

      console.log('[usePlanMutations] 現在のキャッシュ:', {
        previousPlansCount: previousPlans?.length,
        hasPreviousPlan: !!previousPlan,
      })

      // 3. 楽観的更新: Zustandキャッシュを即座に更新（全コンポーネントに即座に反映）
      const updateData: UpdatePlanInput = {}

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
        console.log('[usePlanMutations] Zustandキャッシュ更新:', { id, updateData })
      }

      // 4. TanStack Queryキャッシュを楽観的に更新
      // 重要: TanStack Query v5では setData は新しい参照を返さないと再レンダリングされない
      // oldData全体を新しい配列として返す必要がある
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) {
          console.log('[usePlanMutations] oldData is undefined, skipping list cache update')
          return oldData
        }
        // 重要: map() で新しい配列を作成し、さらに spread で新しいオブジェクトを作成
        const updated = oldData.map((plan) => {
          if (plan.id === id) {
            // 更新対象: 新しいオブジェクトとして返す
            return { ...plan, ...updateData }
          }
          // 更新対象外: そのまま返す（参照を維持）
          return plan
        })
        console.log('[usePlanMutations] TanStack Query list cache 楽観的更新:', {
          id,
          updateData,
          updatedPlan: updated.find((p) => p.id === id),
          isSameReference: updated === oldData,
          updatedPlanSameRef: updated.find((p) => p.id === id) === oldData.find((p) => p.id === id),
        })
        return updated
      })

      // 個別プランキャッシュを更新
      utils.plans.getById.setData({ id }, (oldData) => {
        if (!oldData) return undefined
        return Object.assign({}, oldData, updateData)
      })

      return { id, previousPlans, previousPlan }
    },
    onSuccess: (updatedPlan, variables) => {
      console.log('[usePlanMutations] 更新成功:', updatedPlan)

      // サーバーから返ってきた最新データでキャッシュを更新
      // plan_tags などのリレーションデータは保持する
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData
        return oldData.map((plan) => {
          if (plan.id === variables.id) {
            // 既存のplan_tagsを保持しつつ、サーバーデータで更新
            return { ...updatedPlan, plan_tags: plan.plan_tags }
          }
          return plan
        })
      })

      console.log('[usePlanMutations] サーバーデータでキャッシュ更新完了')
      toast.success('更新しました')
    },
    onError: (_err, _variables, context) => {
      toast.error('更新に失敗しました')

      // エラー時: 楽観的更新をロールバック
      if (context?.previousPlans) {
        utils.plans.list.setData(undefined, context.previousPlans)
      }
      if (context?.previousPlan) {
        utils.plans.getById.setData({ id: context.id }, context.previousPlan)
      }
    },
    onSettled: async () => {
      // mutation完了後にフラグをリセット
      console.log('[usePlanMutations] onSettled: isMutating = false')
      setIsMutating(false)
    },
  })

  // ✨ 削除
  const deletePlan = api.plans.delete.useMutation({
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
  const bulkUpdatePlan = api.plans.bulkUpdate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count}件のプランを更新しました`)
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(`一括更新に失敗しました: ${error.message}`)
    },
  })

  // ✨ 一括削除
  const bulkDeletePlan = api.plans.bulkDelete.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count}件のプランを削除しました`)
      closeInspector()
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(`一括削除に失敗しました: ${error.message}`)
    },
  })

  return {
    createPlan,
    updatePlan,
    deletePlan,
    bulkUpdatePlan,
    bulkDeletePlan,
  }
}
