'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useInboxFilterStore } from '../stores/useInboxFilterStore';
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore';
import { useInboxSortStore } from '../stores/useInboxSortStore';

/**
 * Inbox URL同期フック
 *
 * URLクエリパラメータとZustand storeを双方向同期
 * - URL → Store: 初期化時にURLから状態を読み取り
 * - Store → URL: 状態変更時にURLを更新（shallow routing）
 * - キーボード: ←/→キーでページ移動
 *
 * URL形式:
 * - ?page=2           - ページ番号
 * - ?sort=created_at  - ソートフィールド
 * - ?order=desc       - ソート順
 * - ?q=keyword        - 検索キーワード
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

  // Pagination store
  const currentPage = useInboxPaginationStore((state) => state.currentPage);
  const setCurrentPage = useInboxPaginationStore((state) => state.setCurrentPage);

  // Sort store
  const sortField = useInboxSortStore((state) => state.sortField);
  const sortDirection = useInboxSortStore((state) => state.sortDirection);
  const setSort = useInboxSortStore((state) => state.setSort);
  const clearSort = useInboxSortStore((state) => state.clearSort);

  // Filter store (検索のみURL同期)
  const search = useInboxFilterStore((state) => state.search);
  const setSearch = useInboxFilterStore((state) => state.setSearch);

  // 初期化済みフラグ（URL→Store同期は初回のみ）
  const isInitializedRef = useRef(false);
  // URL更新中フラグ（Store→URL同期時のループ防止）
  const isUpdatingURLRef = useRef(false);

  /**
   * URLを更新（shallow routing）
   */
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    // ページ番号（1の場合は省略）
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    // ソート（nullの場合は省略）
    if (sortField && sortDirection) {
      params.set('sort', sortField);
      params.set('order', sortDirection);
    }

    // 検索（空の場合は省略）
    if (search) {
      params.set('q', search);
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
  }, [router, currentPage, sortField, sortDirection, search]);

  /**
   * URL → Store 同期（初期化時のみ）
   */
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // ページ番号
    const pageParam = searchParams?.get('page');
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page >= 1) {
        setCurrentPage(page);
      }
    }

    // ソート
    const sortParam = searchParams?.get('sort');
    const orderParam = searchParams?.get('order');
    if (sortParam && orderParam) {
      setSort(sortParam, orderParam as 'asc' | 'desc');
    }

    // 検索
    const qParam = searchParams?.get('q');
    if (qParam) {
      setSearch(qParam);
    }
  }, [searchParams, setCurrentPage, setSort, setSearch]);

  /**
   * Store → URL 同期（状態変更時）
   */
  useEffect(() => {
    // 初期化完了前は無視
    if (!isInitializedRef.current) return;
    // URL更新中は無視（ループ防止）
    if (isUpdatingURLRef.current) return;

    updateURL();
  }, [currentPage, sortField, sortDirection, search, updateURL]);

  /**
   * ブラウザバック/フォワード時のURL → Store 同期
   */
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);

      isUpdatingURLRef.current = true;

      // ページ番号
      const pageParam = params.get('page');
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      if (!isNaN(page) && page >= 1) {
        setCurrentPage(page);
      }

      // ソート
      const sortParam = params.get('sort');
      const orderParam = params.get('order');
      if (sortParam && orderParam) {
        setSort(sortParam, orderParam as 'asc' | 'desc');
      } else {
        clearSort();
      }

      // 検索
      const qParam = params.get('q');
      setSearch(qParam ?? '');

      setTimeout(() => {
        isUpdatingURLRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage, setSort, clearSort, setSearch]);

  /**
   * キーボードナビゲーション（←/→キーでページ移動）
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカス中は無視
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // モディファイアキーが押されている場合は無視
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // 最大ページ数は呼び出し元で管理されているため、ここでは単純にインクリメント
        // 範囲外の場合はTablePaginationで制限される
        setCurrentPage(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, setCurrentPage]);
}
