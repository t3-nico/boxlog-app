'use client';

/**
 * タグモーダルナビゲーション Hook
 *
 * Zustandストアベースのタグモーダルを開くためのユーティリティ
 *
 * @example
 * const { openTagCreateModal, openTagMergeModal } = useTagModalNavigation();
 *
 * // タグ作成モーダルを開く
 * openTagCreateModal();
 *
 * // タグマージモーダルを開く
 * openTagMergeModal({ id: 'tag-id', name: 'Tag Name', color: '#3B82F6' });
 */

import { useCallback } from 'react';

import { useTagCreateModalStore } from '@/stores/useTagCreateModalStore';
import { useTagMergeModalStore } from '@/stores/useTagMergeModalStore';

export function useTagModalNavigation() {
  const openCreateModal = useTagCreateModalStore((state) => state.openModal);
  const openMergeModal = useTagMergeModalStore((state) => state.openModal);

  /**
   * タグ作成モーダルを開く
   */
  const openTagCreateModal = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  /**
   * タグマージモーダルを開く
   *
   * @param sourceTag - マージ元（消える側）のタグ情報
   */
  const openTagMergeModal = useCallback(
    (sourceTag: { id: string; name: string; color?: string | null }) => {
      openMergeModal(sourceTag);
    },
    [openMergeModal],
  );

  return {
    openTagCreateModal,
    openTagMergeModal,
  };
}
