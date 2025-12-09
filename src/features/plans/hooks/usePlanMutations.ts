import { api } from '@/lib/trpc'
import type { UpdatePlanInput } from '@/schemas/plans/plan'
import { useTranslations } from 'next-intl'
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
 * createPlan.mutate({ title: 'New Plan', status: 'todo' })
 *
 * // 更新
 * updatePlan.mutate({ id: '123', data: { title: 'Updated' } })
 *
 * // 削除
 * deletePlan.mutate({ id: '123' })
 * ```
 */
export function usePlanMutations() {
  const t = useTranslations()
  const utils = api.useUtils()
  const { closeInspector, openInspector } = usePlanInspectorStore()
  const { updateCache, setIsMutating } = usePlanCacheStore()

  // ✨ 作成
  const createPlan = api.plans.create.useMutation({
    onSuccess: (newPlan) => {
      // 1. Toast通知
      toast.success(t('common.plan.created', { title: newPlan.title }), {
        action: {
          label: t('common.plan.open'),
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
      console.error('[usePlanMutations] Create error:', error)
      // エラーメッセージがZodバリデーションエラーの翻訳キー形式の場合、直接表示
      const errorMessage = error.message.includes('validation.')
        ? t(error.message as Parameters<typeof t>[0])
        : error.message
      toast.error(t('common.plan.createFailed', { error: errorMessage }))
    },
  })

  // ✨ 更新
  const updatePlan = api.plans.update.useMutation({
    onMutate: async ({ id, data }) => {
      // 0. mutation開始フラグを設定（Realtime二重更新防止）
      setIsMutating(true)

      // 1. 進行中のクエリをキャンセル（競合回避）
      await utils.plans.list.cancel()
      await utils.plans.getById.cancel({ id })

      // 2. 現在のデータをスナップショット（ロールバック用）
      const previousPlans = utils.plans.list.getData()
      const previousPlan = utils.plans.getById.getData({ id })

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
        updateCache(id, updateData as Parameters<typeof updateCache>[1])
      }

      // 4. TanStack Queryキャッシュを楽観的に更新
      // リストキャッシュを更新（フィルターなし）
      utils.plans.list.setData(undefined, (oldData): typeof oldData => {
        if (!oldData) return undefined
        return oldData.map((plan) =>
          plan.id === id ? ({ ...plan, ...updateData } as typeof plan) : plan
        ) as typeof oldData
      })

      // リストキャッシュを更新（空オブジェクトフィルター）
      utils.plans.list.setData({}, (oldData): typeof oldData => {
        if (!oldData) return undefined
        return oldData.map((plan) =>
          plan.id === id ? ({ ...plan, ...updateData } as typeof plan) : plan
        ) as typeof oldData
      })

      // 個別プランキャッシュを更新
      utils.plans.getById.setData({ id }, (oldData) => {
        if (!oldData) return undefined
        return Object.assign({}, oldData, updateData)
      })

      return { id, previousPlans, previousPlan }
    },
    onSuccess: (updatedPlan, variables) => {
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

      // 重要な更新のみtoast表示（status変更、タグ変更など）
      if (variables.data.status) {
        const statusMap: Record<string, string> = {
          todo: 'Todo',
          doing: 'Doing',
          done: 'Done',
        }
        const statusLabel = statusMap[variables.data.status] || variables.data.status
        toast.success(t('common.plan.statusChanged', { status: statusLabel }))
      }
      // その他の自動保存（title、description、日時など）はtoast非表示
    },
    onError: (_err, _variables, context) => {
      toast.error(t('common.plan.updateFailed'))

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
      toast.success(t('common.plan.deleted'))

      closeInspector() // Inspectorが開いていたら閉じる
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
      void utils.plans.getById.invalidate({ id }, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(t('common.plan.deleteFailed', { error: error.message }))
    },
  })

  // ✨ 一括更新
  const bulkUpdatePlan = api.plans.bulkUpdate.useMutation({
    onSuccess: (result) => {
      toast.success(t('common.plan.bulkUpdated', { count: result.count }))
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(t('common.plan.bulkUpdateFailed', { error: error.message }))
    },
  })

  // ✨ 一括削除
  const bulkDeletePlan = api.plans.bulkDelete.useMutation({
    onSuccess: (result) => {
      toast.success(t('common.plan.bulkDeleted', { count: result.count }))
      closeInspector()
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(t('common.plan.bulkDeleteFailed', { error: error.message }))
    },
  })

  // ✨ 一括タグ追加
  const bulkAddTags = api.plans.bulkAddTags.useMutation({
    onSuccess: () => {
      toast.success(t('common.plan.tagsAdded'))
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' })
    },
    onError: (error) => {
      toast.error(t('common.plan.tagsAddFailed', { error: error.message }))
    },
  })

  return {
    createPlan,
    updatePlan,
    deletePlan,
    bulkUpdatePlan,
    bulkDeletePlan,
    bulkAddTags,
  }
}
