'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useInboxPaginationStore } from '../stores/useInboxPaginationStore';

/**
 * Inbox URL同期フック
 *
 * URLクエリパラメータとZustand storeを双方向同期
 * - URL → Store: 初期化時にURLからページ番号を読み取り
 * - Store → URL: ページ変更時にURLを更新（shallow routing）
 *
 * @example
 * ```tsx
 * export function InboxTableView() {
 *   useInboxURLSync();
 *   // 既存コードは変更不要
 * }
 * ```
 */
export function useInboxURLSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store state
  const currentPage = useInboxPaginationStore((state) => state.currentPage);
  const setCurrentPage = useInboxPaginationStore((state) => state.setCurrentPage);

  // 初期化済みフラグ（URL→Store同期は初回のみ）
  const isInitializedRef = useRef(false);
  // URL更新中フラグ（Store→URL同期時のループ防止）
  const isUpdatingURLRef = useRef(false);

  /**
   * URLを更新（shallow routing）
   */
  const updateURL = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      if (page > 1) {
        params.set('page', page.toString());
      } else {
        params.delete('page');
      }

      const queryString = params.toString();
      const newPath = queryString ? `?${queryString}` : window.location.pathname;

      // shallow routing: ページ再読み込みなし
      isUpdatingURLRef.current = true;
      router.replace(newPath, { scroll: false });

      // 次のtickでフラグをリセット
      setTimeout(() => {
        isUpdatingURLRef.current = false;
      }, 0);
    },
    [router, searchParams],
  );

  /**
   * URL → Store 同期（初期化時のみ）
   */
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const pageParam = searchParams?.get('page');
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page >= 1) {
        setCurrentPage(page);
      }
    }
  }, [searchParams, setCurrentPage]);

  /**
   * Store → URL 同期（ページ変更時）
   */
  useEffect(() => {
    // 初期化完了前は無視
    if (!isInitializedRef.current) return;
    // URL更新中は無視（ループ防止）
    if (isUpdatingURLRef.current) return;

    updateURL(currentPage);
  }, [currentPage, updateURL]);

  /**
   * ブラウザバック/フォワード時のURL → Store 同期
   */
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      const page = pageParam ? parseInt(pageParam, 10) : 1;

      if (!isNaN(page) && page >= 1) {
        isUpdatingURLRef.current = true;
        setCurrentPage(page);
        setTimeout(() => {
          isUpdatingURLRef.current = false;
        }, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage]);
}
