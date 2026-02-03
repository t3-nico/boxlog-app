'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useTablePaginationStore, useTableSortStore } from '@/features/table';

import { useRecordFilterStore } from '../stores/useRecordFilterStore';

import type { WorkedAtFilter } from '../stores/useRecordFilterStore';

/**
 * Record URL 同期フック
 *
 * URL クエリパラメータと Zustand store を双方向同期
 * - URL → Store: 初期化時に URL から状態を読み取り
 * - Store → URL: 状態変更時に URL を更新（shallow routing）
 * - キーボード: ←/→キーでページ移動
 *
 * URL 形式:
 * - ?page=2           - ページ番号
 * - ?sort=worked_at   - ソートフィールド
 * - ?order=desc       - ソート順
 * - ?q=keyword        - 検索キーワード
 * - ?worked_at=today  - 作業日フィルター
 *
 * @example
 * ```tsx
 * export function RecordTableView() {
 *   useRecordURLSync();
 *   // 既存コードは変更不要
 * }
 * ```
 */
export function useRecordURLSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination store
  const currentPage = useTablePaginationStore((state) => state.currentPage);
  const setCurrentPage = useTablePaginationStore((state) => state.setCurrentPage);

  // Sort store
  const sortField = useTableSortStore((state) => state.sortField);
  const sortDirection = useTableSortStore((state) => state.sortDirection);
  const setSort = useTableSortStore((state) => state.setSort);
  const clearSort = useTableSortStore((state) => state.clearSort);

  // Filter store
  const search = useRecordFilterStore((state) => state.search);
  const setSearch = useRecordFilterStore((state) => state.setSearch);
  const workedAt = useRecordFilterStore((state) => state.workedAt);
  const setWorkedAt = useRecordFilterStore((state) => state.setWorkedAt);

  // 初期化済みフラグ（URL→Store 同期は初回のみ）
  const isInitializedRef = useRef(false);
  // URL 更新中フラグ（Store→URL 同期時のループ防止）
  const isUpdatingURLRef = useRef(false);

  /**
   * URL を更新（shallow routing）
   */
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    // ページ番号（1 の場合は省略）
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    // ソート（null の場合は省略）
    if (sortField && sortDirection) {
      params.set('sort', sortField);
      params.set('order', sortDirection);
    }

    // 検索（空の場合は省略）
    if (search) {
      params.set('q', search);
    }

    // 作業日フィルター（all の場合は省略）
    if (workedAt && workedAt !== 'all') {
      params.set('worked_at', workedAt);
    }

    const queryString = params.toString();
    const newPath = queryString ? `?${queryString}` : window.location.pathname;

    // shallow routing: ページ再読み込みなし
    isUpdatingURLRef.current = true;
    router.replace(newPath, { scroll: false });

    // 次の tick でフラグをリセット
    setTimeout(() => {
      isUpdatingURLRef.current = false;
    }, 0);
  }, [router, currentPage, sortField, sortDirection, search, workedAt]);

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

    // 作業日フィルター
    const workedAtParam = searchParams?.get('worked_at');
    if (workedAtParam) {
      const validValues: WorkedAtFilter[] = [
        'today',
        'yesterday',
        'this_week',
        'last_week',
        'this_month',
        'all',
      ];
      if (validValues.includes(workedAtParam as WorkedAtFilter)) {
        setWorkedAt(workedAtParam as WorkedAtFilter);
      }
    }
  }, [searchParams, setCurrentPage, setSort, setSearch, setWorkedAt]);

  /**
   * Store → URL 同期（状態変更時）
   */
  useEffect(() => {
    // 初期化完了前は無視
    if (!isInitializedRef.current) return;
    // URL 更新中は無視（ループ防止）
    if (isUpdatingURLRef.current) return;

    updateURL();
  }, [currentPage, sortField, sortDirection, search, workedAt, updateURL]);

  /**
   * ブラウザバック/フォワード時の URL → Store 同期
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

      // 作業日フィルター
      const workedAtParam = params.get('worked_at');
      if (workedAtParam) {
        const validValues: WorkedAtFilter[] = [
          'today',
          'yesterday',
          'this_week',
          'last_week',
          'this_month',
          'all',
        ];
        if (validValues.includes(workedAtParam as WorkedAtFilter)) {
          setWorkedAt(workedAtParam as WorkedAtFilter);
        }
      } else {
        setWorkedAt('all');
      }

      setTimeout(() => {
        isUpdatingURLRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage, setSort, clearSort, setSearch, setWorkedAt]);

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
        setCurrentPage(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, setCurrentPage]);
}
