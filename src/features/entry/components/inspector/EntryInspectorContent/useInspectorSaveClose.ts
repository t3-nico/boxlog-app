'use client';

/**
 * Inspector の閉じるロジックを管理するフック
 *
 * 全フィールドはデバウンス即時保存のため、閉じる時はタグ保存のみ。
 */

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';

interface UseInspectorSaveCloseProps {
  planId: string | null;
  hasTagChanges: boolean;
  selectedTagIdRef: React.RefObject<string | null>;
  originalTagIdRef: React.RefObject<string | null>;
  setEntryTags: (planId: string, tagIds: string[]) => Promise<void>;
  closeInspector: () => void;
  timeConflictError: boolean;
}

export function useInspectorSaveClose({
  planId,
  hasTagChanges,
  selectedTagIdRef,
  originalTagIdRef,
  setEntryTags,
  closeInspector,
  timeConflictError,
}: UseInspectorSaveCloseProps) {
  const t = useTranslations();
  const updateTagsInCache = useUpdateEntityTagsInCache('entries');

  /**
   * Inspectorを閉じる（タグ変更があればバックグラウンドで保存）
   *
   * 時間・タイトル等は既にデバウンス即時保存済み。
   * タグだけ閉じる時にサーバー保存する。
   */
  const saveAndClose = useCallback(() => {
    // 時間重複エラー中は閉じない
    if (timeConflictError) return;

    const currentTagId = selectedTagIdRef.current;
    const currentHasTagChanges = hasTagChanges;
    const currentEntryId = planId;

    // 即座に閉じる
    closeInspector();

    // タグだけバックグラウンド保存
    if (currentHasTagChanges && currentEntryId) {
      setEntryTags(currentEntryId, currentTagId ? [currentTagId] : []).catch(() => {
        toast.error(t('plan.inspector.toast.tagsSaveFailed'));
      });
    }
  }, [t, closeInspector, setEntryTags, hasTagChanges, selectedTagIdRef, planId, timeConflictError]);

  /**
   * 変更を破棄してInspectorを閉じる（キャンセル）
   *
   * デバウンス即時保存のため、既に保存された変更は元に戻せない。
   * タグ変更のみキャッシュをロールバックする。
   */
  const cancelAndClose = useCallback(() => {
    // タグ変更があった場合はキャッシュを元に戻す
    if (hasTagChanges && planId) {
      const originalTagId = originalTagIdRef.current;
      updateTagsInCache(planId, originalTagId ? [originalTagId] : []);
    }

    closeInspector();
  }, [closeInspector, planId, updateTagsInCache, hasTagChanges, originalTagIdRef]);

  // タグ変更のみ追跡
  const hasPendingChanges = hasTagChanges;

  return {
    saveAndClose,
    cancelAndClose,
    hasPendingChanges,
  };
}
