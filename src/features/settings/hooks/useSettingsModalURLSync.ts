'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import {
  closeModal as closeModalAction,
  openSettingsModal,
  useModalStore,
  type SettingsCategory,
} from '@/stores/useModalStore';
import { SETTINGS_CATEGORIES } from '../constants';

/**
 * 設定モーダルとURLクエリパラメータを同期するフック
 *
 * - `?settings=account` → accountカテゴリでモーダルオープン
 * - モーダル閉じる → パラメータ削除
 * - ブラウザの戻る/進むボタンでも動作
 *
 * 注意: 無限ループを防ぐため、URL更新はモーダル状態変更時のみ行う
 */
export function useSettingsModalURLSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const modal = useModalStore((state) => state.modal);
  const isOpen = modal?.type === 'settings';
  const selectedCategory: SettingsCategory = isOpen ? modal.category : 'general';

  // 前回の状態を追跡（無限ループ防止）
  const prevIsOpenRef = useRef(isOpen);
  const prevCategoryRef = useRef(selectedCategory);
  const isUpdatingFromURLRef = useRef(false);

  // 有効なカテゴリかチェック
  const isValidCategory = useCallback((category: string | null): category is SettingsCategory => {
    if (!category) return false;
    return SETTINGS_CATEGORIES.some((cat) => cat.id === category);
  }, []);

  // 初回マウント時のみ: URLパラメータからモーダルを開く
  useEffect(() => {
    if (!searchParams) return;

    const settingsParam = searchParams.get('settings');

    if (settingsParam && isValidCategory(settingsParam)) {
      isUpdatingFromURLRef.current = true;
      openSettingsModal(settingsParam);
      // 次のレンダーで状態を更新
      setTimeout(() => {
        isUpdatingFromURLRef.current = false;
      }, 0);
    }
    // 初回マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // モーダル状態変更時: URLを更新（状態変更が原因の場合のみ）
  useEffect(() => {
    if (!searchParams || !pathname) return;

    // URLからの更新中は何もしない（無限ループ防止）
    if (isUpdatingFromURLRef.current) return;

    // 状態が実際に変更されたかチェック
    const stateChanged =
      prevIsOpenRef.current !== isOpen || prevCategoryRef.current !== selectedCategory;
    if (!stateChanged) return;

    // 状態を更新
    prevIsOpenRef.current = isOpen;
    prevCategoryRef.current = selectedCategory;

    const currentSettingsParam = searchParams.get('settings');

    if (isOpen) {
      // モーダルが開いている場合、URLにパラメータを追加
      if (currentSettingsParam !== selectedCategory) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('settings', selectedCategory);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } else {
      // モーダルが閉じている場合、パラメータを削除
      if (currentSettingsParam !== null) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('settings');
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [isOpen, selectedCategory, pathname, searchParams, router]);

  return {
    openModalWithURL: openSettingsModal,
    closeModalWithURL: closeModalAction,
  };
}
