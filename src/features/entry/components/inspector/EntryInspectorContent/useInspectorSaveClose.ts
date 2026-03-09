'use client';

/**
 * Inspector の保存・閉じるロジックを管理するフック
 * saveAndClose, cancelAndClose, hasPendingChanges
 *
 * ドラフトモードなし — edit mode のみ。
 */

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';

import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

interface UseInspectorSaveCloseProps {
  planId: string | null;
  hasTagChanges: boolean;
  selectedTagIdRef: React.RefObject<string | null>;
  originalTagIdRef: React.RefObject<string | null>;
  setEntryTags: (planId: string, tagIds: string[]) => Promise<void>;
  updatePlan: {
    mutateAsync: (args: {
      id: string;
      data: Record<string, string | number | null | undefined>;
    }) => Promise<unknown>;
  };
  closeInspector: () => void;
  pendingChanges: Record<string, string | number | null | undefined> | null;
  clearPendingChanges: () => void;
  timeConflictError: boolean;
}

export function useInspectorSaveClose({
  planId,
  hasTagChanges,
  selectedTagIdRef,
  originalTagIdRef,
  setEntryTags,
  updatePlan,
  closeInspector,
  pendingChanges,
  clearPendingChanges,
  timeConflictError,
}: UseInspectorSaveCloseProps) {
  const t = useTranslations();
  const updateTagsInCache = useUpdateEntityTagsInCache('entries');

  /**
   * Inspectorを即座に閉じ、保存処理はバックグラウンドで実行
   *
   * 楽観的更新でキャッシュは反映済みのため、サーバー応答を待たずに閉じる。
   * エラー時はtoastで通知。
   */
  const saveAndClose = useCallback(() => {
    // 時間重複エラー中は保存をブロック
    if (timeConflictError) return;

    const { entryId: currentEntryId, consumePendingChanges: consume } =
      useEntryInspectorStore.getState();
    const currentTagId = selectedTagIdRef.current;
    const currentHasTagChanges = hasTagChanges;

    // 即座に閉じる
    closeInspector();

    // バックグラウンドで保存（pending changes + タグ）
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
      setEntryTags(currentEntryId, currentTagId ? [currentTagId] : []).catch(() => {
        toast.error(t('plan.inspector.toast.tagsSaveFailed'));
      });
    }
  }, [
    t,
    updatePlan,
    closeInspector,
    setEntryTags,
    hasTagChanges,
    selectedTagIdRef,
    timeConflictError,
  ]);

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
