'use client';

import { TagsPageClient } from '../tags-page-client';

/**
 * アーカイブされたタグページ（is_active = false のタグを表示）
 */
export function ArchivePageClient() {
  return <TagsPageClient showArchiveOnly />;
}
