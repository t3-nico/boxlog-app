'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

/**
 * タグページのフィルター状態
 * - all: すべてのタグ
 * - uncategorized: 未分類タグ
 * - archive: アーカイブ
 * - group-{number}: グループ番号
 */
export type TagsFilter = 'all' | 'uncategorized' | 'archive' | `group-${number}`;

interface TagsNavigationContextValue {
  filter: TagsFilter;
  groupNumber: number | null;
  navigateToFilter: (filter: TagsFilter) => void;
  navigateToGroup: (groupNumber: number) => void;
}

const TagsNavigationContext = createContext<TagsNavigationContextValue | null>(null);

/**
 * タグナビゲーションProvider
 *
 * カレンダーと同じパターン:
 * - 状態はReactで管理（即座に反映）
 * - URLは履歴・ブックマーク用に同期
 */
export function TagsNavigationProvider({
  children,
  initialFilter = 'all',
}: {
  children: React.ReactNode;
  initialFilter?: TagsFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<TagsFilter>(initialFilter);

  // 現在のlocaleを取得
  const locale = pathname?.split('/')[1] || 'ja';

  // グループ番号を抽出
  const groupNumber = filter.startsWith('group-')
    ? parseInt(filter.replace('group-', ''), 10)
    : null;

  const navigateToFilter = useCallback(
    (newFilter: TagsFilter) => {
      setFilter(newFilter); // 即座に状態更新

      // URLを同期（履歴用）
      let url = `/${locale}/tags`;
      if (newFilter === 'uncategorized') {
        url = `/${locale}/tags/uncategorized`;
      } else if (newFilter === 'archive') {
        url = `/${locale}/tags/archive`;
      } else if (newFilter.startsWith('group-')) {
        const num = newFilter.replace('group-', '');
        url = `/${locale}/tags/g-${num}`;
      }

      router.push(url, { scroll: false });
    },
    [router, locale],
  );

  const navigateToGroup = useCallback(
    (num: number) => {
      navigateToFilter(`group-${num}`);
    },
    [navigateToFilter],
  );

  return (
    <TagsNavigationContext.Provider
      value={{
        filter,
        groupNumber,
        navigateToFilter,
        navigateToGroup,
      }}
    >
      {children}
    </TagsNavigationContext.Provider>
  );
}

export function useTagsNavigation() {
  const context = useContext(TagsNavigationContext);
  if (!context) {
    return null;
  }
  return context;
}
