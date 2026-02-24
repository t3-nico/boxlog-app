'use client';

/**
 * Inspector の保存・閉じるロジックを管理するフック
 * saveAndClose, cancelAndClose, hasPendingChanges
 */

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';
import { vanillaTrpc } from '@/lib/trpc/client';

import { usePlanMutations } from '../../../hooks/usePlanMutations';
import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';

interface UseInspectorSaveCloseProps {
  planId: string | null;
  hasTagChanges: boolean;
  selectedTagIdsRef: React.RefObject<string[]>;
  originalTagIdsRef: React.RefObject<string[]>;
  setPlanTags: (planId: string, tagIds: string[]) => Promise<void>;
  updatePlan: {
    mutateAsync: (args: {
      id: string;
      data: Record<string, string | number | null | undefined>;
    }) => Promise<unknown>;
  };
  closeInspector: () => void;
  pendingChanges: Record<string, string | number | null | undefined> | null;
  clearPendingChanges: () => void;
}

export function useInspectorSaveClose({
  planId,
  hasTagChanges,
  selectedTagIdsRef,
  originalTagIdsRef,
  setPlanTags,
  updatePlan,
  closeInspector,
  pendingChanges,
  clearPendingChanges,
}: UseInspectorSaveCloseProps) {
  const t = useTranslations();
  const utils = api.useUtils();
  const updateTagsInCache = useUpdateEntityTagsInCache('plans');
  const { createPlan } = usePlanMutations();

  /**
   * Inspectorを即座に閉じ、保存処理はバックグラウンドで実行
   *
   * 楽観的更新でキャッシュは反映済みのため、サーバー応答を待たずに閉じる。
   * エラー時はtoastで通知。
   */
  const saveAndClose = useCallback(() => {
    // ストアから最新の状態を取得（クロージャの古い値を避ける）
    const {
      draftPlan: currentDraft,
      planId: currentPlanId,
      consumePendingChanges: consume,
      clearDraft,
    } = usePlanInspectorStore.getState();
    const currentIsDraftMode = currentDraft !== null && currentPlanId === null;
    const currentTagIds = selectedTagIdsRef.current;
    const currentHasTagChanges = hasTagChanges;

    // 即座に閉じる
    if (currentIsDraftMode) {
      clearDraft();
      window.dispatchEvent(new CustomEvent('calendar-drag-cancel'));
    }
    closeInspector();

    // バックグラウンドで保存
    if (currentIsDraftMode && currentDraft) {
      // リンク対象の全 Record IDs を統合（_linkedRecordIds + _linkRecordId）
      const allRecordIdsToLink = [
        ...(currentDraft._linkedRecordIds ?? []),
        ...(currentDraft._linkRecordId &&
        !(currentDraft._linkedRecordIds ?? []).includes(currentDraft._linkRecordId)
          ? [currentDraft._linkRecordId]
          : []),
      ];

      const createInput = {
        title: currentDraft.title.trim(),
        description: currentDraft.description ?? undefined,
        status: 'open' as const,
        start_time: currentDraft.start_time,
        end_time: currentDraft.end_time,
        reminder_minutes: currentDraft.reminder_minutes ?? undefined,
      };

      // ドラフトモード: 新規作成
      (async () => {
        try {
          if (allRecordIdsToLink.length > 0) {
            // Record リンクが必要な場合:
            // vanillaTrpc で全処理を実行（React lifecycle に依存しない）
            // closeInspector() 後にコンポーネントがアンマウントされても確実に完了する
            const newPlan = await vanillaTrpc.plans.create.mutate(createInput);

            if (newPlan?.id) {
              if (currentTagIds.length > 0) {
                try {
                  await vanillaTrpc.plans.setTags.mutate({
                    planId: newPlan.id,
                    tagIds: currentTagIds,
                  });
                } catch {
                  toast.error(t('plan.inspector.toast.tagsSaveFailed'));
                }
              }

              // 全 Record を Plan にリンク
              for (const recordId of allRecordIdsToLink) {
                try {
                  await vanillaTrpc.records.update.mutate({
                    id: recordId,
                    data: { plan_id: newPlan.id },
                  });
                } catch (err) {
                  logger.error('Failed to link record to plan:', err);
                }
              }

              toast.success(t('plan.toast.created', { title: newPlan.title }));
            }

            // キャッシュ無効化（vanillaTrpc は React Query キャッシュを自動更新しない）
            void utils.plans.list.invalidate();
            void utils.plans.getCumulativeTime.invalidate();
            void utils.records.list.invalidate();
          } else {
            // 通常のPlan作成（React Query 楽観的更新付き）
            const newPlan = await createPlan.mutateAsync(createInput);
            if (newPlan?.id && currentTagIds.length > 0) {
              try {
                await setPlanTags(newPlan.id, currentTagIds);
              } catch {
                toast.error(t('plan.inspector.toast.tagsSaveFailed'));
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '';
          if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
            toast.error(t('plan.inspector.toast.timeOverlap'));
          } else {
            toast.error(t('plan.inspector.toast.createFailed'));
          }
        }
      })();
    } else {
      // 編集モード: pending changesとタグを保存
      const changes = consume();

      if (changes && currentPlanId && Object.keys(changes).length > 0) {
        updatePlan
          .mutateAsync({
            id: currentPlanId,
            data: changes as Record<string, string | number | null | undefined>,
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : '';
            if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
              toast.error(t('plan.inspector.toast.timeOverlap'));
            } else {
              toast.error(t('plan.inspector.toast.saveFailed'));
            }
          });
      }

      if (currentHasTagChanges && currentPlanId) {
        setPlanTags(currentPlanId, currentTagIds).catch(() => {
          toast.error(t('plan.inspector.toast.tagsSaveFailed'));
        });
      }
    }
  }, [
    t,
    updatePlan,
    closeInspector,
    createPlan,
    setPlanTags,
    hasTagChanges,
    utils,
    selectedTagIdsRef,
  ]);

  /**
   * 変更を破棄してInspectorを閉じる（キャンセル）
   */
  const cancelAndClose = useCallback(() => {
    clearPendingChanges();

    // タグ変更があった場合はキャッシュを元に戻す
    if (hasTagChanges && planId) {
      updateTagsInCache(planId, originalTagIdsRef.current);
    }

    closeInspector();
  }, [
    clearPendingChanges,
    closeInspector,
    planId,
    updateTagsInCache,
    hasTagChanges,
    originalTagIdsRef,
  ]);

  // 未保存の変更があるか判定（タグ変更も含む）
  const hasPendingChanges =
    (pendingChanges && Object.keys(pendingChanges).length > 0) || hasTagChanges;

  return {
    saveAndClose,
    cancelAndClose,
    hasPendingChanges,
  };
}
