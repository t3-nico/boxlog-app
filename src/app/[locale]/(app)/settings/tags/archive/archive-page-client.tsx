'use client';

import { useEffect } from 'react';

import { TagsPageClient } from '@/features/tags/components/TagsPageClient';
import { useTagStatusStore } from '@/features/tags/stores/useTagStatusStore';

/**
 * アーカイブされたタグページ（is_active = false のタグを表示）
 *
 * マウント時にStatusストアをarchiveに設定
 */
export function ArchivePageClient() {
  const setStatus = useTagStatusStore((state) => state.setStatus);

  useEffect(() => {
    setStatus('archive');
  }, [setStatus]);

  return <TagsPageClient />;
}
