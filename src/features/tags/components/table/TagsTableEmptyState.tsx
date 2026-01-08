'use client';

import { Archive, FileSearch, Plus, Tag } from 'lucide-react';

import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface TagsTableEmptyStateProps {
  /** 検索クエリ */
  searchQuery: string;
  /** アーカイブ表示かどうか */
  isArchiveView: boolean;
  /** 検索クリア時のコールバック */
  onClearSearch: () => void;
  /** 新規作成時のコールバック */
  onCreate: () => void;
}

/**
 * Tagsテーブル空状態コンポーネント
 *
 * 状況に応じて異なるメッセージとアクションを表示:
 * - 検索中で0件 → Clear search
 * - アーカイブ表示で0件 → アーカイブ専用メッセージ
 * - 完全に0件 → Create tag
 */
export function TagsTableEmptyState({
  searchQuery,
  isArchiveView,
  onClearSearch,
  onCreate,
}: TagsTableEmptyStateProps) {
  const t = useTranslations();

  const isSearching = searchQuery !== '';

  // 状態に応じた表示内容
  const getEmptyStateContent = () => {
    if (isSearching) {
      return {
        icon: FileSearch,
        title: t('tag.search.noTags'),
        description: undefined,
        action: (
          <Button onClick={onClearSearch} variant="outline">
            {t('common.actions.clear')}
          </Button>
        ),
      };
    }

    if (isArchiveView) {
      return {
        icon: Archive,
        title: t('tag.archive.noArchivedTags'),
        description: undefined,
        action: null,
      };
    }

    return {
      icon: Tag,
      title: t('tag.page.noTags'),
      description: t('tag.page.addFirstTag'),
      action: (
        <Button onClick={onCreate}>
          <Plus className="mr-2 size-4" />
          {t('tag.page.createTag')}
        </Button>
      ),
    };
  };

  const { icon, title, description, action } = getEmptyStateContent();

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actions={action}
      size="md"
      centered
      className="h-64"
    />
  );
}
