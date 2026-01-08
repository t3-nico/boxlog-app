'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useTagsPageContext } from '../contexts/TagsPageContext';
import { TagsSidebar } from './TagsSidebar';

/**
 * TagsSidebarWrapper - Contextから状態を取得してTagsSidebarに渡す
 *
 * DesktopLayoutから呼び出され、TagsPageContextのデータを使用する
 */
export function TagsSidebarWrapper() {
  const { tags, isLoading, isCreatingGroup } = useTagsPageContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleAllTagsClick = useCallback(() => {
    // URLを /settings/tags に変更
    const locale = pathname?.split('/')[1] || 'ja';
    router.push(`/${locale}/settings/tags`);
  }, [router, pathname]);

  // アクティブなタグの数をカウント（is_active = true のみ）
  const activeTagsCount = useMemo(() => {
    return tags.filter((tag) => tag.is_active).length;
  }, [tags]);

  // アーカイブされたタグの数をカウント（is_active = false）
  const archivedTagsCount = useMemo(() => {
    return tags.filter((tag) => !tag.is_active).length;
  }, [tags]);

  return (
    <TagsSidebar
      onAllTagsClick={handleAllTagsClick}
      isLoading={isLoading}
      activeTagsCount={activeTagsCount}
      archivedTagsCount={archivedTagsCount}
      externalIsCreating={isCreatingGroup}
    />
  );
}
