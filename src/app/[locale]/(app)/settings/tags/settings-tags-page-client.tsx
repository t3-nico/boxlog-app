'use client';

import { TagsPageClient } from '@/features/tags/components/TagsPageClient';

/**
 * Settings内のタグ管理ページ
 *
 * 既存のTagsPageClientを再利用
 */
export function SettingsTagsPageClient() {
  return <TagsPageClient />;
}
