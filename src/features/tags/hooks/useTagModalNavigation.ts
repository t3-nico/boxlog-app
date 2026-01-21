'use client';

/**
 * タグモーダルナビゲーション Hook
 *
 * Intercepting Routes ベースのタグモーダルを開くためのユーティリティ
 * URLベースの状態管理により:
 * - ブラウザバックでモーダルが閉じる
 * - URL共有でモーダル状態を共有可能
 *
 * @example
 * const { openTagCreateModal, openTagEditModal, openTagMergeModal } = useTagModalNavigation();
 *
 * // タグ作成モーダルを開く
 * openTagCreateModal();
 *
 * // 親タグを指定してタグ作成モーダルを開く
 * openTagCreateModal('parent-tag-id');
 *
 * // タグ編集モーダルを開く
 * openTagEditModal('tag-id');
 *
 * // タグマージモーダルを開く（マージ元のタグIDを指定）
 * openTagMergeModal('source-tag-id');
 */

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useTagModalNavigation() {
  const router = useRouter();
  const locale = useLocale();

  /**
   * タグ作成モーダルを開く
   *
   * /tags/new へ遷移し、Intercepting Route でモーダルとして表示
   *
   * @param parentId - デフォルトの親タグID（オプション）
   */
  const openTagCreateModal = useCallback(
    (parentId?: string) => {
      const url = parentId ? `/${locale}/tags/new?parentId=${parentId}` : `/${locale}/tags/new`;
      router.push(url);
    },
    [locale, router],
  );

  /**
   * タグ編集モーダルを開く
   *
   * /tags/edit/[id] へ遷移し、Intercepting Route でモーダルとして表示
   *
   * @param tagId - 編集するタグのID
   */
  const openTagEditModal = useCallback(
    (tagId: string) => {
      router.push(`/${locale}/tags/edit/${tagId}`);
    },
    [locale, router],
  );

  /**
   * タグマージモーダルを開く
   *
   * /tags/merge/[id] へ遷移し、Intercepting Route でモーダルとして表示
   *
   * @param sourceTagId - マージ元（消える側）のタグID
   */
  const openTagMergeModal = useCallback(
    (sourceTagId: string) => {
      router.push(`/${locale}/tags/merge/${sourceTagId}`);
    },
    [locale, router],
  );

  return {
    openTagCreateModal,
    openTagEditModal,
    openTagMergeModal,
  };
}
