'use client';

import { useEffect } from 'react';

import { TagsPageClient } from '@/features/tags/components/TagsPageClient';
import { useTagFilterStore } from '@/features/tags/stores/useTagFilterStore';

/**
 * 未分類タグページ（group_id = null のタグを表示）
 *
 * マウント時にFilterストアをuncategorizedに設定
 */
export function UncategorizedPageClient() {
  const setSelectedGroup = useTagFilterStore((state) => state.setSelectedGroup);

  useEffect(() => {
    setSelectedGroup('uncategorized');
  }, [setSelectedGroup]);

  return <TagsPageClient />;
}
