'use client';

/**
 * Inspector のタグ状態を管理するフック（単一タグ対応）
 * selectedTagId, hasTagChanges, handleTagChange、タグ同期effect
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateEntityTagsInCache } from '../../../hooks/useUpdateEntityTagsInCache';

import type { EntryWithTags } from '@/core/types/entry';
import { useEntryTags } from '../../../hooks/useEntryTags';

interface UseInspectorTagStateProps {
  planId: string | null;
  planData: EntryWithTags | undefined;
}

export function useInspectorTagState({ planId, planData }: UseInspectorTagStateProps) {
  const updateTagsInCache = useUpdateEntityTagsInCache('entries');
  const { setEntryTags } = useEntryTags();

  // Tags state（単一タグ）
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const selectedTagIdRef = useRef<string | null>(selectedTagId);
  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdRef = useRef<string | null>(null);
  // タグが変更されたか（保存時のチェック用 + UI更新用）
  const [hasTagChanges, setHasTagChanges] = useState(false);

  // planIdが変わったらタグ選択をリセット（React推奨: レンダー中のstate調整）
  const [prevPlanId, setPrevPlanId] = useState(planId);
  if (planId !== prevPlanId) {
    setPrevPlanId(planId);
    setSelectedTagId(null);
    // eslint-disable-next-line react-hooks/refs -- React推奨のrender中state調整に伴うref同期
    selectedTagIdRef.current = null;
    // eslint-disable-next-line react-hooks/refs
    originalTagIdRef.current = null;
    setHasTagChanges(false);
  }

  // Sync tags from plan data（React推奨: レンダー中のstate調整）
  // 注意: planData はオブジェクト参照なので !== だと placeholderData → 実データ切り替え等で
  // 新しい参照が渡されるたびにsetStateが走り無限ループになる可能性がある。
  // id + updated_at + tagId の値比較で差分を検出する。
  const [prevPlanKey, setPrevPlanKey] = useState<string | null>(null);
  const planKey = planData
    ? `${planData.id}:${planData.updated_at ?? ''}:${planData.tagId ?? ''}`
    : null;
  if (planKey !== prevPlanKey) {
    setPrevPlanKey(planKey);
    if (!hasTagChanges && planData !== undefined) {
      const tagId = planData.tagId ?? null;
      setSelectedTagId(tagId);
      // eslint-disable-next-line react-hooks/refs -- React推奨のrender中state調整に伴うref同期
      selectedTagIdRef.current = tagId;
      // eslint-disable-next-line react-hooks/refs
      originalTagIdRef.current = tagId;
    }
  }

  // Keep ref in sync
  useEffect(() => {
    selectedTagIdRef.current = selectedTagId;
  }, [selectedTagId]);

  // Handler（単一タグ変更 → 即座にDB保存）
  const handleTagChange = useCallback(
    (newTagId: string | null) => {
      const oldTagId = selectedTagIdRef.current;

      // 変更がない場合は何もしない
      if (newTagId === oldTagId) {
        return;
      }

      // ローカル状態を即座に更新（楽観的UI）
      setSelectedTagId(newTagId);
      selectedTagIdRef.current = newTagId;
      setHasTagChanges(true);

      // キャッシュも更新（CalendarCard等での即時表示用）
      if (planId) {
        updateTagsInCache(planId, newTagId ? [newTagId] : []);
        // 即座にDB保存（title/descriptionと同じパターン）
        setEntryTags(planId, newTagId ? [newTagId] : []);
      }
    },
    [planId, updateTagsInCache, setEntryTags],
  );

  return {
    selectedTagId,
    selectedTagIdRef,
    originalTagIdRef,
    hasTagChanges,
    handleTagChange,
    setEntryTags,
    updateTagsInCache,
  };
}
