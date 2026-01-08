'use client';

import { TagsPageClient } from '@/features/tags/components/TagsPageClient';

/**
 * アーカイブされたタグページ（is_active = false のタグを表示）
 */
export function ArchivePageClient() {
  return <TagsPageClient showArchiveOnly />;
}
