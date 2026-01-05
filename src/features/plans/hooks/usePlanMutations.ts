import { api } from '@/lib/trpc';
import type { UpdatePlanInput } from '@/schemas/plans/plan';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usePlanCacheStore } from '../stores/usePlanCacheStore';
import { usePlanInspectorStore } from '../stores/usePlanInspectorStore';

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
  const t = useTranslations();
  const utils = api.useUtils();
  const { closeInspector, openInspector } = usePlanInspectorStore();
  const { updateCache, clearCache, setIsMutating } = usePlanCacheStore();

  // ✨ 作成
  const createPlan = api.plans.create.useMutation({
    onSuccess: (newPlan) => {
      // 1. キャッシュを即座に更新（リアルタイム反映）
      // tags を空配列で初期化（サーバーからはtagsが返る形式）
      const newPlanWithTags = { ...newPlan, tags: [] };

      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return [newPlanWithTags];
        // 重複を防ぐ
        const exists = oldData.some((p) => p.id === newPlan.id);
        if (exists) return oldData;
        return [...oldData, newPlanWithTags];
      });

      // 2. Toast通知
      toast.success(t('common.plan.created', { title: newPlan.title }), {
        action: {
          label: t('common.plan.open'),
          onClick: () => {
            openInspector(newPlan.id);
          },
        },
      });

      // 3. 個別プランのキャッシュを設定
      utils.plans.getById.setData({ id: newPlan.id }, newPlan);
    },
    onError: (error) => {
      console.error('[usePlanMutations] Create error:', error);
      // TIME_OVERLAPエラー（重複防止）の場合は専用のトースト
      if (error.message.includes('既に予定があります') || error.message.includes('TIME_OVERLAP')) {
        toast.warning(t('calendar.toast.conflict'), {
          description: t('calendar.toast.conflictDescription'),
          duration: 4000,
        });
      } else {
        // エラーメッセージがZodバリデーションエラーの翻訳キー形式の場合、直接表示
        const errorMessage = error.message.includes('validation.')
          ? t(error.message as Parameters<typeof t>[0])
          : error.message;
        toast.error(t('common.plan.createFailed', { error: errorMessage }));
      }
    },
  });

  // ✨ 更新
  const updatePlan = api.plans.update.useMutation({
    onMutate: async ({ id, data }) => {
      // 0. mutation開始フラグを設定（Realtime二重更新防止）
      setIsMutating(true);

      // 1. 進行中のクエリをキャンセル（競合回避）
      await utils.plans.list.cancel();
      await utils.plans.getById.cancel({ id });

      // 2. 現在のデータをスナップショット（ロールバック用）
      const previousPlans = utils.plans.list.getData();
      const previousPlan = utils.plans.getById.getData({ id });

      // 3. 楽観的更新: Zustandキャッシュを即座に更新（全コンポーネントに即座に反映）
      const updateData: UpdatePlanInput = {};

      // 繰り返し設定
      if (data.recurrence_type !== undefined || data.recurrence_rule !== undefined) {
        if (data.recurrence_type !== undefined) updateData.recurrence_type = data.recurrence_type;
        if (data.recurrence_rule !== undefined) updateData.recurrence_rule = data.recurrence_rule;
      }

      // 日時変更（ドラッグ&ドロップ）
      if (data.start_time !== undefined) updateData.start_time = data.start_time;
      if (data.end_time !== undefined) updateData.end_time = data.end_time;
      if (data.due_date !== undefined) updateData.due_date = data.due_date;

      // その他のフィールド
      if (data.title !== undefined) updateData.title = data.title;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.reminder_minutes !== undefined) updateData.reminder_minutes = data.reminder_minutes;

      // Zustandキャッシュを更新
      if (Object.keys(updateData).length > 0) {
        updateCache(id, updateData as Parameters<typeof updateCache>[1]);
      }

      // 4. TanStack Queryキャッシュを楽観的に更新
      // リストキャッシュを更新（フィルターなし）
      utils.plans.list.setData(undefined, (oldData): typeof oldData => {
        if (!oldData) return undefined;
        return oldData.map((plan) =>
          plan.id === id ? ({ ...plan, ...updateData } as typeof plan) : plan,
        ) as typeof oldData;
      });

      // リストキャッシュを更新（空オブジェクトフィルター）
      utils.plans.list.setData({}, (oldData): typeof oldData => {
        if (!oldData) return undefined;
        return oldData.map((plan) =>
          plan.id === id ? ({ ...plan, ...updateData } as typeof plan) : plan,
        ) as typeof oldData;
      });

      // 個別プランキャッシュを更新
      utils.plans.getById.setData({ id }, (oldData) => {
        if (!oldData) return undefined;
        return Object.assign({}, oldData, updateData);
      });

      return { id, previousPlans, previousPlan };
    },
    onSuccess: (updatedPlan, variables) => {
      // サーバーから返ってきた最新データでキャッシュを更新
      // tags などのリレーションデータは保持する（サーバーのupdateはタグをJOINしていない）
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((plan) => {
          if (plan.id === variables.id) {
            // 既存のtagsを保持しつつ、サーバーデータで更新
            return { ...updatedPlan, tags: plan.tags ?? [] };
          }
          return plan;
        });
      });

      // 重要な更新のみtoast表示（status変更、タグ変更など）
      if (variables.data.status) {
        const statusMap: Record<string, string> = {
          todo: 'Todo',
          doing: 'Doing',
          done: 'Done',
        };
        const statusLabel = statusMap[variables.data.status] || variables.data.status;
        toast.success(t('common.plan.statusChanged', { status: statusLabel }));
      }
      // その他の自動保存（title、description、日時など）はtoast非表示
    },
    onError: (err, _variables, context) => {
      // TIME_OVERLAPエラー（重複防止）の場合は専用のトースト
      if (err.message.includes('既に予定があります') || err.message.includes('TIME_OVERLAP')) {
        toast.warning(t('calendar.toast.conflict'), {
          description: t('calendar.toast.conflictDescription'),
          duration: 4000,
        });
      } else {
        toast.error(t('common.plan.updateFailed'));
      }

      // エラー時: 楽観的更新をロールバック
      if (context?.previousPlans) {
        utils.plans.list.setData(undefined, context.previousPlans);
      }
      if (context?.previousPlan) {
        utils.plans.getById.setData({ id: context.id }, context.previousPlan);
      }
    },
    onSettled: async () => {
      // mutation完了後にフラグをリセット
      setIsMutating(false);
    },
  });

  // ✨ 削除
  const deletePlan = api.plans.delete.useMutation({
    onMutate: async ({ id }) => {
      // mutation開始フラグを設定（Realtime二重更新防止）
      setIsMutating(true);

      // 進行中のクエリをキャンセル（競合回避）
      await utils.plans.list.cancel();
      await utils.plans.getById.cancel({ id });

      // 現在のデータをスナップショット（ロールバック用）
      const previousPlans = utils.plans.list.getData();
      // getByIdキャッシュがない場合はリストから取得
      const previousPlan =
        utils.plans.getById.getData({ id }) ?? previousPlans?.find((p) => p.id === id);

      // 楽観的更新: リストから即座に削除
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((plan) => plan.id !== id);
      });

      utils.plans.list.setData({}, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((plan) => plan.id !== id);
      });

      // Zustandキャッシュからも削除
      clearCache(id);

      // 楽観的にtoastを即座に表示（undo付き）
      if (previousPlan) {
        // undoで復元するデータを事前に準備
        // start_time/end_timeをISO 8601（UTC）形式に正規化（Zodバリデーション対策）
        const normalizeDateTime = (value: string | null | undefined): string | undefined => {
          if (!value || value === '') return undefined;
          // Dateオブジェクトに変換してからISO文字列に変換（UTCの'Z'サフィックス形式）
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return undefined;
            return date.toISOString();
          } catch {
            return undefined;
          }
        };

        const restoreData = {
          title: previousPlan.title,
          description: previousPlan.description ?? undefined,
          status: previousPlan.status as 'todo' | 'doing' | 'done',
          start_time: normalizeDateTime(previousPlan.start_time),
          end_time: normalizeDateTime(previousPlan.end_time),
          due_date: previousPlan.due_date ?? undefined,
          reminder_minutes: previousPlan.reminder_minutes ?? undefined,
          recurrence_type:
            (previousPlan.recurrence_type as
              | 'none'
              | 'daily'
              | 'weekly'
              | 'monthly'
              | 'yearly'
              | 'weekdays') ?? undefined,
          recurrence_rule: previousPlan.recurrence_rule ?? undefined,
        };

        toast.success(t('common.plan.deleted'), {
          duration: 10000,
          action: {
            label: t('common.undo'),
            onClick: () => {
              createPlan.mutate(restoreData);
            },
          },
        });
      } else {
        toast.success(t('common.plan.deleted'));
      }

      closeInspector();

      return { id, previousPlans, previousPlan };
    },
    onSuccess: (_, { id }) => {
      // キャッシュ無効化（全キャッシュを対象）
      void utils.plans.list.invalidate(undefined, { refetchType: 'all' });
      void utils.plans.getById.invalidate({ id }, { refetchType: 'all' });
    },
    onError: (error, { id }, context) => {
      toast.error(t('common.plan.deleteFailed', { error: error.message }));

      // エラー時: 楽観的更新をロールバック
      if (context?.previousPlans) {
        utils.plans.list.setData(undefined, context.previousPlans);
      }
      if (context?.previousPlan) {
        utils.plans.getById.setData({ id }, context.previousPlan);
      }
    },
    onSettled: () => {
      // mutation完了後、refetchが安定するまで少し待ってからフラグをリセット
      // Realtime更新との競合を防ぐため
      setTimeout(() => {
        setIsMutating(false);
      }, 500);
    },
  });

  // ✨ 一括更新
  const bulkUpdatePlan = api.plans.bulkUpdate.useMutation({
    onSuccess: (result) => {
      toast.success(t('common.plan.bulkUpdated', { count: result.count }));
      void utils.plans.list.invalidate(undefined, { refetchType: 'active' });
    },
    onError: (error) => {
      toast.error(t('common.plan.bulkUpdateFailed', { error: error.message }));
    },
  });

  // ✨ 一括削除
  const bulkDeletePlan = api.plans.bulkDelete.useMutation({
    onMutate: async ({ ids }) => {
      // mutation開始フラグを設定（Realtime二重更新防止）
      setIsMutating(true);

      // 進行中のクエリをキャンセル
      await utils.plans.list.cancel();

      // 現在のデータをスナップショット（ロールバック用）
      const previousPlans = utils.plans.list.getData();

      // 楽観的更新: リストから即座に削除
      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((plan) => !ids.includes(plan.id));
      });

      utils.plans.list.setData({}, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((plan) => !ids.includes(plan.id));
      });

      // Zustandキャッシュからも削除
      ids.forEach((id) => clearCache(id));

      return { previousPlans };
    },
    onSuccess: (result) => {
      toast.success(t('common.plan.bulkDeleted', { count: result.count }));
      closeInspector();
      void utils.plans.list.invalidate(undefined, { refetchType: 'all' });
    },
    onError: (error, _variables, context) => {
      toast.error(t('common.plan.bulkDeleteFailed', { error: error.message }));

      // エラー時: 楽観的更新をロールバック
      if (context?.previousPlans) {
        utils.plans.list.setData(undefined, context.previousPlans);
      }
    },
    onSettled: () => {
      // mutation完了後にフラグをリセット
      setIsMutating(false);
    },
  });

  // ✨ 一括タグ追加
  const bulkAddTags = api.plans.bulkAddTags.useMutation({
    onSuccess: () => {
      toast.success(t('common.plan.tagsAdded'));
      // 全てのplans.listクエリを無効化（tagIdフィルター付きも含む）
      void utils.plans.list.invalidate(undefined, { refetchType: 'all' });
      void utils.plans.getTagStats.invalidate(); // タグページの統計を更新
    },
    onError: (error) => {
      toast.error(t('common.plan.tagsAddFailed', { error: error.message }));
    },
  });

  return {
    createPlan,
    updatePlan,
    deletePlan,
    bulkUpdatePlan,
    bulkDeletePlan,
    bulkAddTags,
  };
}
