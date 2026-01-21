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
 * const { openTagCreateModal } = useTagModalNavigation();
 *
 * // タグ作成モーダルを開く
 * openTagCreateModal();
 *
 * // 親タグを指定してタグ作成モーダルを開く
 * openTagCreateModal('parent-tag-id');
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

  return {
    openTagCreateModal,
  };
}
