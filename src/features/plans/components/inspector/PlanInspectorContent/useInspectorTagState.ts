'use client';

/**
 * Inspector のタグ状態を管理するフック（単一タグ対応）
 * selectedTagId, hasTagChanges, handleTagChange、タグ同期effect
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';

import { usePlanTags } from '@/hooks/usePlanTags';
import type { Plan } from '../../../types/plan';

interface UseInspectorTagStateProps {
  planId: string | null;
  planData: Plan | undefined;
  isDraftMode: boolean;
}

export function useInspectorTagState({ planId, planData, isDraftMode }: UseInspectorTagStateProps) {
  const updateTagsInCache = useUpdateEntityTagsInCache('entries');
  const { setPlanTags } = usePlanTags();

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
    if (!isDraftMode) {
      setSelectedTagId(null);
      selectedTagIdRef.current = null;
      originalTagIdRef.current = null;
      setHasTagChanges(false);
    }
  }

  // Sync tags from plan data（React推奨: レンダー中のstate調整）
  // 初期値を undefined にすることで、placeholderData で即座に planData が
  // 返る場合でも必ず差分検出 → タグ同期が走る
  const [prevPlanData, setPrevPlanData] = useState<Plan | undefined>(undefined);
  if (planData !== prevPlanData) {
    setPrevPlanData(planData);
    if (!hasTagChanges && planData !== undefined) {
      const tagId = ('tagId' in planData ? (planData.tagId as string | null) : null) ?? null;
      setSelectedTagId(tagId);
      selectedTagIdRef.current = tagId;
      originalTagIdRef.current = tagId;
    }
  }

  // Keep ref in sync
  useEffect(() => {
    selectedTagIdRef.current = selectedTagId;
  }, [selectedTagId]);

  // Handler（単一タグ変更）
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
      // ドラフトモード（planId未確定）ではスキップ
      if (planId) {
        updateTagsInCache(planId, newTagId ? [newTagId] : []);
      }
    },
    [planId, updateTagsInCache],
  );

  return {
    selectedTagId,
    selectedTagIdRef,
    originalTagIdRef,
    hasTagChanges,
    handleTagChange,
    setPlanTags,
    updateTagsInCache,
  };
}
