'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

/**
 * タグページのフィルター状態
 * - all: すべてのタグ
 * - uncategorized: 未分類タグ
 * - archive: アーカイブ
 * - group-{uuid}: グループID（UUID）
 */
export type TagsFilter = 'all' | 'uncategorized' | 'archive' | `group-${string}`;

interface TagsNavigationContextValue {
  filter: TagsFilter;
  groupId: string | null;
  navigateToFilter: (filter: TagsFilter) => void;
  navigateToGroup: (groupId: string) => void;
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

  // グループIDを抽出
  const groupId = filter.startsWith('group-') ? filter.replace('group-', '') : null;

  const navigateToFilter = useCallback(
    (newFilter: TagsFilter) => {
      setFilter(newFilter); // 即座に状態更新

      // URLを同期（履歴用）- /settings/tags に移動
      let url = `/${locale}/settings/tags`;
      if (newFilter === 'uncategorized') {
        url = `/${locale}/settings/tags/uncategorized`;
      } else if (newFilter === 'archive') {
        url = `/${locale}/settings/tags/archive`;
      } else if (newFilter.startsWith('group-')) {
        const id = newFilter.replace('group-', '');
        url = `/${locale}/settings/tags/g-${id}`;
      }

      router.push(url, { scroll: false });
    },
    [router, locale],
  );

  const navigateToGroup = useCallback(
    (id: string) => {
      navigateToFilter(`group-${id}`);
    },
    [navigateToFilter],
  );

  return (
    <TagsNavigationContext.Provider
      value={{
        filter,
        groupId,
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
