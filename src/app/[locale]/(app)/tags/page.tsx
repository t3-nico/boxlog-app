import type { Metadata } from 'next';

import { TagsPageClient } from './tags-page-client';

export const metadata: Metadata = {
  title: 'タグ管理',
  description: 'タグとグループの管理',
};

export default function TagsPage() {
  return <TagsPageClient />;
}
