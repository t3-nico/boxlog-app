'use client';

/**
 * Inspector の保存・閉じるロジックを管理するフック
 * saveAndClose, cancelAndClose, hasPendingChanges
 */

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';

import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

interface UseInspectorSaveCloseProps {
  planId: string | null;
  hasTagChanges: boolean;
  selectedTagIdRef: React.RefObject<string | null>;
  originalTagIdRef: React.RefObject<string | null>;
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
  selectedTagIdRef,
  originalTagIdRef,
  setPlanTags,
  updatePlan,
  closeInspector,
  pendingChanges,
  clearPendingChanges,
}: UseInspectorSaveCloseProps) {
  const t = useTranslations();
  const updateTagsInCache = useUpdateEntityTagsInCache('entries');
  const { createEntry } = useEntryMutations();

  /**
   * Inspectorを即座に閉じ、保存処理はバックグラウンドで実行
   *
   * 楽観的更新でキャッシュは反映済みのため、サーバー応答を待たずに閉じる。
   * エラー時はtoastで通知。
   */
  const saveAndClose = useCallback(() => {
    // ストアから最新の状態を取得（クロージャの古い値を避ける）
    const {
      draftEntry: currentDraft,
      entryId: currentEntryId,
      consumePendingChanges: consume,
      clearDraft,
    } = useEntryInspectorStore.getState();
    const currentIsDraftMode = currentDraft !== null && currentEntryId === null;
    const currentTagId = selectedTagIdRef.current;
    const currentHasTagChanges = hasTagChanges;

    // 即座に閉じる
    if (currentIsDraftMode) {
      clearDraft();
      window.dispatchEvent(new CustomEvent('calendar-drag-cancel'));
    }
    closeInspector();

    // バックグラウンドで保存
    if (currentIsDraftMode && currentDraft) {
      const createInput = {
        title: currentDraft.title.trim(),
        description: currentDraft.description ?? undefined,
        start_time: currentDraft.start_time,
        end_time: currentDraft.end_time,
        reminder_minutes: currentDraft.reminder_minutes ?? undefined,
      };

      // ドラフトモード: 新規作成（createEntry で楽観的更新付き）
      (async () => {
        try {
          const newEntry = await createEntry.mutateAsync(createInput);
          if (newEntry?.id && currentTagId) {
            try {
              await setPlanTags(newEntry.id, [currentTagId]);
            } catch {
              toast.error(t('plan.inspector.toast.tagsSaveFailed'));
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

      if (changes && currentEntryId && Object.keys(changes).length > 0) {
        updatePlan
          .mutateAsync({
            id: currentEntryId,
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

      if (currentHasTagChanges && currentEntryId) {
        setPlanTags(currentEntryId, currentTagId ? [currentTagId] : []).catch(() => {
          toast.error(t('plan.inspector.toast.tagsSaveFailed'));
        });
      }
    }
  }, [t, updatePlan, closeInspector, createEntry, setPlanTags, hasTagChanges, selectedTagIdRef]);

  /**
   * 変更を破棄してInspectorを閉じる（キャンセル）
   */
  const cancelAndClose = useCallback(() => {
    clearPendingChanges();

    // タグ変更があった場合はキャッシュを元に戻す
    if (hasTagChanges && planId) {
      const originalTagId = originalTagIdRef.current;
      updateTagsInCache(planId, originalTagId ? [originalTagId] : []);
    }

    closeInspector();
  }, [
    clearPendingChanges,
    closeInspector,
    planId,
    updateTagsInCache,
    hasTagChanges,
    originalTagIdRef,
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
