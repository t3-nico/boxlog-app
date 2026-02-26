'use client';

/**
 * Inspector のタグ状態を管理するフック
 * selectedTagIds, hasTagChanges, handleTagsChange, handleRemoveTag、タグ同期effect
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
  const updateTagsInCache = useUpdateEntityTagsInCache('plans');
  const { setPlanTags } = usePlanTags();

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const selectedTagIdsRef = useRef<string[]>(selectedTagIds);
  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdsRef = useRef<string[]>([]);
  // タグが変更されたか（保存時のチェック用 + UI更新用）
  const [hasTagChanges, setHasTagChanges] = useState(false);

  // planIdが変わったらタグ選択をリセット（React推奨: レンダー中のstate調整）
  const [prevPlanId, setPrevPlanId] = useState(planId);
  if (planId !== prevPlanId) {
    setPrevPlanId(planId);
    if (!isDraftMode) {
      setSelectedTagIds([]);
      selectedTagIdsRef.current = [];
      originalTagIdsRef.current = [];
      setHasTagChanges(false);
    }
  }

  // Sync tags from plan data（React推奨: レンダー中のstate調整）
  const [prevPlanData, setPrevPlanData] = useState(planData);
  if (planData !== prevPlanData) {
    setPrevPlanData(planData);
    if (!hasTagChanges && planData !== undefined) {
      if (planData && 'tagIds' in planData && Array.isArray(planData.tagIds)) {
        setSelectedTagIds(planData.tagIds);
        selectedTagIdsRef.current = planData.tagIds;
        originalTagIdsRef.current = planData.tagIds;
      } else if (planData) {
        setSelectedTagIds([]);
        selectedTagIdsRef.current = [];
        originalTagIdsRef.current = [];
      }
    }
  }

  // Keep ref in sync
  useEffect(() => {
    selectedTagIdsRef.current = selectedTagIds;
  }, [selectedTagIds]);

  // Handlers
  const handleTagsChange = useCallback(
    (newTagIds: string[]) => {
      const oldTagIds = selectedTagIdsRef.current;

      // 変更がない場合は何もしない
      if (
        newTagIds.length === oldTagIds.length &&
        newTagIds.every((id) => oldTagIds.includes(id))
      ) {
        return;
      }

      // ローカル状態を即座に更新（楽観的UI）
      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;
      setHasTagChanges(true);

      // キャッシュも更新（CalendarCard等での即時表示用）
      // ドラフトモード（planId未確定）ではスキップ
      if (planId) {
        updateTagsInCache(planId, newTagIds);
      }
    },
    [planId, updateTagsInCache],
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      const newTagIds = selectedTagIdsRef.current.filter((id) => id !== tagId);

      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;
      setHasTagChanges(true);

      // キャッシュも更新
      // ドラフトモード（planId未確定）ではスキップ
      if (planId) {
        updateTagsInCache(planId, newTagIds);
      }
    },
    [planId, updateTagsInCache],
  );

  return {
    selectedTagIds,
    selectedTagIdsRef,
    originalTagIdsRef,
    hasTagChanges,
    handleTagsChange,
    handleRemoveTag,
    setPlanTags,
    updateTagsInCache,
  };
}
