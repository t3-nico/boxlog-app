'use client';

/**
 * Inspector のタグ状態を管理するフック
 * selectedTagIds, hasTagChanges, handleTagsChange, handleRemoveTag、タグ同期effect
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';

import { usePlanTags } from '../../../hooks/usePlanTags';
import type { Plan } from '../../../types/plan';

interface UseInspectorTagStateProps {
  planId: string | null;
  planData: Plan | undefined;
  isDraftMode: boolean;
}

export function useInspectorTagState({ planId, planData, isDraftMode }: UseInspectorTagStateProps) {
  const updateTagsInCache = useUpdateEntityTagsInCache('plans');
  const { setplanTags } = usePlanTags();

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const selectedTagIdsRef = useRef<string[]>(selectedTagIds);
  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdsRef = useRef<string[]>([]);
  // タグが変更されたか（保存時のチェック用 + UI更新用）
  const [hasTagChanges, setHasTagChanges] = useState(false);

  // planIdが変わったらタグ選択をリセット（別のPlanを開いた時）
  useEffect(() => {
    // ドラフトモードでは何もしない
    if (isDraftMode) return;
    // 新しいplanIdが設定された時点で空配列にリセット
    // planDataがロードされたら正しいタグで上書きされる
    setSelectedTagIds([]);
    selectedTagIdsRef.current = [];
    originalTagIdsRef.current = [];
    setHasTagChanges(false);
  }, [planId, isDraftMode]);

  // Sync tags from plan data
  useEffect(() => {
    // タグ変更中はサーバーからの同期をスキップ（楽観的更新を保持）
    if (hasTagChanges) {
      return;
    }
    // データ未ロード時は何もしない（空配列をセットしない）
    // これにより、ローディング中にタグが消えるのを防ぐ
    if (planData === undefined) {
      return;
    }
    if (planData && 'tagIds' in planData && Array.isArray(planData.tagIds)) {
      setSelectedTagIds(planData.tagIds);
      selectedTagIdsRef.current = planData.tagIds;
      originalTagIdsRef.current = planData.tagIds;
    } else if (planData) {
      // planDataがnullの場合（存在しないプラン）のみ空にする
      setSelectedTagIds([]);
      selectedTagIdsRef.current = [];
      originalTagIdsRef.current = [];
    }
  }, [planData, hasTagChanges]);

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
    setplanTags,
    updateTagsInCache,
  };
}
